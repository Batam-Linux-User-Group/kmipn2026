package middleware

import (
	"fmt"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// AuthMiddleware verifies the Supabase JWT from the Authorization header,
// extracts the `sub` claim (auth.uid), and sets it in the Gin context
// as "userID" for downstream handlers to use.
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Get the Authorization header
		authHeader := c.GetHeader("Authorization")
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
			// Ensure the signing method is HMAC (Supabase uses HS256)
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(jwtSecret), nil
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
