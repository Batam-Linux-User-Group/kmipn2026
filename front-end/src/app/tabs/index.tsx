import React, { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Bell, Flame } from "lucide-react-native";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

import { Spacing } from "@/constants/theme";
import { FontFamily } from "@/constants/fontsfamily";
import { useTheme } from "@/hooks/use-theme";
import { usersApi, quotesApi, assessmentsApi, User, UserStreak, DailyQuote, TodayStatus } from "@/services/api";

// ─── SVG Icons for Menu Cards ───────────────────────────────

function DailyQuestionIcon() {
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

function SelfJournalIcon() {
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

function TradingPlanIcon() {
  return (
    <Svg width={44} height={44} viewBox="0 0 44 44" fill="none">
      <Path
        d="M10 32h6V18h-6v14zM19 32h6V10h-6v22zM28 32h6v-8h-6v8z"
        fill="#2BD5A2"
      />
      <Path
        d="M6 36h32"
        stroke="#2BD5A2"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Path
        d="M12 14l10-8 10 8"
        stroke="#2BD5A2"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function TakeJEDAIcon() {
  return (
    <Svg width={44} height={44} viewBox="0 0 44 44" fill="none">
      <Path
        d="M10 20c4-4 8-4 12 0s8 4 12 0"
        stroke="#2BD5A2"
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M10 26c4-4 8-4 12 0s8 4 12 0"
        stroke="#2BD5A2"
        strokeWidth={3}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [streak, setStreak] = useState<UserStreak | null>(null);
  const [quote, setQuote] = useState<DailyQuote | null>(null);
  const [todayStatus, setTodayStatus] = useState<TodayStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const [meRes, quoteRes, todayRes] = await Promise.all([
          usersApi.getMe(),
          quotesApi.getRandom(),
          assessmentsApi.getToday(),
        ]);
        if (!mounted) return;
        setUser(meRes.user);
        setStreak(meRes.streak);
        setQuote(quoteRes);
        setTodayStatus(todayRes);
      } catch (err) {
        console.error('[Home] loadData error:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#C5E3DE' }]}>
        <ActivityIndicator size="large" color="#3BCFA6" />
      </View>
    );
  }

  const displayName = user?.display_name || user?.username || 'Trader JEDA';
  const currentStreak = streak?.current_streak ?? 0;
  const quoteText = quote?.quote_text || 'Investasi yang sehat dimulai dengan perencanaan yang matang, bukan dorongan impulsif.';
  const quoteAuthor = quote?.author || 'Prinsip JEDA';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#A8EAD7", "#A8EAD7"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.3 }}
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
                {getGreeting()}
              </Text>
              <Text style={[styles.nameText, { color: theme.mintDark }]}>
                {displayName}
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
            <Text style={[styles.streakText, { color: theme.text }]}>{currentStreak}</Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ backgroundColor: 'transparent' }}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {/* WHITE SHEET BACKGROUND WRAPPER FOR SCROLL CONTENT */}
          <View style={styles.whiteSheet}>
            {/* QUOTES CARD */}
            <View style={styles.quotesCardOuter}>
              <View style={styles.quotesBlur}>
                <Text style={styles.quotesTitle}>Quotes of the day</Text>
                <Text style={styles.quotesText}>
                  {quoteText}
                </Text>
                <Text style={styles.quotesAuthor}>
                  — {quoteAuthor}
                </Text>
              </View>
            </View>

            {/* MENU GRID 2×2 */}
            <View style={styles.menuGrid}>
              <View style={styles.menuRow}>
                <Pressable
                  onPress={() => router.push('/assessment')}
                  style={({ pressed }) => [
                    styles.menuCard,
                    pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
                  ]}
                >
                  <DailyQuestionIcon />
                  <Text style={styles.menuCardTitle}>Daily{"\n"}Question</Text>
                </Pressable>

                <Pressable
                  onPress={() => router.push('/journal')}
                  style={({ pressed }) => [
                    styles.menuCard,
                    pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
                  ]}
                >
                  <SelfJournalIcon />
                  <Text style={styles.menuCardTitle}>Self{"\n"}Journalling</Text>
                </Pressable>
              </View>

              <View style={styles.menuRow}>
                <Pressable
                  onPress={() => router.push('/trading-plan')}
                  style={({ pressed }) => [
                    styles.menuCard,
                    pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
                  ]}
                >
                  <TradingPlanIcon />
                  <Text style={styles.menuCardTitle}>Trading{"\n"}Plan</Text>
                </Pressable>

                <Pressable
                  onPress={() => router.push('/breathing')}
                  style={({ pressed }) => [
                    styles.menuCard,
                    pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
                  ]}
                >
                  <TakeJEDAIcon />
                  <Text style={styles.menuCardTitle}>Take{"\n"}JEDA</Text>
                </Pressable>
              </View>
            </View>

            {/* EMOTION BANNER CAPSULE */}
            {todayStatus && (
              <View style={styles.emotionBanner}>
                <View style={styles.emotionInnerContainer}>
                  <Text style={styles.emotionBannerText}>
                    {!todayStatus.isCompletedToday ? (
                      <>
                        Anda belum mengisi Daily Question hari ini. Yuk <Text style={styles.emotionBannerBold}>JEDA!</Text>
                      </>
                    ) : todayStatus.risk_status === 'Rendah' ? (
                      <>
                        Emosi Anda hari ini terpantau stabil. Tetap pertahankan <Text style={styles.emotionBannerBold}>JEDA!</Text>
                      </>
                    ) : (
                      <>
                        Emosi Anda hari ini kurang stabil ({todayStatus.risk_status}). Mohon ambil <Text style={styles.emotionBannerBold}>JEDA!</Text>
                      </>
                    )}
                  </Text>
                </View>
                <View style={styles.emotionBellWrapper}>
                  <Bell size={24} color="#000000" fill="#000000" />
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.four,
    paddingTop: 24, // Diturunkan dari Spacing.two agar elemen atas turun ke bawah
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
    fontFamily: FontFamily.manropeMedium,
  },
  nameText: {
    fontSize: 16,
    fontFamily: FontFamily.manropeBold,
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
    fontFamily: FontFamily.manropeBold,
    marginLeft: 6,
  },
  scrollContent: {
    paddingBottom: Spacing.six + 160, // Perbesar padding bottom agar bisa scroll lebih jauh ke bawah dan tidak terhalang navigation bar
  },
  whiteSheet: {
    backgroundColor: "#F8FAF9", // warna putih melengkung latar belakang card
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: 40,
    flex: 1,
    marginTop: 10, // Dinaikkan lebih ke atas (sebelumnya Spacing.four)
  },

  // Quotes Card
  quotesCardOuter: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: Spacing.four,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 17,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#ECEFEF",
  },
  quotesBlur: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  quotesTitle: {
    fontSize: 15,
    fontFamily: FontFamily.manropeBold,
    color: "#2D3748",
    marginBottom: 12,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  quotesText: {
    fontSize: 18,
    fontFamily: "serif",
    fontStyle: "italic",
    color: "#4A5568",
    textAlign: "center",
    lineHeight: 26,
    paddingHorizontal: 6,
  },
  quotesAuthor: {
    fontSize: 12,
    fontFamily: FontFamily.manropeMedium,
    color: '#718096',
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Menu Grid
  menuGrid: {
    marginBottom: Spacing.four,
  },
  menuRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    width: "47%",
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ECEFEF",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 17,
    elevation: 6,
  },
  menuCardTitle: {
    fontSize: 14,
    fontFamily: FontFamily.manropeBold,
    color: "#1A2520",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 20,
  },

  // Emotion Banner (Capsule Shape)
  emotionBanner: {
    backgroundColor: "#8BE3C9", // warna hijau mint luar
    borderRadius: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8, // dikurangi agar pas dan rapi
    paddingLeft: 8,
    paddingRight: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 17,
    elevation: 5,
    marginBottom: Spacing.four,
  },
  emotionInnerContainer: {
    flex: 1,
    backgroundColor: "#DCF5EC", // warna text container bubble putih kehijauan dalam
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#BEECE0",
  },
  emotionBannerText: {
    fontSize: 13,
    fontFamily: FontFamily.manropeMedium,
    color: "#414D46",
    lineHeight: 18,
    textAlign: "center",
  },
  emotionBannerBold: {
    fontFamily: FontFamily.manropeBold,
    color: "#2BD5A2",
  },
  emotionBellWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
});