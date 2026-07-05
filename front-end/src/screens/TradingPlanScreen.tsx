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
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAssessmentStore } from '@/store/useAssessmentStore';
import { FontFamily } from '@/constants/fontsfamily';

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

export default function TradingPlanScreen() {
  const router = useRouter();
  const { tradingPlan, setTradingPlan } = useAssessmentStore();

  const [entry, setEntry] = useState(tradingPlan?.entry || '');
  const [price, setPrice] = useState(tradingPlan?.price || '');
  const [tpSl, setTpSl] = useState(tradingPlan?.tpSl || '');
  const [reason, setReason] = useState(tradingPlan?.reason || '');

  const handleBack = () => {
    router.back();
  };

  const handleSave = () => {
    if (entry.trim() || price.trim() || tpSl.trim() || reason.trim()) {
      setTradingPlan({ entry, price, tpSl, reason });
    } else {
      setTradingPlan(null);
    }
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
              <View style={styles.logoRow}>  
                <JedaLogo size={56} />
                <Text style={styles.logoLabel}>JEDA</Text>
              </View>
              <Text style={styles.titleText}>Trading Plan</Text>
              <Text style={styles.subtitleText}>Susun Rencana Trading Anda Secara Disiplin</Text>
            </View>

            {/* Form Fields */}
            <View style={styles.formContainer}>
              
              {/* Question 1 */}
              <View style={styles.questionBlock}>
                <Text style={styles.questionText}>
                  Pertama, mau <Text style={styles.highlightText}>entry</Text> dimana?
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Contoh: Koin / Aset digital tertentu"
                  placeholderTextColor="#888888"
                  value={entry}
                  onChangeText={setEntry}
                />
              </View>

              {/* Question 2 */}
              <View style={styles.questionBlock}>
                <Text style={styles.questionText}>
                  Kedua, di <Text style={styles.highlightText}>harga</Text> berapa?
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Contoh: $60,000 / Rp 1.500"
                  placeholderTextColor="#888888"
                  value={price}
                  onChangeText={setPrice}
                />
              </View>

              {/* Question 3 */}
              <View style={styles.questionBlock}>
                <Text style={styles.questionText}>
                  Ketiga, <Text style={styles.highlightText}>take profit</Text> dan <Text style={styles.highlightText}>stoploss</Text> dimana?
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Contoh: TP $65,000 & SL $58,000"
                  placeholderTextColor="#888888"
                  value={tpSl}
                  onChangeText={setTpSl}
                />
              </View>

              {/* Question 4 */}
              <View style={styles.questionBlock}>
                <Text style={styles.questionText}>
                  <Text style={styles.highlightText}>Alasan</Text> entry?
                </Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Tulis alasan teknis / analisa anda di sini..."
                  placeholderTextColor="#888888"
                  multiline
                  numberOfLines={4}
                  value={reason}
                  onChangeText={setReason}
                  textAlignVertical="top"
                />
              </View>

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
  headerContainer: {
    alignItems: 'center',
    paddingTop: 12,
    marginBottom: 20,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    resizeMode: 'contain',
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
  formContainer: {
    gap: 20,
    marginTop: 10,
  },
  questionBlock: {
    gap: 8,
  },
  questionText: {
    fontSize: 15,
    fontFamily: FontFamily.manropeSemiBold,
    color: '#1E2A22',
    marginLeft: 4,
  },
  highlightText: {
    fontFamily: FontFamily.manropeBold,
    color: '#3BCFA6',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#3BCFA6',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: FontFamily.manropeMedium,
    color: '#1E2A22',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 17,
    elevation: 2,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
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
    shadowRadius: 17,
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
