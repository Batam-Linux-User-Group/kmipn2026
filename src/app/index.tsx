import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Modal,
  Dimensions,
  Animated as RNAnimated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';
import { Flame, X, Play, RotateCcw } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';

import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

// --- CUSTOM SVG ICONS ---

function AppLogo() {
  const theme = useTheme();
  return (
    <Svg width={38} height={38} viewBox="0 0 36 36" fill="none">
      <Path
        d="M18 3L6 8v9c0 5.5 3.5 10.7 8 13.5l4 2.5 4-2.5c4.5-2.8 8-8 8-13.5V8L18 3z"
        stroke={theme.mintDark}
        strokeWidth={2.5}
        fill={theme.mintLight}
      />
      <Path
        d="M18 23c2.5-2.5 4-5.5 4-8 0-1.5-1-2.5-2.5-2.5-1 0-1.8.8-2.5 1.5-.7-.7-1.5-1.5-2.5-1.5-1.5 0-2.5 1-2.5 2.5 0 2.5 1.5 5.5 4 8"
        stroke={theme.mintDark}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M18 14v9" stroke={theme.mintDark} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function CalendarIcon() {
  return (
    <Svg width={44} height={44} viewBox="0 0 44 44" fill="none">
      <Path
        d="M8 12c0-2.2 1.8-4 4-4h20c2.2 0 4 1.8 4 4v22c0 2.2-1.8 4-4 4H12c-2.2 0-4-1.8-4-4V12z"
        stroke="#2BD5A2"
        strokeWidth={3}
        fill="#FFFFFF"
      />
      <Path d="M14 4v6M30 4v6" stroke="#2BD5A2" strokeWidth={3} strokeLinecap="round" />
      <Path d="M8 18h28" stroke="#2BD5A2" strokeWidth={2} />
      <Path
        d="M21 23v10M19 25l2-2"
        stroke="#2BD5A2"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function BookIcon() {
  return (
    <Svg width={44} height={44} viewBox="0 0 44 44" fill="none">
      <Path
        d="M14 8h20c1.1 0 2 .9 2 2v24c0 1.1-.9 2-2 2H14c-1.1 0-2-.9-2-2V10c0-1.1.9-2 2-2z"
        fill="#2BD5A2"
      />
      <Path
        d="M8 12h6M8 18h6M8 24h6M8 30h6"
        stroke="#FFFFFF"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <Path d="M10 8v28c0 1.1.9 2 2 2h2v-32h-2c-1.1 0-2 .9-2 2z" fill="#1EB588" />
      <Path d="M30 14h-8M30 20h-8M26 26h-4" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export default function HomeScreen() {
  const theme = useTheme();
  
  // Interactive State for Mood Selector
  // 'ya' means mood is bad (Yes, emotions are not good today, take a break)
  // 'tidak' means mood is fine (No, emotions are not bad)
  const [mood, setMood] = useState<'tidak' | 'ya'>('ya');
  
  // State for Breathing Modal
  const [isBreathingModalOpen, setIsBreathingModalOpen] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'Tarik Napas' | 'Tahan Napas' | 'Hembuskan Napas'>('Tarik Napas');
  const [secondsRemaining, setSecondsRemaining] = useState(120); // 2 minutes
  const [isBreathingActive, setIsBreathingActive] = useState(false);

  // Animation shared values for breathing ring
  const circleScale = useSharedValue(1);
  const circleOpacity = useSharedValue(0.4);

  // Timer Ref
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Phase loop Ref
  const phaseRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start breathing exercise
  const startBreathing = () => {
    setIsBreathingActive(true);
    setSecondsRemaining(120);
    setBreathingPhase('Tarik Napas');
    
    // Animation loop (4s inhale, 2s hold, 4s exhale, 2s hold = 12s cycle)
    const runAnimation = () => {
      circleScale.value = withSequence(
        withTiming(1.8, { duration: 4000, easing: Easing.out(Easing.ease) }), // Tarik
        withTiming(1.8, { duration: 2000 }), // Tahan
        withTiming(1.0, { duration: 4000, easing: Easing.inOut(Easing.ease) }), // Hembuskan
        withTiming(1.0, { duration: 2000 }) // Tahan
      );
      circleOpacity.value = withSequence(
        withTiming(0.8, { duration: 4000 }),
        withTiming(0.8, { duration: 2000 }),
        withTiming(0.3, { duration: 4000 }),
        withTiming(0.3, { duration: 2000 })
      );
    };

    runAnimation();
    
    // Repeat animation every 12 seconds
    const animInterval = setInterval(runAnimation, 12000);
    
    // Manage Phase Text changes
    let elapsed = 0;
    const updatePhase = () => {
      const cycleTime = elapsed % 12;
      if (cycleTime === 0) {
        setBreathingPhase('Tarik Napas');
      } else if (cycleTime === 4) {
        setBreathingPhase('Tahan Napas');
      } else if (cycleTime === 6) {
        setBreathingPhase('Hembuskan Napas');
      } else if (cycleTime === 10) {
        setBreathingPhase('Tahan Napas');
      }
      elapsed += 1;
    };
    
    updatePhase();
    const phaseInterval = setInterval(updatePhase, 1000);

    // Countdown Timer
    const countdown = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          clearInterval(animInterval);
          clearInterval(phaseInterval);
          setIsBreathingActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    timerRef.current = countdown;
    // Store intervals to clear them later
    phaseRef.current = phaseInterval;
    
    // We clean up if modal is closed
    return () => {
      clearInterval(countdown);
      clearInterval(animInterval);
      clearInterval(phaseInterval);
    };
  };

  const stopBreathing = () => {
    setIsBreathingActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (phaseRef.current) clearInterval(phaseRef.current);
    cancelAnimation(circleScale);
    cancelAnimation(circleOpacity);
    circleScale.value = 1;
    circleOpacity.value = 0.4;
    setSecondsRemaining(120);
  };

  useEffect(() => {
    if (isBreathingModalOpen) {
      startBreathing();
    } else {
      stopBreathing();
    }
    return () => {
      stopBreathing();
    };
  }, [isBreathingModalOpen]);

  const animatedRingStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: circleScale.value }],
      opacity: circleOpacity.value,
    };
  });

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.mintGradientStart, theme.mintGradientEnd]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.4 }}
      />
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        
        {/* HEADER SECTION */}
        <View style={styles.header}>
          <View style={styles.profileContainer}>
            <AppLogo />
            <View style={styles.profileText}>
              <Text style={[styles.greetingText, { color: theme.mintDark + '99' }]}>Selamat Pagi</Text>
              <Text style={[styles.nameText, { color: theme.mintDark }]}>Fawwaz Khairiy Wahid</Text>
            </View>
          </View>
          
          <View style={[styles.streakContainer, { backgroundColor: theme.mintStreakBackground }]}>
            <Flame size={20} color={theme.streakOrange} fill={theme.streakOrange} />
            <Text style={[styles.streakText, { color: theme.text }]}>7</Text>
          </View>
        </View>

        {/* QUOTE SECTION */}
        <View style={styles.quoteSection}>
          <Text style={[styles.quoteText, { color: '#11221A' }]}>
            Investasi yang sehat dimulai dengan perencanaan yang matang, bukan dorongan impulsif.
          </Text>
          <Text style={[styles.quoteAuthor, { color: theme.cardSubtitle }]}>
            — Prinsip Investasi Sehat
          </Text>
        </View>

        {/* WHITE MAIN CARD */}
        <ScrollView 
          showsVerticalScrollIndicator={false}
          style={styles.whiteCardScroll}
          contentContainerStyle={styles.whiteCardContent}
        >
          <Text style={styles.promptText}>
            Emosi anda hari ini kurang baik hari ini, mohon ambil JEDA!
          </Text>

          {/* MOOD BUTTONS */}
          <View style={styles.moodButtonsRow}>
            {/* TIDAK BUTTON */}
            <Pressable
              onPress={() => setMood('tidak')}
              style={[
                styles.moodButton,
                mood === 'tidak'
                  ? { backgroundColor: theme.mintDark, borderColor: theme.mintDark }
                  : { backgroundColor: '#FFFFFF', borderColor: theme.mintBorder },
              ]}
            >
              <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                <Circle cx={12} cy={12} r={10} stroke={mood === 'tidak' ? '#FFFFFF' : theme.mintDark} strokeWidth={2.5} />
                <Path
                  d="M8 10c.3-.5.8-.5 1.2 0M14.8 10c.3-.5.8-.5 1.2 0"
                  stroke={mood === 'tidak' ? '#FFFFFF' : theme.mintDark}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
                <Path
                  d="M8 15c1 1.5 2.5 2 4 2s3-.5 4-2"
                  stroke={mood === 'tidak' ? '#FFFFFF' : theme.mintDark}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </Svg>
              <Text
                style={[
                  styles.moodButtonText,
                  { color: mood === 'tidak' ? '#FFFFFF' : theme.mintDark },
                ]}
              >
                Tidak
              </Text>
            </Pressable>

            {/* YA BUTTON */}
            <Pressable
              onPress={() => setMood('ya')}
              style={[
                styles.moodButton,
                mood === 'ya'
                  ? { backgroundColor: theme.mintDark, borderColor: theme.mintDark }
                  : { backgroundColor: '#FFFFFF', borderColor: theme.mintBorder },
              ]}
            >
              <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                <Circle cx={12} cy={12} r={10} stroke={mood === 'ya' ? '#FFFFFF' : theme.mintDark} strokeWidth={2.5} />
                <Path
                  d="M9 10h.01M15 10h.01"
                  stroke={mood === 'ya' ? '#FFFFFF' : theme.mintDark}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                />
                <Path
                  d="M16 16c-1-1.5-2.5-2-4-2s-3 .5-4 2"
                  stroke={mood === 'ya' ? '#FFFFFF' : theme.mintDark}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </Svg>
              <Text
                style={[
                  styles.moodButtonText,
                  { color: mood === 'ya' ? '#FFFFFF' : theme.mintDark },
                ]}
              >
                Ya
              </Text>
            </Pressable>
          </View>

          {/* BREATHING TRIGGER */}
          <Pressable
            onPress={() => setIsBreathingModalOpen(true)}
            style={({ pressed }) => [
              styles.breathingButton,
              { backgroundColor: theme.mintMedium },
              pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }
            ]}
          >
            <Text style={styles.breathingButtonText}>Pernapasan 2 menit</Text>
          </Pressable>

          {/* ACTION CARDS */}
          <Pressable 
            style={({ pressed }) => [
              styles.actionCard,
              pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }
            ]}
          >
            <View style={styles.actionCardIconWrapper}>
              <CalendarIcon />
            </View>
            <View style={styles.actionCardContent}>
              <Text style={styles.actionCardTitle}>Daily Question</Text>
              <Text style={[styles.actionCardSubtitle, { color: theme.cardSubtitle }]}>
                Answer to activate streak
              </Text>
            </View>
          </Pressable>

          <Pressable 
            style={({ pressed }) => [
              styles.actionCard,
              pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] }
            ]}
          >
            <View style={styles.actionCardIconWrapper}>
              <BookIcon />
            </View>
            <View style={styles.actionCardContent}>
              <Text style={styles.actionCardTitle}>Self Journalling</Text>
              <Text style={[styles.actionCardSubtitle, { color: theme.cardSubtitle }]}>
                Manual Input
              </Text>
            </View>
          </Pressable>
        </ScrollView>
      </SafeAreaView>

      {/* BREATHING EXERCISE INTERACTIVE MODAL */}
      <Modal
        visible={isBreathingModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsBreathingModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={['#034331', '#056B4E']}
            style={styles.modalGradient}
          >
            <SafeAreaView style={styles.modalContainer}>
              {/* Close Button */}
              <View style={styles.modalHeader}>
                <Pressable
                  onPress={() => setIsBreathingModalOpen(false)}
                  style={styles.modalCloseButton}
                >
                  <X size={24} color="#FFFFFF" />
                </Pressable>
              </View>

              {/* Interactive Breathing Area */}
              <View style={styles.breathingExerciseContainer}>
                <Text style={styles.modalTimerText}>
                  {formatTime(secondsRemaining)}
                </Text>
                
                <Text style={styles.modalPhaseText}>
                  {breathingPhase}
                </Text>

                {/* Animated Breathing Circles */}
                <View style={styles.animatedCircleContainer}>
                  {/* Background breathing pulse */}
                  <Animated.View
                    style={[
                      styles.breathingOuterRing,
                      { borderColor: theme.mintMedium },
                      animatedRingStyle,
                    ]}
                  />
                  {/* Middle ring */}
                  <Animated.View
                    style={[
                      styles.breathingMiddleRing,
                      { backgroundColor: theme.mintMedium + '44' },
                      animatedRingStyle,
                    ]}
                  />
                  {/* Central solid circle */}
                  <View style={[styles.breathingCenterCircle, { backgroundColor: theme.mintMedium }]}>
                    <Text style={styles.breathingCenterText}>Jeda</Text>
                  </View>
                </View>

                <Text style={styles.instructionDetail}>
                  Ikuti pergerakan lingkaran untuk menyelaraskan pernapasan Anda.
                </Text>
              </View>

              {/* Control Buttons */}
              <View style={styles.modalControls}>
                {isBreathingActive ? (
                  <Pressable
                    onPress={stopBreathing}
                    style={styles.controlButton}
                  >
                    <RotateCcw size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                    <Text style={styles.controlButtonText}>Ulangi</Text>
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={startBreathing}
                    style={[styles.controlButton, { backgroundColor: theme.mintMedium }]}
                  >
                    <Play size={20} color="#FFFFFF" style={{ marginRight: 8 }} fill="#FFFFFF" />
                    <Text style={styles.controlButtonText}>Mulai Lagi</Text>
                  </Pressable>
                )}
              </View>
            </SafeAreaView>
          </LinearGradient>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileText: {
    marginLeft: Spacing.two,
  },
  greetingText: {
    fontSize: 13,
    fontWeight: '500',
  },
  nameText: {
    fontSize: 16,
    fontWeight: '700',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: 18,
  },
  streakText: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 6,
  },
  quoteSection: {
    paddingHorizontal: Spacing.five,
    marginTop: Spacing.two,
    alignItems: 'center',
  },
  quoteText: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 25,
    textAlign: 'center',
  },
  quoteAuthor: {
    fontSize: 13,
    fontWeight: '400',
    marginTop: Spacing.two,
    textAlign: 'center',
  },
  whiteCardScroll: {
    flex: 1,
    marginTop: Spacing.four,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  whiteCardContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.six + 90, // extra spacing for bottom tabs
  },
  promptText: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    color: '#414D46',
    lineHeight: 25,
    marginBottom: Spacing.four,
    paddingHorizontal: Spacing.two,
  },
  moodButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.four,
  },
  moodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    marginHorizontal: Spacing.one,
  },
  moodButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: Spacing.two,
  },
  breathingButton: {
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.five,
    shadowColor: '#2BD5A2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  breathingButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: Spacing.three,
    borderWidth: 1,
    borderColor: '#ECEFEF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  actionCardIconWrapper: {
    marginRight: Spacing.four,
  },
  actionCardContent: {
    flex: 1,
  },
  actionCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A2520',
  },
  actionCardSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  
  // MODAL STYLING
  modalOverlay: {
    flex: 1,
  },
  modalGradient: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    padding: Spacing.four,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.two,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  breathingExerciseContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTimerText: {
    color: '#FFFFFF',
    fontSize: 44,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: Spacing.one,
  },
  modalPhaseText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '600',
    opacity: 0.95,
    marginBottom: Spacing.six,
  },
  animatedCircleContainer: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.six,
  },
  breathingOuterRing: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 3,
  },
  breathingMiddleRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  breathingCenterCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  breathingCenterText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  instructionDetail: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: Spacing.five,
    lineHeight: 20,
  },
  modalControls: {
    paddingBottom: Spacing.five,
    alignItems: 'center',
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
