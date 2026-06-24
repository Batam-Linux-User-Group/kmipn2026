package handlers

import (
	"net/http"

	"jeda-api/config"
	"jeda-api/models"

	"github.com/gin-gonic/gin"
)

// ==========================================================================
// DAILY QUOTES
// ==========================================================================

// GetRandomQuote handles GET /api/quotes/random.
// Returns a random motivational quote from the daily_quotes table.
func GetRandomQuote(c *gin.Context) {
	var quote models.DailyQuote

	// PostgreSQL: ORDER BY RANDOM() LIMIT 1
	result := config.DB.Order("RANDOM()").First(&quote)
	if result.Error != nil {
		// If no quotes exist, return a default quote
		c.JSON(http.StatusOK, gin.H{
			"quote": gin.H{
				"quote_text": "Investasi yang sehat dimulai dengan perencanaan yang matang, bukan dorongan impulsif.",
				"author":     "Prinsip Investasi Sehat",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"quote": quote,
	})
}

// GetAllQuotes handles GET /api/quotes.
// Returns all quotes (useful for admin/seeding purposes).
func GetAllQuotes(c *gin.Context) {
	var quotes []models.DailyQuote
	result := config.DB.Order("created_at DESC").Find(&quotes)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "server_error",
			"message": "Failed to fetch quotes: " + result.Error.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"quotes": quotes,
	})
}
