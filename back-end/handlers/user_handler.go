package handlers

import (
	"errors"
	"net/http"

	"jeda-api/config"
	"jeda-api/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// SyncUserRequest is the request body for POST /api/users/sync.
type SyncUserRequest struct {
	Email       string `json:"email"        binding:"required,email"`
	DisplayName string `json:"display_name" binding:"required"`
	Username    string `json:"username"`
	AvatarURL   string `json:"avatar_url"`
	Role        string `json:"role"`
	IsAnonymous *bool  `json:"is_anonymous"`
	IsVerified  *bool  `json:"is_verified"`
}

// SyncUser handles POST /api/users/sync.
// Called by the mobile app after Google Sign-In to upsert the user profile.
func SyncUser(c *gin.Context) {
	// 1. Get userID from auth middleware context
	userIDStr, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "unauthorized",
			"message": "User ID not found in context",
		})
		return
	}

	// 2. Parse UUID
	userID, err := uuid.Parse(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "bad_request",
			"message": "Invalid user ID format",
		})
		return
	}

	// 3. Bind request body
	var req SyncUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "bad_request",
			"message": "Invalid request body: " + err.Error(),
		})
		return
	}

	// 4. Build the user model
	user := models.User{
		ID:          userID,
		Email:       req.Email,
		DisplayName: req.DisplayName,
		Username:    req.Username,
		AvatarURL:   req.AvatarURL,
		Role:        req.Role,
	}

	// Set boolean fields if provided
	if req.IsAnonymous != nil {
		user.IsAnonymous = *req.IsAnonymous
	} else {
		user.IsAnonymous = true // default to anonymous
	}
	if req.IsVerified != nil {
		user.IsVerified = *req.IsVerified
	}

	// 5. Upsert: insert or update on conflict (by primary key ID)
	result := config.DB.Clauses(clause.OnConflict{
		Columns: []clause.Column{{Name: "id"}},
		DoUpdates: clause.AssignmentColumns([]string{
			"email",
			"display_name",
			"username",
			"avatar_url",
			"role",
			"is_anonymous",
			"is_verified",
			"updated_at",
		}),
	}).Create(&user)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "server_error",
			"message": "Failed to sync user: " + result.Error.Error(),
		})
		return
	}

	// 6. Return the upserted user
	c.JSON(http.StatusOK, gin.H{
		"message": "User synced successfully",
		"user":    user,
	})
}

// --------------------------------------------------------------------------
// GET /api/users/me
// --------------------------------------------------------------------------

// GetMe handles GET /api/users/me.
// Returns the authenticated user's profile + streak.
func GetMe(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "unauthorized",
			"message": "Invalid or missing user ID",
		})
		return
	}

	var user models.User
	if err := config.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"error":   "not_found",
				"message": "User not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "server_error",
			"message": "Failed to fetch user: " + err.Error(),
		})
		return
	}

	// Also fetch streak if exists
	var streak models.UserStreak
	config.DB.Where("user_id = ?", userID).First(&streak)

	c.JSON(http.StatusOK, gin.H{
		"user":   user,
		"streak": streak,
	})
}

// --------------------------------------------------------------------------
// PATCH /api/users/me
// --------------------------------------------------------------------------

// UpdateMeRequest is the request body for PATCH /api/users/me.
type UpdateMeRequest struct {
	DisplayName *string `json:"display_name"`
	Username    *string `json:"username"`
	AvatarURL   *string `json:"avatar_url"`
	IsAnonymous *bool   `json:"is_anonymous"`
}

// UpdateMe handles PATCH /api/users/me.
// Updates only the fields provided in the request body.
func UpdateMe(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "unauthorized",
			"message": "Invalid or missing user ID",
		})
		return
	}

	var req UpdateMeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "bad_request",
			"message": "Invalid request body: " + err.Error(),
		})
		return
	}

	// Build update map — only include fields that were provided
	updates := map[string]interface{}{}
	if req.DisplayName != nil {
		updates["display_name"] = *req.DisplayName
	}
	if req.Username != nil {
		updates["username"] = *req.Username
	}
	if req.AvatarURL != nil {
		updates["avatar_url"] = *req.AvatarURL
	}
	if req.IsAnonymous != nil {
		updates["is_anonymous"] = *req.IsAnonymous
	}

	if len(updates) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "bad_request",
			"message": "No fields to update",
		})
		return
	}

	result := config.DB.Model(&models.User{}).Where("id = ?", userID).Updates(updates)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "server_error",
			"message": "Failed to update user: " + result.Error.Error(),
		})
		return
	}
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "not_found",
			"message": "User not found",
		})
		return
	}

	// Return updated user
	var user models.User
	config.DB.Where("id = ?", userID).First(&user)
	c.JSON(http.StatusOK, gin.H{
		"message": "Profile updated successfully",
		"user":    user,
	})
}
