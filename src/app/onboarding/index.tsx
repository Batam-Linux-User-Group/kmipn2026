import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

import OnboardingScreen from "@/app/onboarding";
// Sesuaikan path import OnboardingScreen dengan lokasi file kamu.
// Contoh alternatif:
// import OnboardingScreen from "@/components/OnboardingScreen";
// import OnboardingScreen from "./onboarding"; // jika file bernama onboarding.tsx di folder yang sama

export default function OnboardingPage() {
  const handleFinish = async () => {
    await AsyncStorage.setItem("onboarding_done", "true");
    router.replace("/auth/login");
  };

  return <OnboardingScreen onFinish={handleFinish} />;
}