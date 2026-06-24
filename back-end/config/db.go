package config

import (
	"fmt"
	"log"
	"os"

	"jeda-api/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// DB holds the global database connection instance.
var DB *gorm.DB

// ConnectDB initializes the GORM database connection using the
// SUPABASE_DB_URL environment variable and runs AutoMigrate.
func ConnectDB() {
	dsn := os.Getenv("SUPABASE_DB_URL")
	if dsn == "" {
		log.Fatal("FATAL: SUPABASE_DB_URL environment variable is not set")
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		log.Fatalf("FATAL: Failed to connect to database: %v", err)
	}

	// Configure connection pool
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("FATAL: Failed to get underlying sql.DB: %v", err)
	}
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)

	// Auto-migrate the schema
	err = db.AutoMigrate(
		&models.User{},
		&models.DailyAssessment{},
		&models.UserStreak{},
	)
	if err != nil {
		log.Fatalf("FATAL: Failed to auto-migrate database schema: %v", err)
	}

	DB = db
	fmt.Println("Database connection established and schema migrated successfully.")
}
