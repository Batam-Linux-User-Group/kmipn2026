/**
 * CustomButton.tsx
 *
 * Komponen tombol premium JEDA yang reusable.
 * Mendukung:
 *   - State aktif (JEDA Green #3BCFA6) dan disabled (abu-abu)
 *   - Animasi skala saat ditekan (Reanimated)
 *   - Variant: 'primary' | 'secondary' | 'outline'
 */

import { useCallback } from 'react';
import { Pressable, StyleSheet, type ViewStyle, type TextStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';

// ─── JEDA Color Palette ──────────────────────────────────────────────────

export const JedaColors = {
  primary: '#3BCFA6',       // JEDA Green
  primaryDark: '#1A886A',   // JEDA Dark Green
  disabled: '#6B7280',      // Neutral Grey
  disabledBg: '#374151',    // Dark Grey Background
  white: '#FFFFFF',
  dark: '#0F172A',
  cardBg: '#1E293B',
  cardBorder: '#334155',
} as const;

// ─── Props ───────────────────────────────────────────────────────────────

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

// ─── Component ───────────────────────────────────────────────────────────

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CustomButton({
  title,
  onPress,
  disabled = false,
  variant = 'primary',
  style,
  textStyle,
}: CustomButtonProps) {
  const scale = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    if (!disabled) {
      scale.value = withSpring(0.95, { damping: 15, stiffness: 200 });
    }
  }, [disabled, scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const buttonStyles = getButtonStyles(variant, disabled);

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[styles.base, buttonStyles.container, animatedStyle, style]}>
      <ThemedText
        style={[styles.text, buttonStyles.text, textStyle]}
        type="default">
        {title}
      </ThemedText>
    </AnimatedPressable>
  );
}

// ─── Style Helpers ───────────────────────────────────────────────────────

function getButtonStyles(
  variant: 'primary' | 'secondary' | 'outline',
  disabled: boolean
): { container: ViewStyle; text: TextStyle } {
  if (disabled) {
    return {
      container: {
        backgroundColor: JedaColors.disabledBg,
        borderColor: JedaColors.disabled,
        opacity: 0.5,
      },
      text: {
        color: JedaColors.disabled,
      },
    };
  }

  switch (variant) {
    case 'primary':
      return {
        container: {
          backgroundColor: JedaColors.primary,
          borderColor: JedaColors.primary,
        },
        text: {
          color: JedaColors.dark,
          fontWeight: '700',
        },
      };
    case 'secondary':
      return {
        container: {
          backgroundColor: JedaColors.primaryDark,
          borderColor: JedaColors.primaryDark,
        },
        text: {
          color: JedaColors.white,
          fontWeight: '600',
        },
      };
    case 'outline':
      return {
        container: {
          backgroundColor: 'transparent',
          borderColor: JedaColors.primary,
          borderWidth: 2,
        },
        text: {
          color: JedaColors.primary,
          fontWeight: '600',
        },
      };
    default:
      return { container: {}, text: {} };
  }
}

// ─── Styles ──────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  base: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    minHeight: 56,
  },
  text: {
    fontSize: 17,
    letterSpacing: 0.3,
  },
});
