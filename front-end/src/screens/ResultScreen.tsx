// src/screens/ResultScreen.tsx
// Final result screen showing risk status, recommendation, journal, and navigation.

import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { useAssessmentStore } from '@/store/useAssessmentStore';

function JedaLogo({ size = 56 }: { size?: number }) {
  return (
     <View>
             <Image
               source={require('@/assets/icons/Jeda_Logo.png')}
               style={[ { width: size, height: size }]}
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
    reset,
    getRiskStatus: getStoreRiskStatus,
  } = useAssessmentStore();

  const { status, recommendation } = useMemo(
    () => getStoreRiskStatus(),
    [totalScore]
  );

  // Determine status color intensity
  const statusColor = useMemo(() => {
    switch (status) {
      case 'Rendah':
        return '#1A886A';
      case 'Rentan':
        return '#E6A817';
      case 'Adiksi Tinggi':
        return '#1A886A';
      default:
        return '#1A886A';
    }
  }, [status]);

  const handleBack = () => {
    router.back();
  };

  const handleFinish = () => {
    // TODO: In the future, submit to API here:
    // POST /api/assessments with { answers, total_score, risk_status, journal_text }
    // For now, just reset and go home.
    reset();
    router.replace('/tabs');
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
          </ScrollView>

          {/* Bottom Navigation */}
          <SafeAreaView edges={['bottom']} style={styles.bottomNav}>
            <Pressable style={styles.pillButton} onPress={handleBack}>
              <Text style={styles.pillButtonText}>Kembali</Text>
            </Pressable>

            <View style={styles.dotIndicator} />

            <Pressable style={styles.pillButton} onPress={handleFinish}>
              <Text style={styles.pillButtonText}>Selesai</Text>
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
    fontWeight: '700',
    color: '#1A886A',
    marginTop: 4,
    letterSpacing: 1,
  },
  titleText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    marginTop: 12,
    fontFamily: 'Laxend'
  },
  subtitleText: {
    fontSize: 12,
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
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  statusHighlight: {
    color: '#3BCFA6',
    fontWeight: '700',
  },
  statusDescription: {
    fontSize: 14,
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
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 22,
    fontWeight: '500',
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
