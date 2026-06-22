import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
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
    titleMint: "Emosimu",
    titleMintInline: false,
    description: "Saat panik muncul, tarik napas perlahan, redam adrenalin yang merugikan.",
  },
  {
    id: "4",
    titleBlack: "Pahami",
    titleMint: "Pola Pikirmu",
    titleMintInline: false,
    description: "Kenali emosi lewat catatan evaluasi singkat, sadari bias yang berulang dan jadilah orang yang lebih rasional.",
  },
];

// Blob center positions per slide index
const BLOB_POSITIONS = [
  { cx: SCREEN_WIDTH * 0.78, cy: SCREEN_HEIGHT * 0.14 },
  { cx: SCREEN_WIDTH * 0.5,  cy: SCREEN_HEIGHT * 0.1  },
  { cx: SCREEN_WIDTH * 0.22, cy: SCREEN_HEIGHT * 0.14 },
  { cx: SCREEN_WIDTH * 0.1,  cy: SCREEN_HEIGHT * 0.24 },
];

// ─── AnimatedBlob ──────────────────────────────────────────────────────────────

interface BlobProps {
  activeIndex: number;
}

function AnimatedBlob({ activeIndex }: BlobProps) {
  const blobX = useRef(new Animated.Value(BLOB_POSITIONS[0].cx)).current;
  const blobY = useRef(new Animated.Value(BLOB_POSITIONS[0].cy)).current;

  useEffect(() => {
    const { cx, cy } = BLOB_POSITIONS[activeIndex] ?? BLOB_POSITIONS[0];
    Animated.spring(blobX, { toValue: cx, useNativeDriver: false }).start();
    Animated.spring(blobY, { toValue: cy, useNativeDriver: false }).start();
  }, [activeIndex]);

  // AnimatedCircle via createAnimatedComponent
  const AnimatedCircle = Animated.createAnimatedComponent(Circle);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg
        width={SCREEN_WIDTH}
        height={SCREEN_HEIGHT * 0.55}
        viewBox={`0 0 ${SCREEN_WIDTH} ${SCREEN_HEIGHT * 0.55}`}
      >
        <Defs>
          <LinearGradient id="blobGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%"   stopColor="#5DEBB8" />
            <Stop offset="100%" stopColor="#3CC8A0" />
          </LinearGradient>
        </Defs>
        <AnimatedCircle
          cx={blobX}
          cy={blobY}
          r={SCREEN_WIDTH * 0.6}
          fill="url(#blobGrad)"
        />
      </Svg>
    </View>
  );
}

// ─── Slide ─────────────────────────────────────────────────────────────────────

interface SlideProps {
  item: (typeof SLIDES)[0];
  isActive: boolean;
  onSkip?: () => void;
}

function Slide({ item, isActive, onSkip }: SlideProps) {
  const translateY = useRef(new Animated.Value(50)).current;
  const opacity    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive) {
      translateY.setValue(50);
      opacity.setValue(0);
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
        Animated.timing(opacity,    { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [isActive]);

  return (
    <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
      {/* Skip button inside the blob area */}
      <Pressable style={styles.skipInsideBlob} onPress={onSkip}>
        <Animated.Text style={[styles.skipTextBlob, { opacity }]}>Lewati</Animated.Text>
      </Pressable>

      <Animated.View
        style={[styles.textContainer, { transform: [{ translateY }], opacity }]}
      >
        {item.titleMintInline ? (
          <Animated.Text style={styles.titleBlack}>
            {item.titleBlack}{" "}
            <Animated.Text style={styles.titleMint}>{item.titleMint}</Animated.Text>
          </Animated.Text>
        ) : (
          <>
            <Animated.Text style={styles.titleBlack}>{item.titleBlack}</Animated.Text>
            <Animated.Text style={styles.titleMint}>{item.titleMint}</Animated.Text>
          </>
        )}
        <Animated.Text style={styles.description}>{item.description}</Animated.Text>
      </Animated.View>
    </View>
  );
}

// ─── Dots ──────────────────────────────────────────────────────────────────────

function Dots({ count, active }: { count: number; active: number }) {
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={[styles.dot, i === active ? styles.dotActive : styles.dotInactive]} />
      ))}
    </View>
  );
}

// ─── NavButton ─────────────────────────────────────────────────────────────────

function NavButton({
  direction,
  onPress,
  disabled,
}: {
  direction: "prev" | "next";
  onPress: () => void;
  disabled?: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.88, duration: 80,  useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1,    duration: 120, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <Pressable onPress={handlePress} disabled={disabled}>
      <Animated.View
        style={[styles.navBtn, disabled && styles.navBtnDisabled, { transform: [{ scale }] }]}
      >
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
          {direction === "prev" ? (
            <Path
              d="M15 18L9 12L15 6"
              stroke={disabled ? "#B0C8C2" : "#FFFFFF"}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : (
            <Path
              d="M9 18L15 12L9 6"
              stroke="#FFFFFF"
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

// ─── OnboardingScreen ──────────────────────────────────────────────────────────

interface OnboardingScreenProps {
  onFinish?: () => void;
}

export default function OnboardingScreen({ onFinish }: OnboardingScreenProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const goTo = (index: number) => {
    if (index < 0 || index >= SLIDES.length) return;
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setActiveIndex(index);
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (activeIndex === SLIDES.length - 1) {
      onFinish?.();
    } else {
      goTo(activeIndex + 1);
    }
  };

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
          <Slide item={item} isActive={activeIndex === index} onSkip={onFinish} />
        )}
        style={styles.flatList}
      />

      <View style={styles.bottomNav}>
        <NavButton
          direction="prev"
          onPress={() => goTo(activeIndex - 1)}
          disabled={activeIndex === 0}
        />
        <Dots count={SLIDES.length} active={activeIndex} />
        <NavButton direction="next" onPress={handleNext} />
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
  titleBlack: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1A1A1A",
    textAlign: "center",
    lineHeight: 36,
  },
  titleMint: {
    fontSize: 28,
    fontWeight: "800",
    color: "#3CC8A0",
    textAlign: "center",
    lineHeight: 36,
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    fontWeight: "400",
    color: "#4A5568",
    textAlign: "center",
    lineHeight: 22,
    marginTop: 12,
  },
  bottomNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 32,
    paddingBottom: 16,
    paddingTop: 16,
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
  navBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#3CC8A0",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3CC8A0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  navBtnDisabled: {
    backgroundColor: "#E5E7EB",
    shadowOpacity: 0,
    elevation: 0,
  },
  skipInsideBlob: {
    position: "absolute",
    top: 16,
    right: 24,
    zIndex: 999,
  },
  skipTextBlob: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0000",
  },
});