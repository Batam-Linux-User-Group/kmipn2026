/**
 * useAssessmentStore.ts
 *
 * Zustand store untuk mengelola state Modul Asesmen Awal JEDA.
 * Menangani:
 *   - Navigasi DAG (pohon keputusan non-linear)
 *   - Backstack untuk navigasi mundur
 *   - Akumulasi skor global
 *   - Deteksi trigger intervensi krisis (isTrigger)
 *   - Riwayat asesmen sebelumnya
 */

import { create } from 'zustand';

import {
  type Option,
  type ResultCategory,
  assessmentTree,
  getNodeById,
  getResultCategory,
} from '@/data/assessmentData';

// ─── Types ───────────────────────────────────────────────────────────────

interface AnswerRecord {
  nodeId: string;
  optionId: string;
  points: number;
}

interface AssessmentHistoryEntry {
  id: string;
  timestamp: number;
  totalScore: number;
  category: ResultCategory;
  answers: AnswerRecord[];
}

interface AssessmentState {
  // ── Navigasi ──
  currentNodeId: string;
  selectedOptionId: string | null;
  backStack: string[];

  // ── Skor ──
  answers: AnswerRecord[];
  totalScore: number;

  // ── Status ──
  isAssessmentActive: boolean;
  isCompleted: boolean;
  pendingTrigger: boolean; // true jika harus navigasi ke BreathingScreen

  // ── Riwayat ──
  history: AssessmentHistoryEntry[];
}

interface AssessmentActions {
  /** Memulai asesmen baru dari node 'start'. */
  startAssessment: () => void;

  /** Memilih opsi pada node aktif (belum pindah ke node berikutnya). */
  selectOption: (optionId: string) => void;

  /**
   * Memproses transisi ke node berikutnya.
   * Mengembalikan nextNodeId yang harus di-navigasi, atau 'result' jika selesai.
   * Mengembalikan 'breathing' jika isTrigger aktif.
   */
  nextQuestion: () => 'result' | 'breathing' | string;

  /** Kembali ke pertanyaan sebelumnya melalui backstack. */
  prevQuestion: () => boolean; // true jika berhasil mundur

  /** Menandai bahwa trigger breathing sudah selesai, lanjut ke node berikutnya. */
  clearTrigger: () => void;

  /** Menyimpan hasil asesmen ke riwayat dan menandai selesai. */
  completeAssessment: () => void;

  /** Mereset seluruh state asesmen. */
  reset: () => void;
}

// ─── Initial State ───────────────────────────────────────────────────────

const initialState: AssessmentState = {
  currentNodeId: 'start',
  selectedOptionId: null,
  backStack: [],
  answers: [],
  totalScore: 0,
  isAssessmentActive: false,
  isCompleted: false,
  pendingTrigger: false,
  history: [],
};

// ─── Store ───────────────────────────────────────────────────────────────

export const useAssessmentStore = create<AssessmentState & AssessmentActions>()(
  (set, get) => ({
    ...initialState,

    startAssessment: () => {
      set({
        ...initialState,
        history: get().history, // Pertahankan riwayat
        isAssessmentActive: true,
      });
    },

    selectOption: (optionId: string) => {
      set({ selectedOptionId: optionId });
    },

    nextQuestion: () => {
      const { currentNodeId, selectedOptionId, answers, totalScore, backStack } =
        get();

      if (!selectedOptionId) return currentNodeId; // Seharusnya tidak terjadi (tombol disabled)

      const currentNode = getNodeById(currentNodeId);
      if (!currentNode) return currentNodeId;

      const selectedOption = currentNode.options.find(
        (opt: Option) => opt.id === selectedOptionId
      );
      if (!selectedOption) return currentNodeId;

      // Catat jawaban
      const newAnswer: AnswerRecord = {
        nodeId: currentNodeId,
        optionId: selectedOption.id,
        points: selectedOption.points,
      };

      const newTotalScore = totalScore + selectedOption.points;
      const newAnswers = [...answers, newAnswer];
      const newBackStack = [...backStack, currentNodeId];

      // Cek apakah ini trigger intervensi krisis
      if (selectedOption.isTrigger) {
        set({
          answers: newAnswers,
          totalScore: newTotalScore,
          backStack: newBackStack,
          selectedOptionId: null,
          pendingTrigger: true,
          // currentNodeId BELUM berubah — akan dilanjutkan setelah breathing selesai
          // Simpan nextNodeId di jawaban agar bisa dilanjutkan nanti
        });
        return 'breathing';
      }

      // Navigasi normal
      const nextNodeId = selectedOption.nextNodeId;

      if (nextNodeId === 'result') {
        set({
          answers: newAnswers,
          totalScore: newTotalScore,
          backStack: newBackStack,
          selectedOptionId: null,
          isCompleted: true,
        });
        return 'result';
      }

      set({
        currentNodeId: nextNodeId,
        selectedOptionId: null,
        answers: newAnswers,
        totalScore: newTotalScore,
        backStack: newBackStack,
      });

      return nextNodeId;
    },

    prevQuestion: () => {
      const { backStack, answers, totalScore } = get();

      if (backStack.length === 0) return false;

      const newBackStack = [...backStack];
      const previousNodeId = newBackStack.pop()!;

      // Hapus jawaban terakhir dan kurangi skor
      const newAnswers = [...answers];
      const removedAnswer = newAnswers.pop();
      const newTotalScore = removedAnswer
        ? totalScore - removedAnswer.points
        : totalScore;

      set({
        currentNodeId: previousNodeId,
        selectedOptionId: null,
        backStack: newBackStack,
        answers: newAnswers,
        totalScore: newTotalScore,
      });

      return true;
    },

    clearTrigger: () => {
      const { answers } = get();

      // Ambil jawaban terakhir untuk mendapatkan nextNodeId
      const lastAnswer = answers[answers.length - 1];
      if (!lastAnswer) return;

      const lastNode = getNodeById(lastAnswer.nodeId);
      if (!lastNode) return;

      const lastOption = lastNode.options.find(
        (opt: Option) => opt.id === lastAnswer.optionId
      );
      if (!lastOption) return;

      const nextNodeId = lastOption.nextNodeId;

      if (nextNodeId === 'result') {
        set({
          pendingTrigger: false,
          isCompleted: true,
        });
      } else {
        set({
          pendingTrigger: false,
          currentNodeId: nextNodeId,
          selectedOptionId: null,
        });
      }
    },

    completeAssessment: () => {
      const { totalScore, answers, history } = get();
      const result = getResultCategory(totalScore);

      const entry: AssessmentHistoryEntry = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        totalScore,
        category: result.category,
        answers: [...answers],
      };

      set({
        isAssessmentActive: false,
        isCompleted: true,
        history: [...history, entry],
      });
    },

    reset: () => {
      set({
        ...initialState,
        history: get().history,
      });
    },
  })
);
