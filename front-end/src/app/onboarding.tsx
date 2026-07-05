import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { useEffect, useRef, useState } from "react";
import {
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
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import onboardingData, { type OnboardingData } from "@/data/onboardingData";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const SLIDES = onboardingData;
const BLOB_POSITIONS = [
  { cx: SCREEN_WIDTH * 0.78, cy: SCREEN_HEIGHT * 0.14, r: SCREEN_WIDTH * 0.6 },
  { cx: SCREEN_WIDTH * 0.5, cy: SCREEN_HEIGHT * 0.1, r: SCREEN_WIDTH * 0.6 },
  { cx: SCREEN_WIDTH * 0.22, cy: SCREEN_HEIGHT * 0.14, r: SCREEN_WIDTH * 0.6 },
  { cx: SCREEN_WIDTH * 0.1, cy: SCREEN_HEIGHT * 0.24, r: SCREEN_WIDTH * 0.6 },
  { cx: SCREEN_WIDTH * 0.5, cy: SCREEN_HEIGHT * 0.45, r: SCREEN_WIDTH * 1.8 },
];

const LAST_INDEX = SLIDES.length - 1;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface BlobProps {
  activeIndex: number;
}

function AnimatedBlob({ activeIndex }: BlobProps) {
  const blobX = useSharedValue(BLOB_POSITIONS[0].cx - SCREEN_WIDTH * 0.08);
  const blobY = useSharedValue(BLOB_POSITIONS[0].cy - SCREEN_HEIGHT * 0.03);
  const blobR = useSharedValue(BLOB_POSITIONS[0].r * 0.92);
  const animatedProps = useAnimatedProps(() => {
    return {
      cx: blobX.value,
      cy: blobY.value,
      r: blobR.value,
    };
  });

  useEffect(() => {
    const pos = BLOB_POSITIONS[activeIndex] ?? BLOB_POSITIONS[0];
    const duration = activeIndex === LAST_INDEX ? 700 : 480;

    blobX.value = withSpring(pos.cx, { damping: 22, stiffness: 140 });
    blobY.value = withSpring(pos.cy, { damping: 22, stiffness: 140 });
    blobR.value = withTiming(pos.r, { duration, easing: Easing.out(Easing.exp) });
  }, [activeIndex, blobR, blobX, blobY]);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT} viewBox={`0 0 ${SCREEN_WIDTH} ${SCREEN_HEIGHT}`}>
        <Defs>
          <LinearGradient id="blobGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#5DEBB8" />
            <Stop offset="100%" stopColor="#3CC8A0" />
          </LinearGradient>
        </Defs>
        <AnimatedCircle animatedProps={animatedProps} fill="url(#blobGrad)" />
      </Svg>
    </View>
  );
}

interface SlideProps {
  item: OnboardingData;
  isActive: boolean;
  isLast: boolean;
}

function Slide({ item, isActive, isLast }: SlideProps) {
  const translateY = useSharedValue(54);
  const opacity = useSharedValue(0);
  const lottieRef = useRef<LottieView>(null);

  useEffect(() => {
    if (isActive) {
      translateY.value = 54;
      opacity.value = 0;
      lottieRef.current?.play();

      translateY.value = withSpring(0, { damping: 20, stiffness: 180 });
      opacity.value = withTiming(1, { duration: 360, easing: Easing.out(Easing.cubic) });
    } else {
      lottieRef.current?.pause();
    }
  }, [isActive, opacity, translateY]);

  const textStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const skipStyle = useAnimatedStyle(() => ({
    opacity: isLast ? 0 : opacity.value,
  }));

  return (
    <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
      <View style={[styles.skipInsideBlob, styles.skipInsideBlobFrame]}>
        <Pressable
          style={{ width: 72, height: 28, alignItems: "center", justifyContent: "center" }}
          disabled={isLast}
        >
        </Pressable>
      </View>

      <Animated.View
        style={[styles.textContainer, isLast && styles.textContainerLast, textStyle]}
      >
        <View style={styles.animationWrap}>
          <LottieView source={item.animation} autoPlay loop style={styles.animation} />
        </View>

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

function Dots({ count, active, onMint }: { count: number; active: number; onMint?: boolean }) {
  const indicatorX = useSharedValue(0);

  useEffect(() => {
    // Setiap dot + spacing = 14px (8px dot + 6px gap)
    indicatorX.value = withSpring(active * 14, { damping: 22, stiffness: 210 });
  }, [active]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  return (
    <View style={styles.dotsRow}>
      {/* Indicator animasi */}
      <Animated.View
        style={[
          styles.dotIndicator,
          onMint ? styles.dotActiveOnMint : styles.dotActive,
          indicatorStyle,
        ]}
      />
      
      {/* Dots statis */}
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === active
              ? onMint
                ? styles.dotActiveOnMint
                : styles.dotActive
              : onMint
              ? styles.dotInactiveOnMint
              : styles.dotInactive,
          ]}
        />
      ))}
    </View>
  );
}
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
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withTiming(0.94, { duration: 120 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 120 });
  };

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const disabledColor = onMint ? "rgba(255,255,255,0.4)" : "#B0C8C2";
  const activeColor = "#FFFFFF";
  const btnBg = onMint
    ? disabled
      ? "rgba(255,255,255,0.2)"
      : "rgba(255,255,255,0.25)"
    : disabled
    ? "#E5E7EB"
    : "#3CC8A0";

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View
        style={[
          styles.navBtn,
          { backgroundColor: btnBg, shadowOpacity: disabled ? 0 : 0.3 },
          animatedStyle,
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

function StartButton({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withTiming(0.96, { duration: 120 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 120 });
  };

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[styles.startBtn, animatedStyle]}>
        <Text style={styles.startBtnText}>Start</Text>
      </Animated.View>
    </Pressable>
  );
}

interface OnboardingScreenProps {
  onFinish?: () => void;
}

export default function OnboardingScreen({ onFinish }: OnboardingScreenProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList<OnboardingData>>(null);
  const activeIndexRef = useRef(0);
  const isLast = activeIndex === LAST_INDEX;
  const router = useRouter();

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  const goTo = (index: number) => {
    if (index < 0 || index >= SLIDES.length) return;
    activeIndexRef.current = index;
    setActiveIndex(index);
    flatListRef.current?.scrollToIndex({ index, animated: true });
  };

  const handleFinish = () => {
    router.replace("/auth/login");
  };

  const onViewableItemsChanged = ({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const nextIndex = viewableItems[0]?.index;

    if (typeof nextIndex === "number" && nextIndex !== activeIndexRef.current) {
      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
    }
  };

  const viewabilityConfig = { viewAreaCoveragePercentThreshold: 50 };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <AnimatedBlob activeIndex={activeIndex} />

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => String(item.id)}
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

        <View style={styles.dotsWrapper}>
          <Dots count={SLIDES.length} active={activeIndex} onMint={isLast} />
        </View>

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
    bottom: 40,
    left: 0,
    right: 0,
    paddingHorizontal: 32,
    alignItems: "center",
  },
  textContainerLast: {
    bottom: 80,
  },
  animationWrap: {
    width: 250,
    height: 250,
    marginBottom: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  animation: {
    width: "180%",
    height: "190%",
  },
  titleBlack: {
    fontSize: 37,
    fontWeight: "800",
    color: "#1A1A1A",
    textAlign: "center",
    lineHeight: 36,
  },
  titleBlackOnMint: {
    color: "#1A1A1A",
  },
  titleMint: {
    fontSize: 37,
    fontWeight: "800",
    color: "#3CC8A0",
    textAlign: "center",
    lineHeight: 36,
    marginBottom: 16,
    fontFamily: "laxend_Medium",
  },
  titleMintOnMint: {
    color: "#1A886A",
    opacity: 0.85,
  },
  description: {
    fontSize: 14,
    fontWeight: "400",
    color: "#4A5568",
    textAlign: "center",
    lineHeight: 22,
    marginTop: 12,
    fontFamily: "laxend_Medium",
  },
  descriptionOnMint: {
    fontSize: 14,
    color: "#000000",
    fontWeight: "400",
    fontFamily: "laxend_Medium",
  },
  bottomNav: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  dotsWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  navBtnContainer: {
    width: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  navBtnContainerRightFixed: {
    width: 48,
  },
  navBtnRightInner: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
   dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    height: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
  dotIndicator: {
    position: "absolute",
    width: 20,
    height: 8,
    borderRadius: 4,
    left: 0,
    marginLeft: 3,
  },
  dotActive: {
    width: 8,
    backgroundColor: "#3CC8A0",
  },
  dotInactive: {
    width: 8,
    backgroundColor: "#D1D5DB",
  },
  dotActiveOnMint: {
    width: 8,
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
    width: 79,
    height: 50,
    borderRadius: 20,
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
    zIndex: 20,
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
    color: "#000000",
  },
});