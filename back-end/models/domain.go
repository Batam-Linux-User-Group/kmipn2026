package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// User represents the users table synced from Supabase Auth.
type User struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey"                     json:"id"`
	Email       string    `gorm:"type:varchar(255);uniqueIndex;not null"   json:"email"`
	DisplayName string    `gorm:"type:varchar(255)"                        json:"display_name"`
	AvatarURL   string    `gorm:"type:text"                                json:"avatar_url"`
	CreatedAt   time.Time `gorm:"autoCreateTime"                           json:"created_at"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime"                           json:"updated_at"`
}

func (User) TableName() string {
	return "users"
}

// DailyAssessment represents the daily_assessments table.
// It has a unique composite index on (user_id, date) to ensure
// one assessment per user per day.
type DailyAssessment struct {
	ID         uuid.UUID       `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"          json:"id"`
	UserID     uuid.UUID       `gorm:"type:uuid;not null;uniqueIndex:idx_user_date"            json:"user_id"`
	Date       time.Time       `gorm:"type:date;not null;uniqueIndex:idx_user_date"            json:"date"`
	Answers    json.RawMessage `gorm:"type:jsonb"                                              json:"answers"`
	TotalScore int             `gorm:"type:int;default:0"                                      json:"total_score"`
	RiskStatus string          `gorm:"type:varchar(50)"                                        json:"risk_status"`
	JournalText string         `gorm:"type:text"                                               json:"journal_text"`
	CreatedAt  time.Time       `gorm:"autoCreateTime"                                          json:"created_at"`
	UpdatedAt  time.Time       `gorm:"autoUpdateTime"                                          json:"updated_at"`

	// Belongs-to relationship
	User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"           json:"-"`
}

func (DailyAssessment) TableName() string {
	return "daily_assessments"
}

// UserStreak tracks the user's daily streak information.
type UserStreak struct {
	UserID         uuid.UUID `gorm:"type:uuid;primaryKey"    json:"user_id"`
	CurrentStreak  int       `gorm:"type:int;default:0"      json:"current_streak"`
	LongestStreak  int       `gorm:"type:int;default:0"      json:"longest_streak"`
	LastActiveDate time.Time `gorm:"type:date"               json:"last_active_date"`
	CreatedAt      time.Time `gorm:"autoCreateTime"          json:"created_at"`
	UpdatedAt      time.Time `gorm:"autoUpdateTime"          json:"updated_at"`

	// Belongs-to relationship
	User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
}

func (UserStreak) TableName() string {
	return "user_streaks"
}
