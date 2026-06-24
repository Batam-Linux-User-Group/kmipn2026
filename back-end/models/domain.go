package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// ==========================================================================
// 1. USERS
// ==========================================================================

// User represents the users table synced from Supabase Auth.
type User struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey"                     json:"id"`
	Email       string    `gorm:"type:varchar(255);uniqueIndex;not null"   json:"email"`
	DisplayName string    `gorm:"type:varchar(255)"                        json:"display_name"`
	Username    string    `gorm:"type:varchar(100);uniqueIndex"            json:"username"`
	AvatarURL   string    `gorm:"type:text"                                json:"avatar_url"`
	Role        string    `gorm:"type:varchar(100)"                        json:"role"`
	IsAnonymous bool      `gorm:"type:boolean;default:true"                json:"is_anonymous"`
	IsVerified  bool      `gorm:"type:boolean;default:false"               json:"is_verified"`
	CreatedAt   time.Time `gorm:"autoCreateTime"                           json:"created_at"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime"                           json:"updated_at"`
}

func (User) TableName() string {
	return "users"
}

// ==========================================================================
// 2. USER STREAKS
// ==========================================================================

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

// ==========================================================================
// 3. DAILY ASSESSMENTS
// ==========================================================================

// DailyAssessment represents the daily_assessments table.
// It has a unique composite index on (user_id, date) to ensure
// one assessment per user per day.
type DailyAssessment struct {
	ID             uuid.UUID       `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID         uuid.UUID       `gorm:"type:uuid;not null;uniqueIndex:idx_user_date"   json:"user_id"`
	Date           time.Time       `gorm:"type:date;not null;uniqueIndex:idx_user_date"   json:"date"`
	Answers        json.RawMessage `gorm:"type:jsonb"                                     json:"answers"`
	TotalScore     int             `gorm:"type:int;default:0"                             json:"total_score"`
	RiskStatus     string          `gorm:"type:varchar(50)"                               json:"risk_status"`
	Recommendation string          `gorm:"type:varchar(255)"                              json:"recommendation"`
	MainInstrument string          `gorm:"type:varchar(50)"                               json:"main_instrument"`
	TriggerCount   int             `gorm:"type:int;default:0"                             json:"trigger_count"`
	JournalText    string          `gorm:"type:text"                                      json:"journal_text"`
	CreatedAt      time.Time       `gorm:"autoCreateTime"                                 json:"created_at"`
	UpdatedAt      time.Time       `gorm:"autoUpdateTime"                                 json:"updated_at"`

	// Belongs-to relationship
	User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
}

func (DailyAssessment) TableName() string {
	return "daily_assessments"
}

// ==========================================================================
// 4. FORUM CATEGORIES
// ==========================================================================

// ForumCategory represents the forum_categories table.
// Stores available category/tag options for forum posts.
type ForumCategory struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name        string    `gorm:"type:varchar(100);uniqueIndex;not null"         json:"name"`
	Description string    `gorm:"type:text"                                      json:"description"`
	CreatedAt   time.Time `gorm:"autoCreateTime"                                 json:"created_at"`
}

func (ForumCategory) TableName() string {
	return "forum_categories"
}

// ==========================================================================
// 5. FORUM POSTS
// ==========================================================================

// ForumPost represents the forum_posts table.
// Each post belongs to a user and a category.
type ForumPost struct {
	ID            uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID        uuid.UUID `gorm:"type:uuid;not null;index"                       json:"user_id"`
	CategoryID    uuid.UUID `gorm:"type:uuid;not null;index"                       json:"category_id"`
	Content       string    `gorm:"type:text;not null"                             json:"content"`
	LikesCount    int       `gorm:"type:int;default:0"                             json:"likes_count"`
	CommentsCount int       `gorm:"type:int;default:0"                             json:"comments_count"`
	CreatedAt     time.Time `gorm:"autoCreateTime"                                 json:"created_at"`
	UpdatedAt     time.Time `gorm:"autoUpdateTime"                                 json:"updated_at"`

	// Belongs-to relationships
	User     User          `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"     json:"user,omitempty"`
	Category ForumCategory `gorm:"foreignKey:CategoryID;constraint:OnDelete:RESTRICT" json:"category,omitempty"`

	// Has-many relationships (for preloading)
	Comments []ForumComment `gorm:"foreignKey:PostID" json:"comments,omitempty"`
}

func (ForumPost) TableName() string {
	return "forum_posts"
}

// ==========================================================================
// 6. FORUM COMMENTS
// ==========================================================================

// ForumComment represents the forum_comments table.
// Supports threaded/nested comments via ParentCommentID (self-referential).
// If ParentCommentID is NULL, it is a root comment on the post.
// If ParentCommentID has a value, it is a reply to another comment.
type ForumComment struct {
	ID              uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	PostID          uuid.UUID  `gorm:"type:uuid;not null;index"                       json:"post_id"`
	UserID          uuid.UUID  `gorm:"type:uuid;not null;index"                       json:"user_id"`
	ParentCommentID *uuid.UUID `gorm:"type:uuid;index"                                json:"parent_comment_id"`
	Content         string     `gorm:"type:text;not null"                             json:"content"`
	LikesCount      int        `gorm:"type:int;default:0"                             json:"likes_count"`
	CreatedAt       time.Time  `gorm:"autoCreateTime"                                 json:"created_at"`
	UpdatedAt       time.Time  `gorm:"autoUpdateTime"                                 json:"updated_at"`

	// Belongs-to relationships
	User          User  `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"          json:"user,omitempty"`
	Post          ForumPost `gorm:"foreignKey:PostID;constraint:OnDelete:CASCADE"       json:"-"`
	ParentComment *ForumComment `gorm:"foreignKey:ParentCommentID;constraint:OnDelete:CASCADE" json:"-"`

	// Has-many: child replies
	Replies []ForumComment `gorm:"foreignKey:ParentCommentID" json:"replies,omitempty"`
}

func (ForumComment) TableName() string {
	return "forum_comments"
}

// ==========================================================================
// 7. POST LIKES (Junction Table)
// ==========================================================================

// PostLike tracks which users have liked which posts.
// Composite primary key (post_id, user_id) prevents duplicate likes.
type PostLike struct {
	PostID    uuid.UUID `gorm:"type:uuid;primaryKey" json:"post_id"`
	UserID    uuid.UUID `gorm:"type:uuid;primaryKey" json:"user_id"`
	CreatedAt time.Time `gorm:"autoCreateTime"       json:"created_at"`

	// Belongs-to relationships
	Post ForumPost `gorm:"foreignKey:PostID;constraint:OnDelete:CASCADE" json:"-"`
	User User      `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
}

func (PostLike) TableName() string {
	return "post_likes"
}

// ==========================================================================
// 8. COMMENT LIKES (Junction Table)
// ==========================================================================

// CommentLike tracks which users have liked which comments.
// Composite primary key (comment_id, user_id) prevents duplicate likes.
type CommentLike struct {
	CommentID uuid.UUID `gorm:"type:uuid;primaryKey" json:"comment_id"`
	UserID    uuid.UUID `gorm:"type:uuid;primaryKey" json:"user_id"`
	CreatedAt time.Time `gorm:"autoCreateTime"       json:"created_at"`

	// Belongs-to relationships
	Comment ForumComment `gorm:"foreignKey:CommentID;constraint:OnDelete:CASCADE" json:"-"`
	User    User         `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE"    json:"-"`
}

func (CommentLike) TableName() string {
	return "comment_likes"
}

// ==========================================================================
// 9. NOTIFICATIONS
// ==========================================================================

// Notification represents the notifications table.
// Stores in-app notifications for users (e.g., reply alerts, like alerts, streak warnings).
type Notification struct {
	ID          uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID      uuid.UUID  `gorm:"type:uuid;not null;index"                       json:"user_id"`
	Type        string     `gorm:"type:varchar(50);not null"                      json:"type"`
	Title       string     `gorm:"type:varchar(255)"                              json:"title"`
	Message     string     `gorm:"type:text"                                      json:"message"`
	ReferenceID *uuid.UUID `gorm:"type:uuid"                                      json:"reference_id"`
	IsRead      bool       `gorm:"type:boolean;default:false"                     json:"is_read"`
	CreatedAt   time.Time  `gorm:"autoCreateTime"                                 json:"created_at"`

	// Belongs-to relationship
	User User `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"-"`
}

func (Notification) TableName() string {
	return "notifications"
}

// ==========================================================================
// 10. DAILY QUOTES
// ==========================================================================

// DailyQuote represents the daily_quotes table.
// Stores motivational quotes displayed on the Home screen.
type DailyQuote struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	QuoteText string    `gorm:"type:text;not null"                             json:"quote_text"`
	Author    string    `gorm:"type:varchar(255)"                              json:"author"`
	CreatedAt time.Time `gorm:"autoCreateTime"                                 json:"created_at"`
}

func (DailyQuote) TableName() string {
	return "daily_quotes"
}
