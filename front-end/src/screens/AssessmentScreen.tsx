// src/screens/AssessmentScreen.tsx
// Assessment question screen with JEDA-themed UI.

import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { getNode } from '@/data/assessmentData';
import { useAssessmentStore } from '@/store/useAssessmentStore';

// ─── JEDA Shield Logo ────────────────────────────────────────
function JedaLogo({ size = 56 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <Path
        d="M18 3L6 8v9c0 5.5 3.5 10.7 8 13.5l4 2.5 4-2.5c4.5-2.8 8-8 8-13.5V8L18 3z"
        stroke="#1A886A"
        strokeWidth={2}
        fill="#C5E3DE"
      />
      <Path
        d="M18 23c2.5-2.5 4-5.5 4-8 0-1.5-1-2.5-2.5-2.5-1 0-1.8.8-2.5 1.5-.7-.7-1.5-1.5-2.5-1.5-1.5 0-2.5 1-2.5 2.5 0 2.5 1.5 5.5 4 8"
        stroke="#1A886A"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18 14v9"
        stroke="#1A886A"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ─── Highlighted Question Text ───────────────────────────────
function HighlightedQuestion({
  question,
  highlightWords,
}: {
  question: string;
  highlightWords: string[];
}) {
  if (highlightWords.length === 0) {
    return <Text style={styles.questionText}>{question}</Text>;
  }

  // Build a regex pattern that matches any of the highlight words
  const pattern = highlightWords
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  const regex = new RegExp(`(${pattern})`, 'gi');
  const parts = question.split(regex);

  return (
    <Text style={styles.questionText}>
      {parts.map((part, index) => {
        const isHighlighted = highlightWords.some(
          (w) => w.toLowerCase() === part.toLowerCase()
        );
        return (
          <Text
            key={index}
            style={isHighlighted ? styles.highlightedWord : undefined}
          >
            {part}
          </Text>
        );
      })}
    </Text>
  );
}

// ─── Main Component ──────────────────────────────────────────
export default function AssessmentScreen() {
  const router = useRouter();
  const {
    currentNodeId,
    answers,
    selectOption,
    goToNode,
    goBack,
    journalText,
    setJournalText,
    setPendingNextNodeId,
    history,
  } = useAssessmentStore();

  const node = useMemo(() => getNode(currentNodeId), [currentNodeId]);
  const [selectedOptionText, setSelectedOptionText] = useState<string | null>(
    answers[currentNodeId]?.optionText ?? null
  );

  // Reset selection when node changes
  React.useEffect(() => {
    setSelectedOptionText(answers[currentNodeId]?.optionText ?? null);
  }, [currentNodeId, answers]);

  const selectedOption = useMemo(() => {
    if (!node || !selectedOptionText) return null;
    return node.options.find((o) => o.text === selectedOptionText) ?? null;
  }, [node, selectedOptionText]);

  const handleSelectOption = useCallback(
    (optionText: string, score: number) => {
      if (!node) return;
      setSelectedOptionText(optionText);
      selectOption(node.id, optionText, score);
    },
    [node, selectOption]
  );

  const handleNext = useCallback(() => {
    if (!selectedOption || !node) return;

    // Record the answer
    selectOption(node.id, selectedOption.text, selectedOption.score);

    if (selectedOption.isTrigger) {
      // Set pending next node and navigate to breathing screen
      setPendingNextNodeId(selectedOption.next);
      router.push('/breathing');
      return;
    }

    if (selectedOption.next === 'result') {
      router.push('/result');
      return;
    }

    // Advance to next node
    goToNode(selectedOption.next);
  }, [selectedOption, node, selectOption, goToNode, setPendingNextNodeId, router]);

  const handleBack = useCallback(() => {
    const couldGoBack = goBack();
    if (!couldGoBack) {
      // We're at the first question, go back to home
      router.back();
    }
  }, [goBack, router]);

  if (!node) {
    return (
      <View style={styles.container}>
        <Text>Node not found: {currentNodeId}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header: Logo + Title */}
            <View style={styles.headerContainer}>
              <JedaLogo size={56} />
              <Text style={styles.logoLabel}>JEDA</Text>
              <Text style={styles.titleText}>Asesmen Awal</Text>
              <Text style={styles.subtitleText}>
                Silahkan Jawab Pertanyaan Berikut Sebelum Mulai{'\n'}Menggunakan Aplikasi
              </Text>
            </View>

            {/* Question */}
            <View style={styles.questionContainer}>
              <HighlightedQuestion
                question={node.question}
                highlightWords={node.highlightWords}
              />
            </View>

            {/* Options */}
            <View style={styles.optionsContainer}>
              {node.options.map((option) => {
                const isSelected = selectedOptionText === option.text;
                return (
                  <Pressable
                    key={option.text}
                    style={[
                      styles.optionButton,
                      isSelected
                        ? styles.optionButtonSelected
                        : styles.optionButtonDefault,
                    ]}
                    onPress={() =>
                      handleSelectOption(option.text, option.score)
                    }
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected
                          ? styles.optionTextSelected
                          : styles.optionTextDefault,
                      ]}
                    >
                      {option.text}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Self Journal Input */}
            <View style={styles.journalContainer}>
              <TextInput
                style={styles.journalInput}
                placeholder="Tulis Jurnal Diri Anda di sini..."
                placeholderTextColor="#888888"
                multiline
                value={journalText}
                onChangeText={setJournalText}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          {/* Bottom Navigation Pills */}
          <SafeAreaView edges={['bottom']} style={styles.bottomNav}>
            <Pressable style={styles.pillButton} onPress={handleBack}>
              <Text style={styles.pillButtonText}>Kembali</Text>
            </Pressable>

            {/* Center dot indicator */}
            <View style={styles.dotIndicator} />

            <Pressable
              style={[
                styles.pillButton,
                !selectedOptionText && styles.pillButtonDisabled,
              ]}
              onPress={handleNext}
              disabled={!selectedOptionText}
            >
              <Text
                style={[
                  styles.pillButtonText,
                  !selectedOptionText && styles.pillButtonTextDisabled,
                ]}
              >
                Selanjutnya
              </Text>
            </Pressable>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C5E3DE',
  },
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },

  // Header
  headerContainer: {
    alignItems: 'center',
    paddingTop: 12,
    marginBottom: 24,
  },
  logoLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A886A',
    marginTop: 4,
    letterSpacing: 1,
  },
  titleText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A886A',
    marginTop: 12,
  },
  subtitleText: {
    fontSize: 12,
    color: '#1A886A',
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.7,
    lineHeight: 18,
  },

  // Question
  questionContainer: {
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  questionText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000ff',
    textAlign: 'center',
    lineHeight: 32,
  },
  highlightedWord: {
    color: '#3BCFA6',
    fontWeight: '700',
  },

  // Options
  optionsContainer: {
    marginBottom: 20,
    gap: 12,
  },
  optionButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionButtonDefault: {
    backgroundColor: '#1E1E1E',
  },
  optionButtonSelected: {
    backgroundColor: '#3BCFA6',
  },
  optionText: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  optionTextDefault: {
    color: '#FFFFFF',
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },

  // Journal
  journalContainer: {
    marginBottom: 20,
  },
  journalInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#3BCFA6',
    borderRadius: 15,
    padding: 12,
    paddingHorizontal: 16,
    color: '#1A886A',
    fontSize: 14,
    minHeight: 80,
    maxHeight: 150,
    textAlignVertical: 'top',
  },

  // Bottom Navigation
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
  },
  pillButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  pillButtonDisabled: {
    opacity: 0.4,
  },
  pillButtonText: {
    color: '#3BCFA6',
    fontSize: 14,
    fontWeight: '700',
  },
  pillButtonTextDisabled: {
    color: '#3BCFA6',
  },
  dotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1A886A',
    opacity: 0.3,
  },
});
