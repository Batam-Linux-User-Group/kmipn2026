// src/screens/BreathingScreen.tsx
// 30-second breathing exercise with React Native Animated (built-in).
// Black background, auto-navigates when timer expires.
// Does NOT use react-native-reanimated, so it is immune to "reduced motion" warnings.

import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Dimensions,
  Easing,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { useAssessmentStore } from '@/store/useAssessmentStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Duration in seconds
const BREATHING_DURATION = 30;
// Each cycle: 3s inhale + 3s exhale = 6s
const CYCLE_DURATION = 6000;
const INHALE_DURATION = 3000;
const EXHALE_DURATION = 3000;

// ─── JEDA Shield Logo (white version for dark bg) ────────────
function JedaLogoWhite({ size = 48 }: { size?: number }) {
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

export default function BreathingScreen() {
  const router = useRouter();
  const { pendingNextNodeId, goToNode, setPendingNextNodeId } =
    useAssessmentStore();

  const [breathingText, setBreathingText] = useState('Tarik Napas');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasNavigated = useRef(false);

  // React Native Animated Values
  const circleScale = useRef(new Animated.Value(1.0)).current;
  const waveScale = useRef(new Animated.Value(1.0)).current;
  const waveOpacity = useRef(new Animated.Value(0.0)).current;

  // Start the animation loops
  useEffect(() => {
    // 1. Circle Scale Animation: 1.0 → 1.8 (3s) → 1.0 (3s), infinite
    const circleAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(circleScale, {
          toValue: 1.8,
          duration: INHALE_DURATION,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
        Animated.timing(circleScale, {
          toValue: 1.0,
          duration: EXHALE_DURATION,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }),
      ])
    );

    // 2. Wave Scale Animation: 1.0 → 2.5 (6s), resets to 1.0 internally, infinite
    // To make it repeat seamlessly, we animate 1 -> 2.5, then jump back to 1
    const waveScaleAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(waveScale, {
          toValue: 2.5,
          duration: CYCLE_DURATION,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(waveScale, {
          toValue: 1.0, // Instantly jump back
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    // 3. Wave Opacity Animation: 0.0 → 0.4 (3s) → 0.0 (3s), infinite
    const waveOpacityAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(waveOpacity, {
          toValue: 0.4,
          duration: INHALE_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(waveOpacity, {
          toValue: 0.0,
          duration: EXHALE_DURATION,
          useNativeDriver: true,
        }),
      ])
    );

    circleAnim.start();
    waveScaleAnim.start();
    waveOpacityAnim.start();

    // Track phase text via interval (3s inhale, 3s exhale)
    let elapsed = 0;
    const phaseInterval = setInterval(() => {
      const cyclePos = elapsed % 6;
      if (cyclePos < 3) {
        setBreathingText('Tarik Napas');
      } else {
        setBreathingText('Hembuskan...');
      }
      elapsed += 0.5;
    }, 500);
    phaseRef.current = phaseInterval;

    return () => {
      // Cleanup: stop all animations and intervals
      circleAnim.stop();
      waveScaleAnim.stop();
      waveOpacityAnim.stop();
      if (phaseRef.current) clearInterval(phaseRef.current);
    };
  }, [circleScale, waveScale, waveOpacity]);

  // 30-second countdown timer
  useEffect(() => {
    const startTime = Date.now();

    const countdown = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      if (elapsed >= BREATHING_DURATION && !hasNavigated.current) {
        hasNavigated.current = true;
        clearInterval(countdown);
        handleTimerComplete();
      }
    }, 200);

    timerRef.current = countdown;

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Block back button during breathing
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => true // Prevent going back
    );
    return () => backHandler.remove();
  }, []);

  const handleTimerComplete = useCallback(() => {
    if (pendingNextNodeId) {
      if (pendingNextNodeId === 'result') {
        setPendingNextNodeId(null);
        router.replace('/result');
      } else {
        goToNode(pendingNextNodeId);
        setPendingNextNodeId(null);
        router.replace('/assessment');
      }
    } else {
      // Fallback: If no pending node, we came from Dashboard. Go back there.
      router.back();
    }
  }, [pendingNextNodeId, goToNode, setPendingNextNodeId, router]);

  return (
    <View style={styles.container}>
      {/* Background Gradient Wave */}
      <Animated.View
        style={[
          styles.waveContainer,
          {
            transform: [{ scale: waveScale }],
            opacity: waveOpacity,
          },
        ]}
      >
        <Svg height={SCREEN_HEIGHT * 1.5} width={SCREEN_HEIGHT * 1.5} viewBox="0 0 100 100">
          <Defs>
            <RadialGradient
              id="grad"
              cx="50"
              cy="50"
              rx="50"
              ry="50"
              fx="50"
              fy="50"
              gradientUnits="userSpaceOnUse"
            >
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.4" />
              <Stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.1" />
              <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100" height="100" fill="url(#grad)" />
        </Svg>
      </Animated.View>

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Header with logo */}
        <View style={styles.headerContainer}>
          <View style={styles.logoRow}>
            <JedaLogoWhite size={48} />
            <Text style={styles.logoLabel}>JEDA</Text>
          </View>
        </View>

        {/* Breathing Circle Area */}
        <View style={styles.breathingArea}>
          <View style={styles.circleContainer}>
            {/* Animated Circle Outline */}
            <Animated.View
              style={[
                styles.circleOutline,
                { transform: [{ scale: circleScale }] },
              ]}
            >
              {/* Text inside circle */}
              <Text style={styles.breathingPhaseText}>{breathingText}</Text>
            </Animated.View>
          </View>

          {/* Instruction below circle with increased margin to avoid overlap */}
          <Text style={styles.instructionText}>
            Bernapaslah Perlahan,{'\n'}Mengikuti Tempo Lingkaran
          </Text>
        </View>

        {/* Bottom Navigation Pills (Only show if coming from assessment) */}
        {pendingNextNodeId ? (
          <SafeAreaView edges={['bottom']} style={styles.bottomNav}>
            <Pressable style={[styles.pillButton, styles.pillButtonDisabled]}>
              <Text style={[styles.pillButtonText, styles.pillButtonTextOnDark]}>
                Kembali
              </Text>
            </Pressable>

            <View style={styles.dotIndicator} />

            <Pressable style={[styles.pillButton, styles.pillButtonDisabled]}>
              <Text style={[styles.pillButtonText, styles.pillButtonTextOnDark]}>
                Selanjutnya
              </Text>
            </Pressable>
          </SafeAreaView>
        ) : null}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  waveContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -SCREEN_HEIGHT * 0.75, // Center the wave
    marginLeft: -SCREEN_HEIGHT * 0.75,
    width: SCREEN_HEIGHT * 1.5,
    height: SCREEN_HEIGHT * 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0,
  },
  safeArea: {
    flex: 1,
    zIndex: 1,
  },

  // Header
  headerContainer: {
    alignItems: 'center',
    paddingTop: 16,
  },
  logoLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 4,
    letterSpacing: 1,
  },

  // Breathing area
  breathingArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleContainer: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  circleOutline: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  breathingPhaseText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  instructionText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 22,
    marginTop: 60, // Added larger margin top to ensure no overlap when the circle scales to 1.8x
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
  },
  pillButtonDisabled: {
    opacity: 0.3,
  },
  pillButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  pillButtonTextOnDark: {
    color: '#3BCFA6',
  },
  dotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    opacity: 0.3,
  },
});
