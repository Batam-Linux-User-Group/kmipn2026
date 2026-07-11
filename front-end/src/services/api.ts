// src/services/api.ts
// Central API client for JEDA REST backend.
// Automatically attaches Supabase JWT to every request.

import { supabase } from './supabase';

const API_BASE_URL: string =
  process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8080';
// 10.0.2.2 → Android emulator loopback to host machine.
// For physical device / production, set EXPO_PUBLIC_API_URL in .env

// --------------------------------------------------------------------------
// Types (mirrors backend models/domain.go)
// --------------------------------------------------------------------------

export interface User {
  id: string;
  email: string;
  display_name: string;
  username: string;
  avatar_url: string;
  role: string;
  is_anonymous: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserStreak {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_active_date: string;
}

export interface DailyAssessment {
  id: string;
  user_id: string;
  date: string;
  answers: Record<string, { optionText: string; score: number }>;
  total_score: number;
  risk_status: string;
  recommendation: string;
  main_instrument: string;
  trigger_count: number;
  journal_text: string;
  created_at: string;
  updated_at: string;
}

export interface TodayStatus {
  isCompletedToday: boolean;
  current_streak: number;
  journal_text: string;
  risk_status: string;
}

export interface AssessmentHistoryEntry {
  date: string;
  total_score: number;
  risk_status: string;
  recommendation: string;
  main_instrument: string;
  trigger_count: number;
  journal_text: string;
}

export interface AssessmentHistoryResponse {
  history: AssessmentHistoryEntry[];
  current_streak: number;
  longest_streak: number;
  days_requested: number;
}

export interface DailyQuote {
  id: string;
  quote_text: string;
  author: string;
  created_at: string;
}

export interface CreateAssessmentPayload {
  answers: Record<string, { optionText: string; score: number }>;
  journal_text: string;
  total_score: number;
  risk_status: string;
  recommendation: string;
  main_instrument: string;
  trigger_count: number;
}

// --------------------------------------------------------------------------
// Core fetch wrapper
// --------------------------------------------------------------------------

async function getAuthToken(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? 'development';
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errBody = await response.json();
      errorMessage = errBody.message ?? errBody.error ?? errorMessage;
    } catch {
      // ignore parse error
    }
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}

// --------------------------------------------------------------------------
// Users
// --------------------------------------------------------------------------

export const usersApi = {
  /** Sync Supabase Auth user to our database after login. */
  sync: (payload: { email: string; display_name: string; username?: string; avatar_url: string }) =>
    apiFetch<{ message: string; user: User }>('/api/users/sync', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  /** Get current authenticated user profile + streak. */
  getMe: () =>
    apiFetch<{
      user: User;
      streak: UserStreak;
      posts_count: number;
      comments_count: number;
      likes_count: number;
    }>('/api/users/me'),

  /** Update current user profile (partial update). */
  updateMe: (payload: {
    display_name?: string;
    username?: string;
    avatar_url?: string;
    is_anonymous?: boolean;
  }) =>
    apiFetch<{ message: string; user: User }>('/api/users/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  /** Delete current user profile. */
  deleteMe: () =>
    apiFetch<{ message: string }>('/api/users/me', {
      method: 'DELETE',
    }),
};

// --------------------------------------------------------------------------
// Assessments
// --------------------------------------------------------------------------

export const assessmentsApi = {
  /** Check if user completed today's assessment + get current streak. */
  getToday: () => apiFetch<TodayStatus>('/api/assessments/today'),

  /** Submit completed assessment result. */
  create: (payload: CreateAssessmentPayload) =>
    apiFetch<{ message: string; assessment: DailyAssessment; streak: UserStreak }>(
      '/api/assessments',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    ),

  /** Get assessment history (last N days, default 7). */
  getHistory: (days = 7) =>
    apiFetch<AssessmentHistoryResponse>(`/api/assessments/history?days=${days}`),

  /** Update today's journal text, or create a blank assessment with journal. */
  updateJournal: (journalText: string) =>
    apiFetch<{ message: string; journal_text: string }>('/api/assessments/today/journal', {
      method: 'PATCH',
      body: JSON.stringify({ journal_text: journalText }),
    }),
};

// --------------------------------------------------------------------------
// Quotes
// --------------------------------------------------------------------------

export const quotesApi = {
  /** Get a random motivational quote. */
  getRandom: () => apiFetch<DailyQuote>('/api/quotes/random'),
};

// --------------------------------------------------------------------------
// Forum
// --------------------------------------------------------------------------

export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface ForumPost {
  id: string;
  user_id: string;
  category_id: string;
  content: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  user?: User;
  category?: ForumCategory;
  comments?: ForumComment[];
}

export interface ForumComment {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id: string | null;
  content: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
  user?: User;
  replies?: ForumComment[];
}

export const forumApi = {
  getCategories: () =>
    apiFetch<{ categories: ForumCategory[] }>('/api/forum/categories'),

  getPosts: (categoryId?: string) => {
    const qs = categoryId ? `?category_id=${categoryId}` : '';
    return apiFetch<{ posts: ForumPost[] }>(`/api/forum/posts${qs}`);
  },

  getPost: (id: string) =>
    apiFetch<{ post: ForumPost }>(`/api/forum/posts/${id}`),

  createPost: (payload: { category_id: string; content: string }) =>
    apiFetch<{ message: string; post: ForumPost }>('/api/forum/posts', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  togglePostLike: (postId: string) =>
    apiFetch<{ message: string; likes_count: number }>(
      `/api/forum/posts/${postId}/like`,
      { method: 'POST' }
    ),

  getComments: (postId: string) =>
    apiFetch<{ comments: ForumComment[] }>(
      `/api/forum/posts/${postId}/comments`
    ),

  createComment: (
    postId: string,
    payload: { content: string; parent_comment_id?: string | null }
  ) =>
    apiFetch<{ message: string; comment: ForumComment }>(
      `/api/forum/posts/${postId}/comments`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    ),

  toggleCommentLike: (commentId: string) =>
    apiFetch<{ message: string; likes_count: number }>(
      `/api/forum/comments/${commentId}/like`,
      { method: 'POST' }
    ),
};

// --------------------------------------------------------------------------
// Notifications
// --------------------------------------------------------------------------

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  reference_id: string | null;
  is_read: boolean;
  created_at: string;
}

export const notificationsApi = {
  getAll: () =>
    apiFetch<{ notifications: Notification[] }>('/api/notifications'),

  markRead: (id: string) =>
    apiFetch<{ message: string }>(`/api/notifications/${id}/read`, {
      method: 'PATCH',
    }),

  markAllRead: () =>
    apiFetch<{ message: string }>('/api/notifications/read-all', {
      method: 'PATCH',
    }),
};