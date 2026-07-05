import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="edit" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="account-settings" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="app-settings" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="about" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}