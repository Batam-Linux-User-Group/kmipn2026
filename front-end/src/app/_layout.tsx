import {
  Lexend_400Regular,
  Lexend_500Medium,
  Lexend_600SemiBold,
  Lexend_700Bold,
} from '@expo-google-fonts/lexend';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { useEffect } from 'react';

// SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Lexend_400Regular,
    Lexend_500Medium,
    Lexend_600SemiBold,
    Lexend_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="splash/splash" options={{ animation: "fade" }} />

      <Stack.Screen name="onboarding" options={{ animation: "fade" }} />
      <Stack.Screen name="auth/login" options={{ animation: "fade" }} />
      <Stack.Screen name="tabs" options={{ animation: "fade" }} />
      <Stack.Screen
        name="assessment"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen name="breathing" options={{ animation: "fade" }} />
      <Stack.Screen
        name="result"
        options={{ animation: "slide_from_right" }}
      />
    </Stack>
  );
}