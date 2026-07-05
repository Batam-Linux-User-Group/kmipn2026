// src/store/useForumStore.ts
// Zustand store untuk forum — wraps forumApi dari services/api.ts.
// Menyimpan posts, categories, detail post, dan handling optimistic updates.

import { create } from 'zustand';
import {
  ForumCategory,
  ForumComment,
  ForumPost,
  forumApi,
} from '@/services/api';

interface ForumState {
  // List screen
  posts: ForumPost[];
  categories: ForumCategory[];
  isLoadingPosts: boolean;
  isLoadingCategories: boolean;
  postsError: string | null;

  // Detail screen
  activePost: ForumPost | null;
  isLoadingDetail: boolean;
  detailError: string | null;

  // Create
  isCreatingPost: boolean;

  // Comment
  isSubmittingComment: boolean;

  // Actions
  fetchCategories: () => Promise<void>;
  fetchPosts: (categoryId?: string) => Promise<void>;
  fetchPostDetail: (id: string) => Promise<void>;
  createPost: (categoryId: string, content: string) => Promise<boolean>;
  togglePostLike: (postId: string) => Promise<void>;
  createComment: (postId: string, content: string, parentCommentId?: string | null) => Promise<void>;
  toggleCommentLike: (commentId: string) => Promise<void>;
  reset: () => void;
}

const initialState = {
  posts: [] as ForumPost[],
  categories: [] as ForumCategory[],
  isLoadingPosts: false,
  isLoadingCategories: false,
  postsError: null as string | null,
  activePost: null as ForumPost | null,
  isLoadingDetail: false,
  detailError: null as string | null,
  isCreatingPost: false,
  isSubmittingComment: false,
};

export const useForumStore = create<ForumState>((set, get) => ({
  ...initialState,

  fetchCategories: async () => {
    set({ isLoadingCategories: true });
    try {
      const res = await forumApi.getCategories();
      set({ categories: res.categories });
    } catch (err) {
      console.error('[Forum] fetchCategories error:', err);
    } finally {
      set({ isLoadingCategories: false });
    }
  },

  fetchPosts: async (categoryId?: string) => {
    set({ isLoadingPosts: true, postsError: null });
    try {
      const res = await forumApi.getPosts(categoryId);
      set({ posts: res.posts });
    } catch (err) {
      const msg = (err as Error).message ?? 'Gagal memuat postingan';
      set({ postsError: msg });
      console.error('[Forum] fetchPosts error:', err);
    } finally {
      set({ isLoadingPosts: false });
    }
  },

  fetchPostDetail: async (id: string) => {
    set({ isLoadingDetail: true, detailError: null, activePost: null });
    try {
      const res = await forumApi.getPost(id);
      set({ activePost: res.post });
    } catch (err) {
      const msg = (err as Error).message ?? 'Gagal memuat postingan';
      set({ detailError: msg });
      console.error('[Forum] fetchPostDetail error:', err);
    } finally {
      set({ isLoadingDetail: false });
    }
  },

  createPost: async (categoryId: string, content: string) => {
    set({ isCreatingPost: true });
    try {
      const res = await forumApi.createPost({ category_id: categoryId, content });
      // Prepend baru ke list
      set((state) => ({ posts: [res.post, ...state.posts] }));
      return true;
    } catch (err) {
      console.error('[Forum] createPost error:', err);
      return false;
    } finally {
      set({ isCreatingPost: false });
    }
  },

  togglePostLike: async (postId: string) => {
    // Optimistic update
    set((state) => ({
      posts: state.posts.map((p) =>
        p.id === postId ? { ...p, likes_count: p.likes_count + 1 } : p
      ),
      activePost:
        state.activePost?.id === postId
          ? { ...state.activePost, likes_count: state.activePost.likes_count + 1 }
          : state.activePost,
    }));

    try {
      const res = await forumApi.togglePostLike(postId);
      // Sync dengan nilai aktual dari server
      set((state) => ({
        posts: state.posts.map((p) =>
          p.id === postId ? { ...p, likes_count: res.likes_count } : p
        ),
        activePost:
          state.activePost?.id === postId
            ? { ...state.activePost, likes_count: res.likes_count }
            : state.activePost,
      }));
    } catch (err) {
      console.error('[Forum] togglePostLike error:', err);
      // Revert optimistic update
      set((state) => ({
        posts: state.posts.map((p) =>
          p.id === postId ? { ...p, likes_count: p.likes_count - 1 } : p
        ),
      }));
    }
  },

  createComment: async (postId: string, content: string, parentCommentId?: string | null) => {
    set({ isSubmittingComment: true });
    try {
      const res = await forumApi.createComment(postId, {
        content,
        parent_comment_id: parentCommentId ?? null,
      });
      // Append komentar baru ke activePost
      set((state) => {
        if (!state.activePost || state.activePost.id !== postId) return {};
        const newComment = res.comment;
        const updatedComments = [...(state.activePost.comments ?? []), newComment];
        return {
          activePost: {
            ...state.activePost,
            comments: updatedComments,
            comments_count: state.activePost.comments_count + 1,
          },
        };
      });
    } catch (err) {
      console.error('[Forum] createComment error:', err);
    } finally {
      set({ isSubmittingComment: false });
    }
  },

  toggleCommentLike: async (commentId: string) => {
    try {
      const res = await forumApi.toggleCommentLike(commentId);
      // Update likes_count di comment yang sesuai
      set((state) => {
        if (!state.activePost) return {};
        const updatedComments = (state.activePost.comments ?? []).map((c) =>
          c.id === commentId ? { ...c, likes_count: res.likes_count } : c
        );
        return { activePost: { ...state.activePost, comments: updatedComments } };
      });
    } catch (err) {
      console.error('[Forum] toggleCommentLike error:', err);
    }
  },

  reset: () => set(initialState),
}));
