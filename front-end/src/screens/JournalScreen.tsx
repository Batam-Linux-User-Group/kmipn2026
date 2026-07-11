import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAssessmentStore } from '@/store/useAssessmentStore';
import { FontFamily } from '@/constants/fontsfamily';
import { assessmentsApi } from '@/services/api';

function JedaLogo({ size = 56 }: { size?: number }) {
  return (
    <View style={styles.logoContainer}>
      <Image
        source={require('@/assets/icons/Jeda_Logo.png')}
        style={[styles.logoImage, { width: size, height: size }]}
        resizeMode="contain"
      />
    </View>
  );
}

export default function JournalScreen() {
  const router = useRouter();
  const { journalText, setJournalText } = useAssessmentStore();
  const [localText, setLocalText] = useState(journalText);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    assessmentsApi.getToday()
      .then((res) => {
        if (!mounted) return;
        // If there's an existing journal in today's DB assessment, load it
        if (res.journal_text) {
          setLocalText(res.journal_text);
        }
      })
      .catch((err) => console.error('[JournalScreen] load error:', err))
      .finally(() => { if (mounted) setIsLoading(false); });
    return () => { mounted = false; };
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Save to local Zustand store
      setJournalText(localText);

      // 2. Save directly to Supabase DB via our API endpoint
      await assessmentsApi.updateJournal(localText);

      router.back();
    } catch (err) {
      console.error('[JournalScreen] save error:', err);
      Alert.alert('Gagal Menyimpan', (err as Error).message || 'Terjadi kesalahan saat menyimpan jurnal.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3BCFA6" />
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
            {/* Header */}
            <View style={styles.headerContainer}>
              <View style={styles.logoRow}>  
                <JedaLogo size={56} />
                <Text style={styles.logoLabel}>JEDA</Text>
              </View>
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
                editable={!isSaving}
              />
            </View>
          </ScrollView>

          {/* Bottom Navigation */}
          <SafeAreaView edges={['bottom']} style={styles.bottomNav}>
            <Pressable style={styles.pillButton} onPress={handleBack} disabled={isSaving}>
              <Text style={styles.pillButtonText}>Kembali</Text>
            </Pressable>

            <View style={styles.dotIndicator} />

            <Pressable style={styles.pillButton} onPress={handleSave} disabled={isSaving}>
              {isSaving ? (
                <ActivityIndicator size="small" color="#3BCFA6" />
              ) : (
                <Text style={styles.pillButtonText}>Simpan</Text>
              )}
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
    fontFamily: FontFamily.manropeBold,
    color: '#1A886A',
    marginTop: 4,
    letterSpacing: 1,
  },
  titleText: {
    fontSize: 22,
    fontFamily: FontFamily.manropeBold,
    color: '#1A886A',
    marginTop: 12,
  },
  subtitleText: {
    fontSize: 13,
    fontFamily: FontFamily.manropeMedium,
    color: '#1A886A',
    textAlign: 'center',
    marginTop: 6,
    opacity: 0.8,
  },

  // Journal Section
  journalSection: {
    flex: 1,
    color: '#000000',
  },
  journalSectionSubtitle: {
    fontSize: 14,
    fontFamily: FontFamily.manropeMedium,
    color: '#000000',
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
    fontFamily: FontFamily.manropeMedium,
    minHeight: 250,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 17,
    elevation: 5,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    resizeMode: 'contain',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
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
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 17,
    elevation: 5,
  },
  pillButtonText: {
    color: '#3BCFA6',
    fontSize: 14,
    fontFamily: FontFamily.manropeBold,
  },
  dotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1A886A',
    opacity: 0.3,
  },
});
