import {
  Lexend_400Regular,
  Lexend_500Medium,
  Lexend_600SemiBold,
  Lexend_700Bold,
} from "@expo-google-fonts/lexend";

import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useColorScheme } from "react-native";

function ThemedWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // expo-router SDK 56: avoid @react-navigation/native ThemeProvider here.
  return <>{children}</>;
}

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    Lexend_400Regular,
    Lexend_500Medium,
    Lexend_600SemiBold,
    Lexend_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontError, fontsLoaded]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemedWrapper>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Entry point — redirects to onboarding or tabs */}
        <Stack.Screen name="index" />

        {/* Onboarding slides */}
        <Stack.Screen
          name="onboarding/index"
          options={{ animation: "fade" }}
        />

        {/* Auth / Login */}
        <Stack.Screen
          name="auth/login"
          options={{ animation: "fade" }}
        />

        {/* Main app tabs */}
        <Stack.Screen
          name="(tabs)"
          options={{ animation: "fade" }}
        />
      </Stack>
    </ThemedWrapper>
  );
}