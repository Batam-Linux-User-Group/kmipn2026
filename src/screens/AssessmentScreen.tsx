/**
 * AssessmentScreen.tsx
 *
 * Layar asesmen JEDA — "Compiler View" yang merender konten secara dinamis
 * berdasarkan node aktif dari pohon keputusan (DAG).
 *
 * Fitur utama:
 *   - Satu komponen tunggal untuk seluruh alur kuesioner (data-driven)
 *   - Gatekeeper: Tombol "Selesai" disabled sampai opsi dipilih
 *   - Animasi transisi antar-pertanyaan (fade + slide)
 *   - Navigasi mundur melalui backstack
 *   - Deteksi isTrigger → navigasi otomatis ke BreathingScreen
 */

import { useCallback, useEffect } from 'react';
import {
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  FadeInRight,
  FadeOutLeft,
  LinearTransition,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CustomButton, JedaColors } from '@/components/CustomButton';
import { ThemedText } from '@/components/themed-text';
import { getNodeById, getTotalNodeCount, getResultCategory } from '@/data/assessmentData';
import { useAssessmentStore } from '@/store/useAssessmentStore';

// ─── Props ───────────────────────────────────────────────────────────────

interface AssessmentScreenProps {
  onNavigateToBreathing: () => void;
  onNavigateToResult: () => void;
  onGoBack: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────

export function AssessmentScreen({
  onNavigateToBreathing,
  onNavigateToResult,
  onGoBack,
}: AssessmentScreenProps) {
  const {
    currentNodeId,
    selectedOptionId,
    backStack,
    totalScore,
    answers,
    isCompleted,
    selectOption,
    nextQuestion,
    prevQuestion,
    startAssessment,
  } = useAssessmentStore();

  const insets = useSafeAreaInsets();
  const currentNode = getNodeById(currentNodeId);
  const totalNodes = getTotalNodeCount();
  const currentStep = answers.length + 1;
  const progress = Math.min(currentStep / totalNodes, 1);

  // Mulai asesmen saat komponen dimount
  useEffect(() => {
    startAssessment();
  }, [startAssessment]);

  // Override hardware back button
  useEffect(() => {
    const handleBack = () => {
      if (backStack.length > 0) {
        prevQuestion();
        return true;
      }
      onGoBack();
      return true;
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBack
    );
    return () => subscription.remove();
  }, [backStack.length, prevQuestion, onGoBack]);

  // ── Handler: Tombol "Selesai" ──
  const handleNext = useCallback(() => {
    if (!selectedOptionId) return; // Gatekeeper: tidak boleh lanjut tanpa pilihan

    const result = nextQuestion();

    if (result === 'breathing') {
      onNavigateToBreathing();
    } else if (result === 'result') {
      onNavigateToResult();
    }
    // Jika string nodeId biasa, state sudah diupdate oleh store → re-render otomatis
  }, [selectedOptionId, nextQuestion, onNavigateToBreathing, onNavigateToResult]);

  // ── Handler: Tombol Back ──
  const handleBack = useCallback(() => {
    if (backStack.length > 0) {
      prevQuestion();
    } else {
      onGoBack();
    }
  }, [backStack.length, prevQuestion, onGoBack]);

  if (!currentNode) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ThemedText style={styles.errorText}>
          Error: Node tidak ditemukan.
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Header: Back + Progress ── */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <ThemedText style={styles.backText}>
            {backStack.length > 0 ? '← Kembali' : '← Keluar'}
          </ThemedText>
        </Pressable>
        <ThemedText style={styles.stepText}>
          {currentStep} / {totalNodes}
        </ThemedText>
      </View>

      {/* ── Progress Bar ── */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBg}>
          <Animated.View
            layout={LinearTransition.springify().damping(20)}
            style={[styles.progressBarFill, { width: `${progress * 100}%` }]}
          />
        </View>
      </View>

      {/* ── Question Content ── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}>
        <Animated.View
          key={currentNode.id}
          entering={FadeInRight.duration(300).springify()}
          exiting={FadeOutLeft.duration(200)}>
          {/* Pertanyaan */}
          <ThemedText style={styles.questionText}>
            {currentNode.question}
          </ThemedText>

          {currentNode.description && (
            <ThemedText style={styles.descriptionText}>
              {currentNode.description}
            </ThemedText>
          )}

          {/* Pilihan Jawaban (Option Cards) */}
          <View style={styles.optionsContainer}>
            {currentNode.options.map((option) => {
              const isSelected = selectedOptionId === option.id;
              return (
                <Pressable
                  key={option.id}
                  onPress={() => selectOption(option.id)}
                  style={[
                    styles.optionCard,
                    isSelected && styles.optionCardSelected,
                  ]}>
                  <View style={styles.optionIndicator}>
                    <View
                      style={[
                        styles.radioOuter,
                        isSelected && styles.radioOuterSelected,
                      ]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                  </View>
                  <ThemedText
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}>
                    {option.text}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>
      </ScrollView>

      {/* ── Gatekeeper: Tombol "Selesai" ── */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
        <CustomButton
          title="Selesai"
          onPress={handleNext}
          disabled={selectedOptionId === null}
          variant="primary"
          style={styles.nextButton}
        />
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: JedaColors.dark,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  backText: {
    color: JedaColors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  stepText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
  progressBarContainer: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#1E293B',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: JedaColors.primary,
    borderRadius: 3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  questionText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 30,
    marginBottom: 8,
  },
  descriptionText: {
    color: '#94A3B8',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 28,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: JedaColors.cardBg,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: JedaColors.cardBorder,
    paddingVertical: 18,
    paddingHorizontal: 16,
    gap: 14,
  },
  optionCardSelected: {
    borderColor: JedaColors.primary,
    backgroundColor: '#0D3029',
  },
  optionIndicator: {
    width: 24,
    alignItems: 'center',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: JedaColors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: JedaColors.primary,
  },
  optionText: {
    color: '#CBD5E1',
    fontSize: 16,
    lineHeight: 22,
    flex: 1,
  },
  optionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    backgroundColor: JedaColors.dark,
  },
  nextButton: {
    width: '100%',
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});
