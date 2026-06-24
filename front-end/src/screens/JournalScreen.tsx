// src/screens/JournalScreen.tsx
// Dedicated self-journaling screen.

import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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

export default function JournalScreen() {
  const router = useRouter();
  // We can reuse the journal text state from the store, or keep it local.
  // Using store to persist it temporarily.
  const { journalText, setJournalText } = useAssessmentStore();
  const [localText, setLocalText] = useState(journalText);

  const handleBack = () => {
    router.back();
  };

  const handleSave = () => {
    setJournalText(localText);
    // Here you would also save to the backend if implemented
    router.back();
  };

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
            {/* Header */}
            <View style={styles.headerContainer}>
              <JedaLogo size={56} />
              <Text style={styles.logoLabel}>JEDA</Text>
              <Text style={styles.titleText}>Self Journaling</Text>
              <Text style={styles.subtitleText}>Catat Emosi dan Strategimu Hari Ini</Text>
            </View>

            {/* Self Journal Input */}
            <View style={styles.journalSection}>
              <Text style={styles.journalSectionSubtitle}>
                Menambah risiko saat emosi tidak stabil adalah awal dari kehancuran. Ambil waktu sejenak untuk merefleksikan apa yang terjadi.
              </Text>
              <TextInput
                style={styles.journalInput}
                placeholder="Tulis Jurnal Diri Anda di sini..."
                placeholderTextColor="#888888"
                multiline
                value={localText}
                onChangeText={setLocalText}
                textAlignVertical="top"
                autoFocus
              />
            </View>
          </ScrollView>

          {/* Bottom Navigation */}
          <SafeAreaView edges={['bottom']} style={styles.bottomNav}>
            <Pressable style={styles.pillButton} onPress={handleBack}>
              <Text style={styles.pillButtonText}>Kembali</Text>
            </Pressable>

            <View style={styles.dotIndicator} />

            <Pressable style={styles.pillButton} onPress={handleSave}>
              <Text style={styles.pillButtonText}>Simpan</Text>
            </Pressable>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

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
    marginBottom: 30,
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
    fontSize: 13,
    color: '#1A886A',
    textAlign: 'center',
    marginTop: 6,
    opacity: 0.8,
  },

  // Journal Section
  journalSection: {
    flex: 1,
  },
  journalSectionSubtitle: {
    fontSize: 14,
    color: '#1A886A',
    opacity: 0.8,
    marginBottom: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  journalInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#3BCFA6',
    borderRadius: 20,
    padding: 16,
    color: '#1A886A',
    fontSize: 15,
    minHeight: 250,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
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
  pillButtonText: {
    color: '#3BCFA6',
    fontSize: 14,
    fontWeight: '700',
  },
  dotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1A886A',
    opacity: 0.3,
  },
});
