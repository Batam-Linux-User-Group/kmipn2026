package handlers

import (
	"net/http"

	"jeda-api/config"
	"jeda-api/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// ==========================================================================
// NOTIFICATIONS
// ==========================================================================

// GetNotifications handles GET /api/notifications.
// Returns all notifications for the authenticated user, ordered by newest first.
// Supports optional query parameter ?unread_only=true to filter unread notifications.
func GetNotifications(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "unauthorized",
			"message": "Invalid or missing user ID",
		})
		return
	}

	query := config.DB.
		Where("user_id = ?", userID).
		Order("created_at DESC")

	// Optional filter for unread only
	if c.Query("unread_only") == "true" {
		query = query.Where("is_read = ?", false)
	}

	var notifications []models.Notification
	result := query.Find(&notifications)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "server_error",
			"message": "Failed to fetch notifications: " + result.Error.Error(),
		})
		return
	}

	// Count unread notifications
	var unreadCount int64
	config.DB.Model(&models.Notification{}).
		Where("user_id = ? AND is_read = ?", userID, false).
		Count(&unreadCount)

	c.JSON(http.StatusOK, gin.H{
		"notifications": notifications,
		"unread_count":  unreadCount,
	})
}

// MarkNotificationRead handles PATCH /api/notifications/:id/read.
// Marks a single notification as read.
func MarkNotificationRead(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "unauthorized",
			"message": "Invalid or missing user ID",
		})
		return
	}

	notifIDStr := c.Param("id")
	notifID, err := uuid.Parse(notifIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "bad_request",
			"message": "Invalid notification ID format",
		})
		return
	}

	result := config.DB.Model(&models.Notification{}).
		Where("id = ? AND user_id = ?", notifID, userID).
		Update("is_read", true)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "server_error",
			"message": "Failed to mark notification as read: " + result.Error.Error(),
		})
		return
	}

	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "not_found",
			"message": "Notification not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Notification marked as read",
	})
}

// MarkAllNotificationsRead handles PATCH /api/notifications/read-all.
// Marks all notifications for the authenticated user as read.
func MarkAllNotificationsRead(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "unauthorized",
			"message": "Invalid or missing user ID",
		})
		return
	}

	result := config.DB.Model(&models.Notification{}).
		Where("user_id = ? AND is_read = ?", userID, false).
		Update("is_read", true)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "server_error",
			"message": "Failed to mark all notifications as read: " + result.Error.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":      "All notifications marked as read",
		"updated_count": result.RowsAffected,
	})
}
