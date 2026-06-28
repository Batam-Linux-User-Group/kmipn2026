import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Flame } from "lucide-react-native";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";
import { Image } from "react-native";

import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";


function CalendarIcon() {
  return (
    <Svg width={44} height={44} viewBox="0 0 44 44" fill="none">
      <Path
        d="M8 12c0-2.2 1.8-4 4-4h20c2.2 0 4 1.8 4 4v22c0 2.2-1.8 4-4 4H12c-2.2 0-4-1.8-4-4V12z"
        stroke="#2BD5A2"
        strokeWidth={3}
        fill="#FFFFFF"
      />
      <Path
        d="M14 4v6M30 4v6"
        stroke="#2BD5A2"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Path d="M8 18h28" stroke="#2BD5A2" strokeWidth={2} />
      <Path
        d="M21 23v10M19 25l2-2"
        stroke="#2BD5A2"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function BookIcon() {
  return (
    <Svg width={44} height={44} viewBox="0 0 44 44" fill="none">
      <Path
        d="M14 8h20c1.1 0 2 .9 2 2v24c0 1.1-.9 2-2 2H14c-1.1 0-2-.9-2-2V10c0-1.1.9-2 2-2z"
        fill="#2BD5A2"
      />
      <Path
        d="M8 12h6M8 18h6M8 24h6M8 30h6"
        stroke="#FFFFFF"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <Path
        d="M10 8v28c0 1.1.9 2 2 2h2v-32h-2c-1.1 0-2 .9-2 2z"
        fill="#1EB588"
      />
      <Path
        d="M30 14h-8M30 20h-8M26 26h-4"
        stroke="#FFFFFF"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [mood, setMood] = useState<"tidak" | "ya">("ya");

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.mintGradientStart, theme.mintGradientEnd]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.4 }}
      />
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        {/* HEADER SECTION */}
        <View style={styles.header}>
          <View style={styles.profileContainer}>
<Image
  source={require('@/assets/images/logo-shield.png')}
  style={{ width: 38, height: 38 }}
  resizeMode="contain"
/>
            <View style={styles.profileText}>
              <Text
                style={[styles.greetingText, { color: theme.mintDark + "99" }]}
              >
                Selamat Pagi
              </Text>
              <Text style={[styles.nameText, { color: theme.mintDark }]}>
                Fawwaz Khairiy Wahid
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.streakContainer,
              { backgroundColor: theme.mintStreakBackground },
            ]}
          >
            <Flame
              size={20}
              color={theme.streakOrange}
              fill={theme.streakOrange}
            />
            <Text style={[styles.streakText, { color: theme.text }]}>7</Text>
          </View>
        </View>

        {/* QUOTE SECTION */}
        <View style={styles.quoteSection}>
          <Text style={[styles.quoteText, { color: "#11221A" }]}>
            Investasi yang sehat dimulai dengan perencanaan yang matang, bukan
            dorongan impulsif.
          </Text>
          <Text style={[styles.quoteAuthor, { color: theme.cardSubtitle }]}>
            — Prinsip Investasi Sehat
          </Text>
        </View>

        {/* WHITE MAIN CARD */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.whiteCardScroll}
          contentContainerStyle={styles.whiteCardContent}
        >
          <Text style={styles.promptText}>
            Emosi anda hari ini kurang baik hari ini, mohon ambil JEDA!
          </Text>

          {/* MOOD BUTTONS */}
          <View style={styles.moodButtonsRow}>
            {/* TIDAK BUTTON */}
            <Pressable
              onPress={() => setMood("tidak")}
              style={[
                styles.moodButton,
                mood === "tidak"
                  ? {
                      backgroundColor: theme.mintDark,
                      borderColor: theme.mintDark,
                    }
                  : {
                      backgroundColor: "#FFFFFF",
                      borderColor: theme.mintBorder,
                    },
              ]}
            >
              <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                <Circle
                  cx={12}
                  cy={12}
                  r={10}
                  stroke={mood === "tidak" ? "#FFFFFF" : theme.mintDark}
                  strokeWidth={2.5}
                />
                <Path
                  d="M8 10c.3-.5.8-.5 1.2 0M14.8 10c.3-.5.8-.5 1.2 0"
                  stroke={mood === "tidak" ? "#FFFFFF" : theme.mintDark}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
                <Path
                  d="M8 15c1 1.5 2.5 2 4 2s3-.5 4-2"
                  stroke={mood === "tidak" ? "#FFFFFF" : theme.mintDark}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </Svg>
              <Text
                style={[
                  styles.moodButtonText,
                  { color: mood === "tidak" ? "#FFFFFF" : theme.mintDark },
                ]}
              >
                Tidak
              </Text>
            </Pressable>

            {/* YA BUTTON */}
            <Pressable
              onPress={() => setMood("ya")}
              style={[
                styles.moodButton,
                mood === "ya"
                  ? {
                      backgroundColor: theme.mintDark,
                      borderColor: theme.mintDark,
                    }
                  : {
                      backgroundColor: "#FFFFFF",
                      borderColor: theme.mintBorder,
                    },
              ]}
            >
              <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                <Circle
                  cx={12}
                  cy={12}
                  r={10}
                  stroke={mood === "ya" ? "#FFFFFF" : theme.mintDark}
                  strokeWidth={2.5}
                />
                <Path
                  d="M9 10h.01M15 10h.01"
                  stroke={mood === "ya" ? "#FFFFFF" : theme.mintDark}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                />
                <Path
                  d="M16 16c-1-1.5-2.5-2-4-2s-3 .5-4 2"
                  stroke={mood === "ya" ? "#FFFFFF" : theme.mintDark}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </Svg>
              <Text
                style={[
                  styles.moodButtonText,
                  { color: mood === "ya" ? "#FFFFFF" : theme.mintDark },
                ]}
              >
                Ya
              </Text>
            </Pressable>
          </View>

          {/* BREATHING TRIGGER */}
          <Pressable
            onPress={() => router.push('/breathing')}
            style={({ pressed }) => [
              styles.breathingButton,
              { backgroundColor: theme.mintMedium },
              pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
            ]}
          >
            <Text style={styles.breathingButtonText}>Pernapasan 2 menit</Text>
          </Pressable>

          {/* ACTION CARDS */}
          <Pressable
            onPress={() => router.push('/assessment')}
            style={({ pressed }) => [
              styles.actionCard,
              pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
            ]}
          >
            <View style={styles.actionCardIconWrapper}>
              <CalendarIcon />
            </View>
            <View style={styles.actionCardContent}>
              <Text style={styles.actionCardTitle}>Daily Question</Text>
              <Text
                style={[
                  styles.actionCardSubtitle,
                  { color: theme.cardSubtitle },
                ]}
              >
                Answer to activate streak
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={() => router.push('/journal')}
            style={({ pressed }) => [
              styles.actionCard,
              pressed && { opacity: 0.9, transform: [{ scale: 0.99 }] },
            ]}
          >
            <View style={styles.actionCardIconWrapper}>
              <BookIcon />
            </View>
            <View style={styles.actionCardContent}>
              <Text style={styles.actionCardTitle}>Self Journalling</Text>
              <Text
                style={[
                  styles.actionCardSubtitle,
                  { color: theme.cardSubtitle },
                ]}
              >
                Manual Input
              </Text>
            </View>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileText: {
    marginLeft: Spacing.two,
  },
  greetingText: {
    fontSize: 13,
    fontWeight: "500",
  },
  nameText: {
    fontSize: 16,
    fontWeight: "700",
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.three,
    paddingVertical: 6,
    borderRadius: 18,
  },
  streakText: {
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 6,
  },
  quoteSection: {
    paddingHorizontal: Spacing.five,
    marginTop: Spacing.two,
    alignItems: "center",
  },
  quoteText: {
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 25,
    textAlign: "center",
  },
  quoteAuthor: {
    fontSize: 13,
    fontWeight: "400",
    marginTop: Spacing.two,
    textAlign: "center",
  },
  whiteCardScroll: {
    flex: 1,
    marginTop: Spacing.four,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  whiteCardContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.six + 90, 
  },
  promptText: {
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
    color: "#414D46",
    lineHeight: 25,
    marginBottom: Spacing.four,
    paddingHorizontal: Spacing.two,
  },
  moodButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.four,
  },
  moodButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    marginHorizontal: Spacing.one,
  },
  moodButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: Spacing.two,
  },
  breathingButton: {
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.five,
    shadowColor: "#2BD5A2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  breathingButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  actionCard: {
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
    marginBottom: Spacing.three,
    borderWidth: 1,
    borderColor: "#ECEFEF",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  actionCardIconWrapper: {
    marginRight: Spacing.four,
  },
  actionCardContent: {
    flex: 1,
  },
  actionCardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A2520",
  },
  actionCardSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    marginTop: 2,
  },
});
