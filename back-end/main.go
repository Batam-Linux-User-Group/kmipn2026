package main

import (
	"log"
	"os"

	"jeda-api/config"
	"jeda-api/handlers"
	"jeda-api/middleware"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// 1. Load environment variables from .env file
	if err := godotenv.Load(); err != nil {
		log.Println("WARNING: No .env file found, falling back to system environment variables")
	}

	// 2. Connect to the database and run migrations
	config.ConnectDB()

	// 3. Initialize Gin router with default middleware (Logger + Recovery)
	router := gin.Default()

	// 4. Health check endpoint (public, no auth required)
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"service": "JEDA API",
		})
	})

	// 5. Protected API routes -- all require Supabase JWT
	api := router.Group("/api")
	api.Use(middleware.AuthMiddleware())
	{
		// ── User routes ──────────────────────────────────────────────
		api.POST("/users/sync", handlers.SyncUser)
		api.GET("/users/me", handlers.GetMe)
		api.PATCH("/users/me", handlers.UpdateMe)

		// ── Assessment routes ────────────────────────────────────────
		api.GET("/assessments/today", handlers.GetTodayAssessment)
		api.GET("/assessments/history", handlers.GetAssessmentHistory)
		api.POST("/assessments", handlers.CreateAssessment)

		// ── Forum: Categories ────────────────────────────────────────
		api.GET("/forum/categories", handlers.GetCategories)

		// ── Forum: Posts ─────────────────────────────────────────────
		api.GET("/forum/posts", handlers.GetPosts)
		api.GET("/forum/posts/:id", handlers.GetPostByID)
		api.POST("/forum/posts", handlers.CreatePost)
		api.POST("/forum/posts/:id/like", handlers.TogglePostLike)

		// ── Forum: Comments ──────────────────────────────────────────
		api.GET("/forum/posts/:id/comments", handlers.GetCommentsByPost)
		api.POST("/forum/posts/:id/comments", handlers.CreateComment)
		api.POST("/forum/comments/:id/like", handlers.ToggleCommentLike)

		// ── Notifications ────────────────────────────────────────────
		api.GET("/notifications", handlers.GetNotifications)
		api.PATCH("/notifications/:id/read", handlers.MarkNotificationRead)
		api.PATCH("/notifications/read-all", handlers.MarkAllNotificationsRead)

		// ── Daily Quotes ─────────────────────────────────────────────
		api.GET("/quotes/random", handlers.GetRandomQuote)
		api.GET("/quotes", handlers.GetAllQuotes)
	}

	// 6. Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("JEDA API server starting on port %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("FATAL: Failed to start server: %v", err)
	}
}
