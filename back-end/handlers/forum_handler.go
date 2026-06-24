package handlers

import (
	"errors"
	"net/http"

	"jeda-api/config"
	"jeda-api/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ==========================================================================
// Request / Response types
// ==========================================================================

// CreatePostRequest is the request body for POST /api/forum/posts.
type CreatePostRequest struct {
	CategoryID string `json:"category_id" binding:"required"`
	Content    string `json:"content"     binding:"required"`
}

// CreateCommentRequest is the request body for POST /api/forum/posts/:id/comments.
type CreateCommentRequest struct {
	Content         string  `json:"content"           binding:"required"`
	ParentCommentID *string `json:"parent_comment_id"`
}

// ==========================================================================
// CATEGORIES
// ==========================================================================

// GetCategories handles GET /api/forum/categories.
// Returns all available forum categories.
func GetCategories(c *gin.Context) {
	var categories []models.ForumCategory
	result := config.DB.Order("name ASC").Find(&categories)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "server_error",
			"message": "Failed to fetch categories: " + result.Error.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"categories": categories,
	})
}

// ==========================================================================
// POSTS
// ==========================================================================

// GetPosts handles GET /api/forum/posts.
// Supports optional query parameter ?category_id=<uuid> for filtering.
// Returns posts with preloaded User and Category data.
func GetPosts(c *gin.Context) {
	var posts []models.ForumPost

	query := config.DB.
		Preload("User").
		Preload("Category").
		Order("created_at DESC")

	// Optional filter by category
	categoryID := c.Query("category_id")
	if categoryID != "" {
		parsedID, err := uuid.Parse(categoryID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   "bad_request",
				"message": "Invalid category_id format",
			})
			return
		}
		query = query.Where("category_id = ?", parsedID)
	}

	result := query.Find(&posts)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "server_error",
			"message": "Failed to fetch posts: " + result.Error.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"posts": posts,
	})
}

// GetPostByID handles GET /api/forum/posts/:id.
// Returns a single post with preloaded User, Category, and Comments (with nested replies).
func GetPostByID(c *gin.Context) {
	postIDStr := c.Param("id")
	postID, err := uuid.Parse(postIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "bad_request",
			"message": "Invalid post ID format",
		})
		return
	}

	var post models.ForumPost
	result := config.DB.
		Preload("User").
		Preload("Category").
		Preload("Comments", "parent_comment_id IS NULL"). // Only root comments
		Preload("Comments.User").
		Preload("Comments.Replies").      // Load first-level replies
		Preload("Comments.Replies.User"). // Load reply authors
		Where("id = ?", postID).
		First(&post)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"error":   "not_found",
				"message": "Post not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "server_error",
			"message": "Failed to fetch post: " + result.Error.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"post": post,
	})
}

// CreatePost handles POST /api/forum/posts.
// Creates a new forum post for the authenticated user.
func CreatePost(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "unauthorized",
			"message": "Invalid or missing user ID",
		})
		return
	}

	var req CreatePostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "bad_request",
			"message": "Invalid request body: " + err.Error(),
		})
		return
	}

	categoryID, err := uuid.Parse(req.CategoryID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "bad_request",
			"message": "Invalid category_id format",
		})
		return
	}

	// Verify category exists
	var category models.ForumCategory
	if err := config.DB.Where("id = ?", categoryID).First(&category).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "bad_request",
			"message": "Category not found",
		})
		return
	}

	post := models.ForumPost{
		UserID:     userID,
		CategoryID: categoryID,
		Content:    req.Content,
	}

	result := config.DB.Create(&post)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "server_error",
			"message": "Failed to create post: " + result.Error.Error(),
		})
		return
	}

	// Reload with relations
	config.DB.Preload("User").Preload("Category").First(&post, "id = ?", post.ID)

	c.JSON(http.StatusCreated, gin.H{
		"message": "Post created successfully",
		"post":    post,
	})
}

// ==========================================================================
// COMMENTS
// ==========================================================================

// GetCommentsByPost handles GET /api/forum/posts/:id/comments.
// Returns all root comments for a post with nested replies.
func GetCommentsByPost(c *gin.Context) {
	postIDStr := c.Param("id")
	postID, err := uuid.Parse(postIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "bad_request",
			"message": "Invalid post ID format",
		})
		return
	}

	var comments []models.ForumComment
	result := config.DB.
		Where("post_id = ? AND parent_comment_id IS NULL", postID).
		Preload("User").
		Preload("Replies").
		Preload("Replies.User").
		Order("created_at ASC").
		Find(&comments)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "server_error",
			"message": "Failed to fetch comments: " + result.Error.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"comments": comments,
	})
}

// CreateComment handles POST /api/forum/posts/:id/comments.
// Creates a root comment or a reply (if parent_comment_id is provided).
func CreateComment(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "unauthorized",
			"message": "Invalid or missing user ID",
		})
		return
	}

	postIDStr := c.Param("id")
	postID, err := uuid.Parse(postIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "bad_request",
			"message": "Invalid post ID format",
		})
		return
	}

	// Verify post exists
	var post models.ForumPost
	if err := config.DB.Where("id = ?", postID).First(&post).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error":   "not_found",
			"message": "Post not found",
		})
		return
	}

	var req CreateCommentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "bad_request",
			"message": "Invalid request body: " + err.Error(),
		})
		return
	}

	comment := models.ForumComment{
		PostID:  postID,
		UserID:  userID,
		Content: req.Content,
	}

	// If this is a reply, set the parent comment ID
	if req.ParentCommentID != nil && *req.ParentCommentID != "" {
		parentID, err := uuid.Parse(*req.ParentCommentID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   "bad_request",
				"message": "Invalid parent_comment_id format",
			})
			return
		}

		// Verify parent comment exists and belongs to the same post
		var parentComment models.ForumComment
		if err := config.DB.Where("id = ? AND post_id = ?", parentID, postID).First(&parentComment).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   "bad_request",
				"message": "Parent comment not found or does not belong to this post",
			})
			return
		}

		comment.ParentCommentID = &parentID
	}

	// Create comment in a transaction to also update comments_count
	txErr := config.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&comment).Error; err != nil {
			return err
		}

		// Increment comments_count on the post
		if err := tx.Model(&models.ForumPost{}).
			Where("id = ?", postID).
			Update("comments_count", gorm.Expr("comments_count + 1")).Error; err != nil {
			return err
		}

		return nil
	})

	if txErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "server_error",
			"message": "Failed to create comment: " + txErr.Error(),
		})
		return
	}

	// Reload with user data
	config.DB.Preload("User").First(&comment, "id = ?", comment.ID)

	c.JSON(http.StatusCreated, gin.H{
		"message": "Comment created successfully",
		"comment": comment,
	})
}

// ==========================================================================
// LIKES
// ==========================================================================

// TogglePostLike handles POST /api/forum/posts/:id/like.
// If the user has not liked the post, it adds a like.
// If the user has already liked the post, it removes the like (unlike).
func TogglePostLike(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "unauthorized",
			"message": "Invalid or missing user ID",
		})
		return
	}

	postIDStr := c.Param("id")
	postID, err := uuid.Parse(postIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "bad_request",
			"message": "Invalid post ID format",
		})
		return
	}

	txErr := config.DB.Transaction(func(tx *gorm.DB) error {
		var existingLike models.PostLike
		result := tx.Where("post_id = ? AND user_id = ?", postID, userID).First(&existingLike)

		if result.Error != nil {
			if errors.Is(result.Error, gorm.ErrRecordNotFound) {
				// Like does not exist -> add like
				like := models.PostLike{
					PostID: postID,
					UserID: userID,
				}
				if err := tx.Create(&like).Error; err != nil {
					return err
				}
				// Increment likes_count
				return tx.Model(&models.ForumPost{}).
					Where("id = ?", postID).
					Update("likes_count", gorm.Expr("likes_count + 1")).Error
			}
			return result.Error
		}

		// Like exists -> remove like (unlike)
		if err := tx.Delete(&existingLike).Error; err != nil {
			return err
		}
		// Decrement likes_count
		return tx.Model(&models.ForumPost{}).
			Where("id = ?", postID).
			Update("likes_count", gorm.Expr("GREATEST(likes_count - 1, 0)")).Error
	})

	if txErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "server_error",
			"message": "Failed to toggle like: " + txErr.Error(),
		})
		return
	}

	// Return updated post likes_count
	var post models.ForumPost
	config.DB.Select("likes_count").Where("id = ?", postID).First(&post)

	c.JSON(http.StatusOK, gin.H{
		"message":     "Like toggled successfully",
		"likes_count": post.LikesCount,
	})
}

// ToggleCommentLike handles POST /api/forum/comments/:id/like.
// Toggle like/unlike on a comment.
func ToggleCommentLike(c *gin.Context) {
	userID, err := getUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "unauthorized",
			"message": "Invalid or missing user ID",
		})
		return
	}

	commentIDStr := c.Param("id")
	commentID, err := uuid.Parse(commentIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "bad_request",
			"message": "Invalid comment ID format",
		})
		return
	}

	txErr := config.DB.Transaction(func(tx *gorm.DB) error {
		var existingLike models.CommentLike
		result := tx.Where("comment_id = ? AND user_id = ?", commentID, userID).First(&existingLike)

		if result.Error != nil {
			if errors.Is(result.Error, gorm.ErrRecordNotFound) {
				// Like does not exist -> add like
				like := models.CommentLike{
					CommentID: commentID,
					UserID:    userID,
				}
				if err := tx.Create(&like).Error; err != nil {
					return err
				}
				return tx.Model(&models.ForumComment{}).
					Where("id = ?", commentID).
					Update("likes_count", gorm.Expr("likes_count + 1")).Error
			}
			return result.Error
		}

		// Like exists -> remove like (unlike)
		if err := tx.Delete(&existingLike).Error; err != nil {
			return err
		}
		return tx.Model(&models.ForumComment{}).
			Where("id = ?", commentID).
			Update("likes_count", gorm.Expr("GREATEST(likes_count - 1, 0)")).Error
	})

	if txErr != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "server_error",
			"message": "Failed to toggle comment like: " + txErr.Error(),
		})
		return
	}

	var comment models.ForumComment
	config.DB.Select("likes_count").Where("id = ?", commentID).First(&comment)

	c.JSON(http.StatusOK, gin.H{
		"message":     "Comment like toggled successfully",
		"likes_count": comment.LikesCount,
	})
}
