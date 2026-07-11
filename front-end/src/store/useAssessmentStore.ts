// src/store/useAssessmentStore.ts
// Zustand store for assessment state management.

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

  // Self journal text
  journalText: string;

  // Trading plan fields
  tradingPlan: {
    entry: string;
    price: string;
    tpSl: string;
    reason: string;
  } | null;

  // Navigation history stack for "Kembali" button
  history: string[];

  // The next node to go to after breathing screen
  pendingNextNodeId: string | null;

  // Derived metadata (populated as user progresses)
  triggerCount: number;       // how many isTrigger options were hit
  mainInstrument: string;     // 'Saham' | 'Crypto' | ''

  // Actions
  selectOption: (nodeId: string, optionText: string, score: number, isTrigger?: boolean) => void;
  goToNode: (nodeId: string) => void;
  goBack: () => boolean;
  setJournalText: (text: string) => void;
  setTradingPlan: (plan: { entry: string; price: string; tpSl: string; reason: string } | null) => void;
  setPendingNextNodeId: (nodeId: string | null) => void;
  setMainInstrument: (instrument: string) => void;
  reset: () => void;
  getRiskStatus: () => { status: string; recommendation: string };
}

const initialState = {
  currentNodeId: 'start',
  answers: {} as Record<string, AnswerRecord>,
  totalScore: 0,
  journalText: '',
  tradingPlan: null as { entry: string; price: string; tpSl: string; reason: string } | null,
  history: [] as string[],
  pendingNextNodeId: null as string | null,
  triggerCount: 0,
  mainInstrument: '',
};

export const useAssessmentStore = create<AssessmentState>((set, get) => ({
  ...initialState,

  selectOption: (nodeId: string, optionText: string, score: number, isTrigger = false) => {
    set((state) => {
      // If re-answering a question, subtract old score first
      const oldAnswer = state.answers[nodeId];
      const oldScore = oldAnswer ? oldAnswer.score : 0;

      // Track trigger count changes (if previously answered, adjust delta)
      const wasTrigger = false; // simplified — triggers not un-triggerable
      const triggerDelta = isTrigger && !wasTrigger ? 1 : 0;

      return {
        answers: {
          ...state.answers,
          [nodeId]: { optionText, score },
        },
        totalScore: state.totalScore - oldScore + score,
        triggerCount: state.triggerCount + triggerDelta,
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

  setTradingPlan: (plan) => {
    set({ tradingPlan: plan });
  },

  setPendingNextNodeId: (nodeId: string | null) => {
    set({ pendingNextNodeId: nodeId });
  },

  setMainInstrument: (instrument: string) => {
    set({ mainInstrument: instrument });
  },

  reset: () => {
    set(initialState);
  },

  getRiskStatus: () => {
    return getRiskStatus(get().totalScore);
  },
}));
