// src/store/useAssessmentStore.ts
// Zustand store for assessment state management.
// Journal text is kept purely in local state — no Supabase calls here.

import { create } from 'zustand';
import { getRiskStatus } from '@/data/assessmentData';

interface AnswerRecord {
  optionText: string;
  score: number;
}

interface AssessmentState {
  // Current position in the DAG
  currentNodeId: string;

  // All answers keyed by node ID
  answers: Record<string, AnswerRecord>;

  // Running total score
  totalScore: number;

  // Self journal text (local only, no DB persistence yet)
  journalText: string;

  // Navigation history stack for "Kembali" button
  history: string[];

  // The next node to go to after breathing screen
  pendingNextNodeId: string | null;

  // Actions
  selectOption: (nodeId: string, optionText: string, score: number) => void;
  goToNode: (nodeId: string) => void;
  goBack: () => boolean; // returns false if cannot go back
  setJournalText: (text: string) => void;
  setPendingNextNodeId: (nodeId: string | null) => void;
  reset: () => void;
  getRiskStatus: () => { status: string; recommendation: string };
}

const initialState = {
  currentNodeId: 'start',
  answers: {} as Record<string, AnswerRecord>,
  totalScore: 0,
  journalText: '',
  history: [] as string[],
  pendingNextNodeId: null as string | null,
};

export const useAssessmentStore = create<AssessmentState>((set, get) => ({
  ...initialState,

  selectOption: (nodeId: string, optionText: string, score: number) => {
    set((state) => {
      // If re-answering a question, subtract old score first
      const oldAnswer = state.answers[nodeId];
      const oldScore = oldAnswer ? oldAnswer.score : 0;

      return {
        answers: {
          ...state.answers,
          [nodeId]: { optionText, score },
        },
        totalScore: state.totalScore - oldScore + score,
      };
    });
  },

  goToNode: (nodeId: string) => {
    set((state) => ({
      history: [...state.history, state.currentNodeId],
      currentNodeId: nodeId,
    }));
  },

  goBack: () => {
    const { history } = get();
    if (history.length === 0) return false;

    const previousNodeId = history[history.length - 1];
    set((state) => ({
      currentNodeId: previousNodeId,
      history: state.history.slice(0, -1),
    }));
    return true;
  },

  setJournalText: (text: string) => {
    set({ journalText: text });
  },

  setPendingNextNodeId: (nodeId: string | null) => {
    set({ pendingNextNodeId: nodeId });
  },

  reset: () => {
    set(initialState);
  },

  getRiskStatus: () => {
    return getRiskStatus(get().totalScore);
  },
}));
