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

	db, err := gorm.Open(postgres.New(postgres.Config{
		DSN:                  dsn,
		PreferSimpleProtocol: true,
	}), &gorm.Config{
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

	// Auto-migrate the schema (all 10 tables)
	err = db.AutoMigrate(
		// Core tables
		&models.User{},
		&models.UserStreak{},
		&models.DailyAssessment{},

		// Forum tables
		&models.ForumCategory{},
		&models.ForumPost{},
		&models.ForumComment{},
		&models.PostLike{},
		&models.CommentLike{},

		// Notification & Quote tables
		&models.Notification{},
		&models.DailyQuote{},
	)
	if err != nil {
		log.Fatalf("FATAL: Failed to auto-migrate database schema: %v", err)
	}

	// Setup Supabase Auth synchronization function and trigger
	createFuncSQL := `
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, username, role, is_anonymous, is_verified, created_at, updated_at)
  VALUES (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    'user',
    true,
    false,
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;`

	if err := db.Exec(createFuncSQL).Error; err != nil {
		log.Printf("WARNING: Failed to create handle_new_user function: %v", err)
	}

	dropTriggerSQL := `DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;`
	if err := db.Exec(dropTriggerSQL).Error; err != nil {
		log.Printf("WARNING: Failed to drop trigger: %v", err)
	}

	createTriggerSQL := `
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();`
	if err := db.Exec(createTriggerSQL).Error; err != nil {
		log.Printf("WARNING: Failed to create on_auth_user_created trigger: %v", err)
	}

	// Setup Supabase Auth update trigger for email sync
	createUpdateFuncSQL := `
CREATE OR REPLACE FUNCTION public.handle_update_user()
RETURNS trigger AS $$
BEGIN
  UPDATE public.users
  SET email = new.email,
      updated_at = now()
  WHERE id = new.id;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;`

	if err := db.Exec(createUpdateFuncSQL).Error; err != nil {
		log.Printf("WARNING: Failed to create handle_update_user function: %v", err)
	}

	dropUpdateTriggerSQL := `DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;`
	if err := db.Exec(dropUpdateTriggerSQL).Error; err != nil {
		log.Printf("WARNING: Failed to drop update trigger: %v", err)
	}

	createUpdateTriggerSQL := `
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_update_user();`
	if err := db.Exec(createUpdateTriggerSQL).Error; err != nil {
		log.Printf("WARNING: Failed to create on_auth_user_updated trigger: %v", err)
	}

	DB = db
	fmt.Println("Database connection established and schema migrated successfully.")
}
