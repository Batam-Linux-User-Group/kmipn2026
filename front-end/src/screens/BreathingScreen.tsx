// src/screens/BreathingScreen.tsx
// 30-second breathing exercise with Reanimated circle animation.
// Black background, auto-navigates when timer expires.

import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { useAssessmentStore } from '@/store/useAssessmentStore';

// Duration in seconds
const BREATHING_DURATION = 30;
// Each cycle: 3s inhale + 3s exhale = 6s
const CYCLE_DURATION = 6000;
const INHALE_DURATION = 3000;
const EXHALE_DURATION = 3000;

// ─── JEDA Shield Logo (white version for dark bg) ────────────
function JedaLogoWhite({ size = 48 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <Path
        d="M18 3L6 8v9c0 5.5 3.5 10.7 8 13.5l4 2.5 4-2.5c4.5-2.8 8-8 8-13.5V8L18 3z"
        stroke="#3BCFA6"
        strokeWidth={2}
        fill="transparent"
      />
      <Path
        d="M18 23c2.5-2.5 4-5.5 4-8 0-1.5-1-2.5-2.5-2.5-1 0-1.8.8-2.5 1.5-.7-.7-1.5-1.5-2.5-1.5-1.5 0-2.5 1-2.5 2.5 0 2.5 1.5 5.5 4 8"
        stroke="#3BCFA6"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18 14v9"
        stroke="#3BCFA6"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
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

  // Reanimated shared value for circle scale
  const circleScale = useSharedValue(1.0);

  // Derived value to determine phase text (inhale when expanding, exhale when contracting)
  const animationProgress = useSharedValue(0); // 0 = start of cycle, goes 0→1 over 6s

  // Start the animation
  useEffect(() => {
    // Scale animation: 1.0 → 1.8 (3s) → 1.0 (3s), repeat
    circleScale.value = withRepeat(
      withSequence(
        withTiming(1.8, {
          duration: INHALE_DURATION,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(1.0, {
          duration: EXHALE_DURATION,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1, // infinite repeat
      false // don't reverse
    );

    // Track phase text via interval since useDerivedValue can't set React state
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
      cancelAnimation(circleScale);
      if (phaseRef.current) clearInterval(phaseRef.current);
    };
  }, []);

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
      // Fallback: go back to assessment
      router.replace('/assessment');
    }
  }, [pendingNextNodeId, goToNode, setPendingNextNodeId, router]);

  const animatedCircleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.value }],
  }));

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Header with logo */}
        <View style={styles.headerContainer}>
          <JedaLogoWhite size={48} />
          <Text style={styles.logoLabel}>JEDA</Text>
        </View>

        {/* Breathing Circle Area */}
        <View style={styles.breathingArea}>
          <View style={styles.circleContainer}>
            {/* Animated Circle Outline */}
            <Animated.View style={[styles.circleOutline, animatedCircleStyle]}>
              {/* Text inside circle */}
              <Text style={styles.breathingPhaseText}>{breathingText}</Text>
            </Animated.View>
          </View>

          {/* Instruction below circle */}
          <Text style={styles.instructionText}>
            Bernapaslah Perlahan,{'\n'}Mengikuti Tempo Lingkaran
          </Text>
        </View>

        {/* Bottom Navigation Pills (visual consistency, Selanjutnya disabled) */}
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
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  safeArea: {
    flex: 1,
  },

  // Header
  headerContainer: {
    alignItems: 'center',
    paddingTop: 16,
  },
  logoLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3BCFA6',
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
