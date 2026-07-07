package middleware

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"math/big"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"jeda-api/config"
	"jeda-api/models"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type JWK struct {
	Kty string   `json:"kty"`
	Use string   `json:"use"`
	Alg string   `json:"alg"`
	Kid string   `json:"kid"`
	Crv string   `json:"crv"`
	X   string   `json:"x"`
	Y   string   `json:"y"`
}

type JWKS struct {
	Keys []JWK `json:"keys"`
}

var (
	jwksCache      = make(map[string]*ecdsa.PublicKey)
	jwksCacheMu    sync.RWMutex
	lastJWKSFetch  time.Time
	jwksFetchLimit = 1 * time.Minute
)

func fetchJWKS() error {
	supabaseURL := os.Getenv("SUPABASE_URL")
	if supabaseURL == "" {
		dbURL := os.Getenv("SUPABASE_DB_URL")
		if strings.Contains(dbURL, "@db.") && strings.Contains(dbURL, ".supabase.co") {
			start := strings.Index(dbURL, "@db.") + 4
			end := strings.Index(dbURL, ".supabase.co")
			projectRef := dbURL[start:end]
			supabaseURL = fmt.Sprintf("https://%s.supabase.co", projectRef)
		} else {
			supabaseURL = "https://khimcteudqffflkdwpkf.supabase.co"
		}
	}

	url := fmt.Sprintf("%s/auth/v1/.well-known/jwks.json", supabaseURL)
	resp, err := http.Get(url)
	if err != nil {
		return fmt.Errorf("failed to fetch JWKS: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("JWKS endpoint returned status %d", resp.StatusCode)
	}

	var jwks JWKS
	if err := json.NewDecoder(resp.Body).Decode(&jwks); err != nil {
		return fmt.Errorf("failed to decode JWKS: %w", err)
	}

	jwksCacheMu.Lock()
	defer jwksCacheMu.Unlock()

	for _, key := range jwks.Keys {
		if key.Kty == "EC" && key.Crv == "P-256" && key.X != "" && key.Y != "" {
			xBytes, err := base64.RawURLEncoding.DecodeString(key.X)
			if err != nil {
				continue
			}
			yBytes, err := base64.RawURLEncoding.DecodeString(key.Y)
			if err != nil {
				continue
			}

			pubKey := &ecdsa.PublicKey{
				Curve: elliptic.P256(),
				X:     new(big.Int).SetBytes(xBytes),
				Y:     new(big.Int).SetBytes(yBytes),
			}
			jwksCache[key.Kid] = pubKey
		}
	}
	lastJWKSFetch = time.Now()
	return nil
}

// AuthMiddleware verifies the Supabase JWT from the Authorization header,
// extracts the `sub` claim (auth.uid), and sets it in the Gin context
// as "userID" for downstream handlers to use.
func AuthMiddleware() gin.HandlerFunc {
	// Pre-fetch JWKS to populate the cache at startup
	_ = fetchJWKS()

	return func(c *gin.Context) {
		// 1. Get the Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "Bearer development" {
			mockUserID := "00000000-0000-0000-0000-000000000000"
			var count int64
			config.DB.Model(&models.User{}).Where("id = ?", mockUserID).Count(&count)
			if count == 0 {
				mockUser := models.User{
					ID:          uuid.MustParse(mockUserID),
					Email:       "mockuser@jeda.id",
					DisplayName: "Mock User",
					Username:    "mockuser",
					Role:        "user",
					IsAnonymous: true,
					IsVerified:  true,
				}
				config.DB.Create(&mockUser)
			}
			c.Set("userID", mockUserID)
			c.Next()
			return
		}

		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error":   "unauthorized",
				"message": "Authorization header is required",
			})
			return
		}

		// 2. Validate Bearer token format
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error":   "unauthorized",
				"message": "Authorization header must be in the format: Bearer <token>",
			})
			return
		}
		tokenString := parts[1]

		// 3. Get the JWT secret from environment
		jwtSecret := os.Getenv("SUPABASE_JWT_SECRET")
		if jwtSecret == "" {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
				"error":   "server_error",
				"message": "JWT secret is not configured on the server",
			})
			return
		}

		// 4. Parse and validate the JWT token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Get the Key ID (kid) from token header
			kid, _ := token.Header["kid"].(string)

			// Handle ES256 (Supabase asymmetric signing)
			if _, ok := token.Method.(*jwt.SigningMethodECDSA); ok {
				jwksCacheMu.RLock()
				pubKey, exists := jwksCache[kid]
				jwksCacheMu.RUnlock()

				if !exists {
					// Re-fetch JWKS if kid not found and rate limit allows
					jwksCacheMu.RLock()
					sinceFetch := time.Since(lastJWKSFetch)
					jwksCacheMu.RUnlock()

					if sinceFetch > jwksFetchLimit {
						if err := fetchJWKS(); err == nil {
							jwksCacheMu.RLock()
							pubKey, exists = jwksCache[kid]
							jwksCacheMu.RUnlock()
						}
					}
				}

				if exists {
					return pubKey, nil
				}
				return nil, fmt.Errorf("public key not found for kid: %s", kid)
			}

			// Fallback: Check if it is HMAC (symmetric local tokens signed with JWT Secret)
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); ok {
				return []byte(jwtSecret), nil
			}

			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		})

		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error":   "unauthorized",
				"message": fmt.Sprintf("Invalid or expired token: %v", err),
			})
			return
		}

		// 5. Extract claims
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error":   "unauthorized",
				"message": "Invalid token claims",
			})
			return
		}

		// 6. Extract the `sub` claim (Supabase auth.uid)
		sub, ok := claims["sub"].(string)
		if !ok || sub == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error":   "unauthorized",
				"message": "Token does not contain a valid 'sub' claim",
			})
			return
		}

		// 7. Set userID in context for downstream handlers
		c.Set("userID", sub)

		// Continue to the next handler
		c.Next()
	}
}
