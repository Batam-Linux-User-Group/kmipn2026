package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"jeda-api/config"
	"jeda-api/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// --------------------------------------------------------------------------
// Request / Response types
// --------------------------------------------------------------------------

// CreateAssessmentRequest is the request body for POST /api/assessments.
type CreateAssessmentRequest struct {
	Answers     json.RawMessage `json:"answers"      binding:"required"`
	JournalText string          `json:"journal_text"`
	TotalScore  int             `json:"total_score"   binding:"required"`
	RiskStatus  string          `json:"risk_status"   binding:"required"`
}

// TodayResponse is the response body for GET /api/assessments/today.
type TodayResponse struct {
	IsCompletedToday bool   `json:"isCompletedToday"`
	CurrentStreak    int    `json:"current_streak"`
	JournalText      string `json:"journal_text"`
}

// AssessmentResponse is the response body for POST /api/assessments.
type AssessmentResponse struct {
	Assessment models.DailyAssessment `json:"assessment"`
	Streak     models.UserStreak      `json:"streak"`
}

// --------------------------------------------------------------------------
// Helper: get today's date truncated to midnight UTC
// --------------------------------------------------------------------------

func todayDate() time.Time {
	now := time.Now().UTC()
	return time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.UTC)
}

// --------------------------------------------------------------------------
// Helper: parse userID from Gin context
// --------------------------------------------------------------------------

func getUserID(c *gin.Context) (uuid.UUID, error) {
	userIDStr, exists := c.Get("userID")
	if !exists {
		return uuid.Nil, errors.New("user ID not found in context")
	}
	return uuid.Parse(userIDStr.(string))
}

// --------------------------------------------------------------------------
// GET /api/assessments/today
// --------------------------------------------------------------------------

// GetTodayAssessment checks if the authenticated user has completed
// an assessment for the current date. Returns the completion status,
// current streak, and today's journal text.
func GetTodayAssessment(c *gin.Context) {
	// 1. Parse user ID
	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "unauthorized",
			"message": "Invalid or missing user ID",
		})
		return
	}

	today := todayDate()

	// 2. Check if assessment exists for today
	var assessment models.DailyAssessment
	assessmentResult := config.DB.
		Where("user_id = ? AND date = ?", userID, today).
		First(&assessment)

	isCompletedToday := true
	journalText := ""

	if assessmentResult.Error != nil {
		if errors.Is(assessmentResult.Error, gorm.ErrRecordNotFound) {
			isCompletedToday = false
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "server_error",
				"message": "Failed to query today's assessment: " + assessmentResult.Error.Error(),
			})
			return
		}
	} else {
		journalText = assessment.JournalText
	}

	// 3. Get current streak
	currentStreak := 0
	var streak models.UserStreak
	streakResult := config.DB.Where("user_id = ?", userID).First(&streak)
	if streakResult.Error == nil {
		currentStreak = streak.CurrentStreak
	}
	// If streak record not found, currentStreak stays 0 (no error needed)

	// 4. Return response
	c.JSON(http.StatusOK, TodayResponse{
		IsCompletedToday: isCompletedToday,
		CurrentStreak:    currentStreak,
		JournalText:      journalText,
	})
}

// --------------------------------------------------------------------------
// POST /api/assessments
// --------------------------------------------------------------------------

// CreateAssessment receives the final assessment payload and performs
// an atomic transaction to:
//  1. Upsert the daily_assessments row (OnConflict on user_id + date)
//  2. Read & compute the user's streak
//  3. Upsert the user_streaks row
func CreateAssessment(c *gin.Context) {
	// 1. Parse user ID
	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "unauthorized",
			"message": "Invalid or missing user ID",
		})
		return
	}

	// 2. Bind request body
	var req CreateAssessmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "bad_request",
			"message": "Invalid request body: " + err.Error(),
		})
		return
	}

	today := todayDate()
	yesterday := today.AddDate(0, 0, -1)

	// These will hold the results from the transaction
	var savedAssessment models.DailyAssessment
	var savedStreak models.UserStreak

	// 3. Execute atomic transaction
	txErr := config.DB.Transaction(func(tx *gorm.DB) error {

		// ------------------------------------------------------------------
		// Step 1: Upsert daily_assessments
		// ------------------------------------------------------------------
		assessment := models.DailyAssessment{
			UserID:      userID,
			Date:        today,
			Answers:     req.Answers,
			TotalScore:  req.TotalScore,
			RiskStatus:  req.RiskStatus,
			JournalText: req.JournalText,
		}

		result := tx.Clauses(clause.OnConflict{
			Columns: []clause.Column{
				{Name: "user_id"},
				{Name: "date"},
			},
			DoUpdates: clause.AssignmentColumns([]string{
				"answers",
				"total_score",
				"risk_status",
				"journal_text",
				"updated_at",
			}),
		}).Create(&assessment)

		if result.Error != nil {
			return result.Error
		}

		// Re-read the assessment to get the final state (including ID from DB)
		if err := tx.Where("user_id = ? AND date = ?", userID, today).First(&assessment).Error; err != nil {
			return err
		}
		savedAssessment = assessment

		// ------------------------------------------------------------------
		// Step 2: Read user_streaks and compute new streak values
		// ------------------------------------------------------------------
		var streak models.UserStreak
		streakResult := tx.Where("user_id = ?", userID).First(&streak)

		newCurrentStreak := 1
		newLongestStreak := 1

		if streakResult.Error != nil {
			if errors.Is(streakResult.Error, gorm.ErrRecordNotFound) {
				// No streak record exists yet — start fresh
				newCurrentStreak = 1
				newLongestStreak = 1
			} else {
				return streakResult.Error
			}
		} else {
			// Streak record exists — apply streak logic
			lastActive := time.Date(
				streak.LastActiveDate.Year(),
				streak.LastActiveDate.Month(),
				streak.LastActiveDate.Day(),
				0, 0, 0, 0, time.UTC,
			)

			switch {
			case lastActive.Equal(today):
				// Already counted today — no change
				newCurrentStreak = streak.CurrentStreak
				newLongestStreak = streak.LongestStreak

			case lastActive.Equal(yesterday):
				// Consecutive day — increment streak
				newCurrentStreak = streak.CurrentStreak + 1
				newLongestStreak = streak.LongestStreak
				if newCurrentStreak > newLongestStreak {
					newLongestStreak = newCurrentStreak
				}

			default:
				// Gap detected — reset streak to 1
				newCurrentStreak = 1
				newLongestStreak = streak.LongestStreak
				if newCurrentStreak > newLongestStreak {
					newLongestStreak = newCurrentStreak
				}
			}
		}

		// ------------------------------------------------------------------
		// Step 3: Upsert user_streaks
		// ------------------------------------------------------------------
		updatedStreak := models.UserStreak{
			UserID:         userID,
			CurrentStreak:  newCurrentStreak,
			LongestStreak:  newLongestStreak,
			LastActiveDate: today,
		}

		streakUpsertResult := tx.Clauses(clause.OnConflict{
			Columns: []clause.Column{{Name: "user_id"}},
			DoUpdates: clause.AssignmentColumns([]string{
				"current_streak",
				"longest_streak",
				"last_active_date",
				"updated_at",
			}),
		}).Create(&updatedStreak)

		if streakUpsertResult.Error != nil {
			return streakUpsertResult.Error
		}

		savedStreak = updatedStreak
		return nil
	})

	// 4. Handle transaction error
	if txErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "server_error",
			"message": "Failed to save assessment: " + txErr.Error(),
		})
		return
	}

	// 5. Return success response
	c.JSON(http.StatusOK, gin.H{
		"message":    "Assessment saved successfully",
		"assessment": savedAssessment,
		"streak":     savedStreak,
	})
}
