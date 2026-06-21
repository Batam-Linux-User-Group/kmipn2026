/**
 * BreathingScreen.tsx
 *
 * Layar Intervensi Krisis JEDA — Latihan Pernapasan Terpandu (Box Breathing).
 *
 * ATURAN KETAT (sesuai PRD):
 *   - 45 DETIK LOCKDOWN: Pengguna TIDAK BISA keluar selama 45 detik.
 *   - BackHandler di-override sepenuhnya (Android hardware back button diblokir).
 *   - Tidak ada tombol skip/close yang visible selama lockdown.
 *   - Setelah 45 detik, tombol "Selesai Jeda" muncul.
 *
 * Metode: Box Breathing
 *   - 4 detik Tarik Napas (Inhale) — lingkaran membesar
 *   - 4 detik Tahan (Hold) — lingkaran statis
 *   - 4 detik Hembuskan (Exhale) — lingkaran mengecil
 *   - 4 detik Tahan (Hold) — lingkaran statis
 *   - Siklus berulang sampai 45 detik selesai
 *
 * Animasi: react-native-reanimated (hardware-accelerated, 60 FPS)
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CustomButton, JedaColors } from '@/components/CustomButton';
import { ThemedText } from '@/components/themed-text';

// ─── Constants ───────────────────────────────────────────────────────────

const LOCKDOWN_DURATION_SECONDS = 45;
const PHASE_DURATION_MS = 4000; // 4 detik per fase
const CYCLE_DURATION_MS = PHASE_DURATION_MS * 4; // 16 detik per siklus

type BreathingPhase = 'inhale' | 'hold_in' | 'exhale' | 'hold_out';

const PHASE_LABELS: Record<BreathingPhase, string> = {
  inhale: 'Tarik Napas',
  hold_in: 'Tahan',
  exhale: 'Hembuskan',
  hold_out: 'Tahan',
};

const PHASE_COLORS: Record<BreathingPhase, string> = {
  inhale: '#0D4A3B',
  hold_in: '#0D3D4A',
  exhale: '#1A2744',
  hold_out: '#1A1A3A',
};

// ─── Props ───────────────────────────────────────────────────────────────

interface BreathingScreenProps {
  onComplete: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────

export function BreathingScreen({ onComplete }: BreathingScreenProps) {
  const insets = useSafeAreaInsets();

  // ── Lockdown State ──
  const [secondsRemaining, setSecondsRemaining] = useState(LOCKDOWN_DURATION_SECONDS);
  const [isLocked, setIsLocked] = useState(true);
  const [currentPhase, setCurrentPhase] = useState<BreathingPhase>('inhale');
  const [phaseCountdown, setPhaseCountdown] = useState(4);

  // ── Reanimated: Lingkaran Pernapasan ──
  const circleScale = useSharedValue(0.6);
  const circleOpacity = useSharedValue(0.6);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── BackHandler: BLOKIR PENUH selama lockdown ──
  useEffect(() => {
    const handler = () => {
      // Selalu return true selama lockdown → blokir navigasi mundur
      if (isLocked) return true;
      return false; // Setelah lockdown selesai, izinkan navigasi
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      handler
    );
    return () => subscription.remove();
  }, [isLocked]);

  // ── Timer Countdown Lockdown (45 detik) ──
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setIsLocked(false);
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // ── Breathing Phase Cycle ──
  useEffect(() => {
    const phases: BreathingPhase[] = ['inhale', 'hold_in', 'exhale', 'hold_out'];
    let phaseIndex = 0;
    let countdown = 4;

    // Set initial phase
    setCurrentPhase(phases[0]);
    setPhaseCountdown(4);

    phaseTimerRef.current = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        phaseIndex = (phaseIndex + 1) % phases.length;
        countdown = 4;
        setCurrentPhase(phases[phaseIndex]);
      }
      setPhaseCountdown(countdown === 0 ? 4 : countdown);
    }, 1000);

    return () => {
      if (phaseTimerRef.current) clearInterval(phaseTimerRef.current);
    };
  }, []);

  // ── Animasi Lingkaran Pernapasan ──
  useEffect(() => {
    // Siklus: membesar (4s) → statis (4s) → mengecil (4s) → statis (4s)
    circleScale.value = withRepeat(
      withSequence(
        // Inhale: skala naik ke 1.0
        withTiming(1.0, {
          duration: PHASE_DURATION_MS,
          easing: Easing.inOut(Easing.sin),
        }),
        // Hold In: tetap di 1.0
        withTiming(1.0, {
          duration: PHASE_DURATION_MS,
          easing: Easing.linear,
        }),
        // Exhale: skala turun ke 0.6
        withTiming(0.6, {
          duration: PHASE_DURATION_MS,
          easing: Easing.inOut(Easing.sin),
        }),
        // Hold Out: tetap di 0.6
        withTiming(0.6, {
          duration: PHASE_DURATION_MS,
          easing: Easing.linear,
        })
      ),
      -1, // Infinite repeat
      false // No reverse
    );

    circleOpacity.value = withRepeat(
      withSequence(
        withTiming(1.0, { duration: PHASE_DURATION_MS, easing: Easing.inOut(Easing.sin) }),
        withTiming(1.0, { duration: PHASE_DURATION_MS }),
        withTiming(0.6, { duration: PHASE_DURATION_MS, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.6, { duration: PHASE_DURATION_MS })
      ),
      -1,
      false
    );

    return () => {
      cancelAnimation(circleScale);
      cancelAnimation(circleOpacity);
    };
  }, [circleScale, circleOpacity]);

  const animatedCircleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.value }],
    opacity: circleOpacity.value,
  }));

  const handleComplete = useCallback(() => {
    if (!isLocked) {
      onComplete();
    }
  }, [isLocked, onComplete]);

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          backgroundColor: PHASE_COLORS[currentPhase],
        },
      ]}>
      {/* ── Status Header ── */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>🧘 Jeda Napas</ThemedText>
        {isLocked && (
          <ThemedText style={styles.lockdownText}>
            Sesi terkunci • {secondsRemaining} detik tersisa
          </ThemedText>
        )}
      </View>

      {/* ── Breathing Circle ── */}
      <View style={styles.circleContainer}>
        {/* Outer Glow Ring */}
        <Animated.View style={[styles.glowRing, animatedCircleStyle]} />

        {/* Main Circle */}
        <Animated.View style={[styles.breathingCircle, animatedCircleStyle]}>
          <ThemedText style={styles.phaseLabel}>
            {PHASE_LABELS[currentPhase]}
          </ThemedText>
          <ThemedText style={styles.phaseCountdown}>
            {phaseCountdown}
          </ThemedText>
        </Animated.View>
      </View>

      {/* ── Instruksi ── */}
      <View style={styles.instructionContainer}>
        <ThemedText style={styles.instructionText}>
          Ikuti ritme lingkaran.{'\n'}
          Fokus pada pernapasan Anda.
        </ThemedText>
      </View>

      {/* ── Bottom: Tombol Selesai (hanya muncul setelah lockdown) ── */}
      <View style={styles.bottomBar}>
        {isLocked ? (
          <Animated.View entering={FadeIn.duration(300)}>
            <View style={styles.lockedIndicator}>
              <ThemedText style={styles.lockedText}>
                🔒 Mohon selesaikan sesi pernapasan ini
              </ThemedText>
            </View>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn.duration(500)}>
            <CustomButton
              title="Selesai Jeda ✓"
              onPress={handleComplete}
              variant="primary"
              style={styles.completeButton}
            />
          </Animated.View>
        )}
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    paddingTop: 24,
    gap: 8,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  lockdownText: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  circleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'rgba(59, 207, 166, 0.2)',
  },
  breathingCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(59, 207, 166, 0.15)',
    borderWidth: 3,
    borderColor: JedaColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  phaseLabel: {
    color: JedaColors.primary,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  phaseCountdown: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '300',
    lineHeight: 56,
  },
  instructionContainer: {
    paddingHorizontal: 40,
    paddingBottom: 12,
  },
  instructionText: {
    color: '#94A3B8',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomBar: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    width: '100%',
  },
  lockedIndicator: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    alignItems: 'center',
  },
  lockedText: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  completeButton: {
    width: '100%',
  },
});
