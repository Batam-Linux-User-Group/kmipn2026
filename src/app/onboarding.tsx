import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewToken,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from "react-native-svg";
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    titleBlack: "Berhenti Sejenak,",
    titleMint: "Ambil JEDA",
    titleMintInline: true,
    description: "JEDA hadir sebagai ruang aman untuk membantumu pulih dari Adiksi Investasi Digital",
  },
  {
    id: "2",
    titleBlack: "Peluang Selalu",
    titleMint: "Ada",
    titleMintInline: false,
    description: "Memilih untuk tidak over-trading dan mengamankan modalmu juga merupakan sebuah strategi.",
  },
  {
    id: "3",
    titleBlack: "Kendalikan",
    titleMint: "Emosi mu",
    titleMintInline: false,
    description: "Saat panik muncul, tarik napas perlahan, redam adrenalin yang merugikan.",
  },
  {
    id: "4",
    titleBlack: "Pahami",
    titleMint: "Pola Pikiran mu",
    titleMintInline: false,
    description: "Kenali emosi lewat catatan evaluasi singkat, sadari bias yang berulang dan jadilah orang yang lebih rasional.",
  },
  {
    id: "5",
    titleBlack: "Kuasai",
    titleMint: "Keputusanmu",
    titleMintInline: false,
    description: "JEDA siap menemanimu mengambil kembali kendali atas emosi dan portofoliomu. Mari mulai melangkah.",
  },
];

const BLOB_POSITIONS = [
  { cx: SCREEN_WIDTH * 0.78, cy: SCREEN_HEIGHT * 0.14, r: SCREEN_WIDTH * 0.60 },
  { cx: SCREEN_WIDTH * 0.50, cy: SCREEN_HEIGHT * 0.10, r: SCREEN_WIDTH * 0.60 },
  { cx: SCREEN_WIDTH * 0.22, cy: SCREEN_HEIGHT * 0.14, r: SCREEN_WIDTH * 0.60 },
  { cx: SCREEN_WIDTH * 0.10, cy: SCREEN_HEIGHT * 0.24, r: SCREEN_WIDTH * 0.60 },
  { cx: SCREEN_WIDTH * 0.50, cy: SCREEN_HEIGHT * 0.45, r: SCREEN_WIDTH * 1.8 },
];

const LAST_INDEX = SLIDES.length - 1;

// ─── AnimatedBlob ──────────────────────────────────────────────────────────────

interface BlobProps {
  activeIndex: number;
}

function AnimatedBlob({ activeIndex }: BlobProps) {
  const blobX = useRef(new Animated.Value(BLOB_POSITIONS[0].cx)).current;
  const blobY = useRef(new Animated.Value(BLOB_POSITIONS[0].cy)).current;
  const blobR = useRef(new Animated.Value(BLOB_POSITIONS[0].r)).current;

  useEffect(() => {
    const pos = BLOB_POSITIONS[activeIndex] ?? BLOB_POSITIONS[0];
    const duration = activeIndex === LAST_INDEX ? 700 : undefined;

    if (activeIndex === LAST_INDEX) {
      Animated.parallel([
        Animated.timing(blobX, { toValue: pos.cx, duration, useNativeDriver: false }),
        Animated.timing(blobY, { toValue: pos.cy, duration, useNativeDriver: false }),
        Animated.timing(blobR, { toValue: pos.r, duration, useNativeDriver: false }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(blobX, { toValue: pos.cx, useNativeDriver: false }),
        Animated.spring(blobY, { toValue: pos.cy, useNativeDriver: false }),
        Animated.spring(blobR, { toValue: pos.r, useNativeDriver: false }),
      ]).start();
    }
  }, [activeIndex]);

  const AnimatedCircle = Animated.createAnimatedComponent(Circle);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT} viewBox={`0 0 ${SCREEN_WIDTH} ${SCREEN_HEIGHT}`}>
        <Defs>
          <LinearGradient id="blobGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#5DEBB8" />
            <Stop offset="100%" stopColor="#3CC8A0" />
          </LinearGradient>
        </Defs>
        <AnimatedCircle cx={blobX} cy={blobY} r={blobR} fill="url(#blobGrad)" />
      </Svg>
    </View>
  );
}

// ─── Slide ─────────────────────────────────────────────────────────────────────

interface SlideProps {
  item: (typeof SLIDES)[0];
  isActive: boolean;
  isLast: boolean;
  onSkip?: () => void;
}

function Slide({ item, isActive, isLast, onSkip }: SlideProps) {
  const translateY = useRef(new Animated.Value(50)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive) {
      translateY.setValue(50);
      opacity.setValue(0);
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [isActive]);

  return (
    <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
      {/* keep button space stable so it doesn't cause any subtle shift */}
      <View style={[styles.skipInsideBlob, styles.skipInsideBlobFrame]}>
        <Pressable
          style={{ width: 72, height: 28, alignItems: "center", justifyContent: "center" }}
          onPress={onSkip}
          disabled={isLast}
        >
          <Animated.Text style={[styles.skipTextBlob, { opacity: isLast ? 0 : opacity }]}>
            Lewati
          </Animated.Text>
        </Pressable>
      </View>

      <Animated.View
        style={[
          styles.textContainer,
          isLast && styles.textContainerLast,
          { transform: [{ translateY }], opacity },
        ]}
      >
        {item.titleMintInline ? (
          <Animated.Text style={[styles.titleBlack, isLast && styles.titleBlackOnMint]}>
            {item.titleBlack}{" "}
            <Animated.Text style={[styles.titleMint, isLast && styles.titleMintOnMint]}>
              {item.titleMint}
            </Animated.Text>
          </Animated.Text>
        ) : (
          <>
            <Animated.Text style={[styles.titleBlack, isLast && styles.titleBlackOnMint]}>
              {item.titleBlack}
            </Animated.Text>
            <Animated.Text style={[styles.titleMint, isLast && styles.titleMintOnMint]}>
              {item.titleMint}
            </Animated.Text>
          </>
        )}
        <Animated.Text style={[styles.description, isLast && styles.descriptionOnMint]}>
          {item.description}
        </Animated.Text>
      </Animated.View>
    </View>
  );
}

// ─── Dots ──────────────────────────────────────────────────────────────────────

function Dots({ count, active, onMint }: { count: number; active: number; onMint?: boolean }) {
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === active
              ? onMint ? styles.dotActiveOnMint : styles.dotActive
              : onMint ? styles.dotInactiveOnMint : styles.dotInactive,
          ]}
        />
      ))}
    </View>
  );
}

// ─── NavButton ─────────────────────────────────────────────────────────────────

function NavButton({
  direction,
  onPress,
  disabled,
  onMint,
}: {
  direction: "prev" | "next";
  onPress: () => void;
  disabled?: boolean;
  onMint?: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.88, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  const disabledColor = onMint ? "rgba(255,255,255,0.4)" : "#B0C8C2";
  const activeColor = "#FFFFFF";
  const btnBg = onMint
    ? disabled ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.25)"
    : disabled ? "#E5E7EB" : "#3CC8A0";

  return (
    <Pressable onPress={handlePress} disabled={disabled}>
      <Animated.View
        style={[
          styles.navBtn,
          { backgroundColor: btnBg, shadowOpacity: disabled ? 0 : 0.3 },
          { transform: [{ scale }] },
        ]}
      >
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          {direction === "prev" ? (
            <Path
              d="M15 18L9 12L15 6"
              stroke={disabled ? disabledColor : activeColor}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <Path
              d="M9 18L15 12L9 6"
              stroke={activeColor}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </Svg>
      </Animated.View>
    </Pressable>
  );
}

// ─── StartButton ───────────────────────────────────────────────────────────────

function StartButton({ onPress }: { onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={[styles.startBtn, { transform: [{ scale }] }]}>
        <Text style={styles.startBtnText}>Start</Text>
      </Animated.View>
    </Pressable>
  );
}

// ─── OnboardingScreen ──────────────────────────────────────────────────────────

interface OnboardingScreenProps {
  onFinish?: () => void;
}

export default function OnboardingScreen({ onFinish }: OnboardingScreenProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const isLast = activeIndex === LAST_INDEX;
  const router = useRouter(); 

  const goTo = (index: number) => {
    if (index < 0 || index >= SLIDES.length) return;
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setActiveIndex(index);
  };

   const skipToLast = () => {
    flatListRef.current?.scrollToIndex({ index: LAST_INDEX, animated: true });
    setActiveIndex(LAST_INDEX);
  };

   const handleFinish = () => {
    router.replace("/auth/login");
  };


  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <AnimatedBlob activeIndex={activeIndex} />

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item, index }) => (
          <Slide
            item={item}
            isActive={activeIndex === index}
            isLast={index === LAST_INDEX}
            onSkip={skipToLast}
          />
        )}
        style={styles.flatList}
      />

      <View style={styles.bottomNav}>
        <View style={styles.navBtnContainer}>
          <NavButton
            direction="prev"
            onPress={() => goTo(activeIndex - 1)}
            disabled={activeIndex === 0}
            onMint={isLast}
          />
        </View>

        <Dots count={SLIDES.length} active={activeIndex} onMint={isLast} />

        {/* keep container size stable to avoid any visual "shift" when switching Next -> Start */}
        <View style={[styles.navBtnContainer, styles.navBtnContainerRightFixed]}>
          <View style={styles.navBtnRightInner}>
            {!isLast ? (
              <NavButton direction="next" onPress={() => goTo(activeIndex + 1)} />
            ) : (
            <StartButton onPress={handleFinish} /> 
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  flatList: {
    flex: 1,
  },
  slide: {
    flex: 1,
  },
  textContainer: {
    position: "absolute",
    bottom: 60,
    left: 0,
    right: 0,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  textContainerLast: {
    bottom: 80,
  },
  titleBlack: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1A1A1A",
    textAlign: "center",
    lineHeight: 36,
  },
  titleBlackOnMint: {
    color: "#FFFFFF",
  },
  titleMint: {
    fontSize: 28,
    fontWeight: "800",
    color: "#3CC8A0",
    textAlign: "center",
    lineHeight: 36,
    marginBottom: 16,
  },
  titleMintOnMint: {
    color: "#FFFFFF",
    opacity: 0.85,
  },
  description: {
    fontSize: 14,
    fontWeight: "400",
    color: "#4A5568",
    textAlign: "center",
    lineHeight: 22,
    marginTop: 12,
  },
  descriptionOnMint: {
    color: "rgba(255,255,255,0.85)",
  },

  bottomNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 32,
    paddingBottom: 16,
    paddingTop: 16,
  },
  navBtnContainer: {
    width: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  navBtnContainerRightFixed: {
    // tetap sama ukurannya walau kanan berubah dari Next -> Start
    width: 48,
  },
  navBtnRightInner: {
    // memastikan area tetap 48x48 biar gak reflow/geser
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    borderRadius: 4,
    height: 8,
  },
  dotActive: {
    width: 20,
    backgroundColor: "#3CC8A0",
  },
  dotInactive: {
    width: 8,
    backgroundColor: "#D1D5DB",
  },
  dotActiveOnMint: {
    width: 20,
    backgroundColor: "#FFFFFF",
  },
  dotInactiveOnMint: {
    width: 8,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  navBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3CC8A0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  startBtn: {
    width: 80,
    height: 60,
    borderRadius: 20,
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  startBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3CC8A0",
    letterSpacing: 0.5,
  },

  skipInsideBlob: {
    position: "absolute",
    top: 16,
    right: 24,
    zIndex: 999,
  },
  skipInsideBlobFrame: {
    width: 72,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  skipTextBlob: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0000",
  },
});