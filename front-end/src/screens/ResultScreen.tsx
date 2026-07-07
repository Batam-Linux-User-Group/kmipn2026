


// src/screens/ResultScreen.tsx
// Final result screen showing risk status, recommendation, journal, and navigation.

import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAssessmentStore } from '@/store/useAssessmentStore';
import { FontFamily } from '@/constants/fontsfamily';
import { assessmentsApi } from '@/services/api';

function JedaLogo({ size = 56 }: { size?: number }) {
  return (
    <View>
      <Image
        source={require('@/assets/icons/Jeda_Logo.png')}
        style={[{ width: size, height: size }]}
        resizeMode="contain"
      />
    </View>
  );
}

export default function ResultScreen() {
  const router = useRouter();
  const {
    totalScore,
    answers,
    journalText,
    triggerCount,
    mainInstrument,
    reset,
    getRiskStatus: getStoreRiskStatus,
  } = useAssessmentStore();

  const { status, recommendation } = useMemo(
    () => getStoreRiskStatus(),
    [getStoreRiskStatus]
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusColor = useMemo(() => {
    switch (status) {
      case 'Rendah':
        return '#1A886A';
      case 'Rentan':
        return '#E6A817';
      case 'Adiksi Tinggi':
        return '#C0392B';
      default:
        return '#1A886A';
    }
  }, [status]);

  const handleBack = () => {
    router.back();
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      await assessmentsApi.create({
        answers,
        journal_text: journalText,
        total_score: totalScore,
        risk_status: status,
        recommendation,
        main_instrument: mainInstrument,
        trigger_count: triggerCount,
      });
      reset();
      router.replace('/tabs');
    } catch (err) {
      console.error('[Result] Submit assessment error:', err);
      Alert.alert('Gagal Menyimpan', (err as Error).message || 'Gagal menyimpan hasil asesmen.');
    } finally {
      setIsSubmitting(false);
    }
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
              <Text style={styles.titleText}>Result</Text>
              <Text style={styles.subtitleText}>Hasil Analisis Anda</Text>
            </View>

            {/* Status Text */}
            <View style={styles.statusContainer}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {status === 'Adiksi Tinggi' ? (
                  <>
                    Adiksi <Text style={styles.statusHighlight}>Tinggi</Text>
                  </>
                ) : status === 'Rentan' ? (
                  <Text style={styles.statusHighlight}>{status}</Text>
                ) : (
                  status
                )}
              </Text>

              <Text style={styles.statusDescription}>
                {status === 'Adiksi Tinggi'
                  ? 'Anda menunjukkan adiksi investasi digital yang signifikan. Sangat disarankan untuk melakukan intervensi dan mengambil JEDA.'
                  : status === 'Rentan'
                  ? 'Kamu menunjukkan beberapa tanda kerentanan dalam perilaku investasi. Waspadai dorongan impulsif.'
                  : 'Kebiasaan investasimu terlihat sehat. Tetap pertahankan pendekatan yang disiplin.'}
              </Text>
            </View>

            {/* Recommendation Box */}
            <View style={styles.recommendationBox}>
              <Text style={styles.recommendationLabel}>Rekomendasi...</Text>
              <Text style={styles.recommendationText}>{recommendation}</Text>
            </View>

            {/* Score info */}
            <View style={styles.scoreRow}>
              <Text style={styles.scoreLabel}>Skor: </Text>
              <Text style={styles.scoreValue}>{totalScore}</Text>
            </View>
          </ScrollView>

          {/* Bottom Navigation */}
          <SafeAreaView edges={['bottom']} style={styles.bottomNav}>
            <Pressable
              style={[styles.pillButton, isSubmitting && { opacity: 0.5 }]}
              onPress={handleBack}
              disabled={isSubmitting}
            >
              <Text style={styles.pillButtonText}>Kembali</Text>
            </Pressable>

            <View style={styles.dotIndicator} />

            <Pressable
              style={[styles.pillButton, isSubmitting && { opacity: 0.5 }]}
              onPress={handleFinish}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#3BCFA6" />
              ) : (
                <Text style={styles.pillButtonText}>Selesai</Text>
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
    marginBottom: 20,
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
    color: '#000000',
    marginTop: 12,
  },
  subtitleText: {
    fontSize: 12,
    fontFamily: FontFamily.manropeMedium,
    color: '#000000',
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.7,
  },

  // Status
  statusContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  statusText: {
    fontSize: 32,
    fontFamily: FontFamily.manropeBold,
    textAlign: 'center',
    marginBottom: 12,
  },
  statusHighlight: {
    color: '#3BCFA6',
    fontFamily: FontFamily.manropeBold,
  },
  statusDescription: {
    fontSize: 14,
    fontFamily: FontFamily.manropeMedium,
    color: '#000000',
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.8,
  },

  // Recommendation
  recommendationBox: {
    backgroundColor: '#3BCFA6',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  recommendationLabel: {
    fontSize: 14,
    fontFamily: FontFamily.manropeSemiBold,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    fontFamily: FontFamily.manropeMedium,
    color: '#FFFFFF',
    lineHeight: 22,
  },

  // Score
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  scoreLabel: {
    fontSize: 13,
    color: '#1A886A',
    opacity: 0.7,
  },
  scoreValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A886A',
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