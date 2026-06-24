import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_W } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  
  // Shared Values
  const bgOpacity = useSharedValue(1);
  const whiteBgOpacity = useSharedValue(0);
  const stemsScale = useSharedValue(0);

  // Animated Styles
  const tealBgStyle = useAnimatedStyle(() => ({ opacity: bgOpacity.value }));
  const whiteBgStyle = useAnimatedStyle(() => ({ opacity: whiteBgOpacity.value }));
  const stemsStyle = useAnimatedStyle(() => ({
    transform: [{ scale: stemsScale.value }],
    opacity: stemsScale.value, // Opacity mengikuti nilai scale agar fade-in bersamaan
  }));

  useEffect(() => {
    // TIMELINE ANIMASI:
    // 0ms - 500ms   : Tahan layar Teal (Initial state)
    // 500ms - 1100ms: Crossfade lembut ke layar Putih
    // 1100ms - 1600ms: Logo muncul dengan efek Spring (membal)
    // 1600ms - 2400ms: Tahan logo di layar
    // 2400ms - 3000ms: Crossfade kembali ke Teal & Logo menghilang mengecil

    const fadeConfig = { duration: 600, easing: Easing.inOut(Easing.ease) };

    // Animasi Background Teal
    bgOpacity.value = withSequence(
      withDelay(500, withTiming(0, fadeConfig)),
      // Delay 1300ms dihitung SETELAH animasi fade out 600ms selesai
      withDelay(1300, withTiming(1, fadeConfig)) 
    );

    // Animasi Background Putih
    whiteBgOpacity.value = withSequence(
      withDelay(500, withTiming(1, fadeConfig)),
      withDelay(1300, withTiming(0, fadeConfig))
    );

    // Animasi Logo
    stemsScale.value = withSequence(
      // Mulai muncul setelah layar putih siap (500ms delay + 600ms fade)
      withDelay(1100, withSpring(1, { damping: 14, stiffness: 120 })),
      // Tahan logo selama 800ms, lalu hilangkan
      withDelay(800, withTiming(0, { duration: 500, easing: Easing.in(Easing.ease) }))
    );

    // Navigasi ke onboarding setelah seluruh sequence 3000ms selesai + sedikit buffer
    const navigationTimer = setTimeout(() => {
      router.replace('/onboarding');
    }, 3200);

    return () => clearTimeout(navigationTimer);
  }, [router]);

  return (
    <View style={styles.container}>
      {/* Background Teal dengan Blobs */}
      <Animated.View style={[StyleSheet.absoluteFill, tealBgStyle]}>
        <View style={styles.blobTop} />
        <View style={styles.blobBottom} />
      </Animated.View>

      {/* Background Putih */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          whiteBgStyle,
          { backgroundColor: '#FFFFFF' },
        ]}
      />

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Animated.View style={[styles.logoLayer, stemsStyle]}>
          <Image
            source={require('@/assets/images/logo-shield.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3BCFA6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blobTop: {
    position: 'absolute',
    width: SCREEN_W * 1.4,
    height: 180,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 999,
    top: 120,
    left: -50,
    transform: [{ rotate: '15deg' }],
  },
  blobBottom: {
    position: 'absolute',
    width: SCREEN_W * 1.5,
    height: 220,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 999,
    bottom: 80,
    right: -100,
    transform: [{ rotate: '15deg' }],
  },
  logoContainer: {
    width: 170,
    height: 191,
    position: 'relative',
  },
  logoLayer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
});