import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import {
  Lexend_400Regular,
  Lexend_500Medium,
  Lexend_600SemiBold,
  Lexend_700Bold,
} from '@expo-google-fonts/lexend';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

// Cegah native splash hilang sebelum font siap
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Lexend_400Regular,
    Lexend_500Medium,
    Lexend_600SemiBold,
    Lexend_700Bold,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Sesuaikan dengan path file aktual di folder app/ */}
      <Stack.Screen name="splash/splash" options={{ animation: 'none' }} />

      <Stack.Screen name="onboarding"    options={{ animation: 'fade' }} />
      <Stack.Screen name="auth/login"    options={{ animation: 'fade' }} />
      <Stack.Screen name="auth/register" options={{ animation: 'fade' }} />
      <Stack.Screen name="assessment"    options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="trading-plan"  options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="breathing"     options={{ animation: 'fade' }} />
      <Stack.Screen name="result"        options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="tabs"          options={{ animation: 'fade' }} />
    </Stack>
  );
}