import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
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

  const bgOpacity      = useSharedValue(1);
  const whiteBgOpacity = useSharedValue(0);
  const logoScale      = useSharedValue(0);
  const logoOpacity    = useSharedValue(0);
  const logoTranslateY = useSharedValue(40);

  const tealBgStyle  = useAnimatedStyle(() => ({ opacity: bgOpacity.value }));
  const whiteBgStyle = useAnimatedStyle(() => ({ opacity: whiteBgOpacity.value }));
  const logoStyle    = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { scale: logoScale.value },
      { translateY: logoTranslateY.value },
    ],
  }));

  useEffect(() => {
    const navigate = () => router.replace('/onboarding');

    const fadeIn  = { duration: 600, easing: Easing.inOut(Easing.ease) };
    const fadeOut = { duration: 500, easing: Easing.in(Easing.cubic) };

    bgOpacity.value = withSequence(
      withDelay(500, withTiming(0, fadeIn)),
      withDelay(1200, withTiming(1, fadeIn))
    );

    whiteBgOpacity.value = withSequence(
      withDelay(500, withTiming(1, fadeIn)),
      withDelay(1200, withTiming(0, fadeOut))
    );

   logoTranslateY.value = withSequence(
  withDelay(1100, withSpring(0, { damping: 18, stiffness: 150 })), // naik ke tengah
  withDelay(900, withTiming(-30, { duration: 500, easing: Easing.in(Easing.ease) })) // exit ke atas
);
    logoScale.value = withSequence(
      withDelay(1100, withSpring(1, { damping: 18, stiffness: 150 })),
      withDelay(900, withTiming(0.85, { duration: 500 }))
    );
    logoOpacity.value = withSequence(
      withDelay(1100, withTiming(1, { duration: 300 })),
      withDelay(1100, withTiming(0, { duration: 500, easing: Easing.in(Easing.ease) },
        (finished) => { if (finished) runOnJS(navigate)(); }
      ))
    );
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[StyleSheet.absoluteFill, tealBgStyle]}>
        <View style={styles.blobTop} />
        <View style={styles.blobBottom} />
      </Animated.View>

      <Animated.View
        style={[StyleSheet.absoluteFill, whiteBgStyle, { backgroundColor: '#FFFFFF' }]}
      />

      <View style={styles.logoContainer}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.logoLayer, logoStyle]}>
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