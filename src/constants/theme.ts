/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import "@/global.css";

import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#000000",
    background: "#ffffff",
    backgroundElement: "#F0F0F3",
    backgroundSelected: "#E0E1E6",
    textSecondary: "#60646C",
    // Jeda Mint Theme
    mintLight: "#D0F6EB",
    mintGradientStart: "#D3F7ED",
    mintGradientEnd: "#FFFFFF",
    mintDark: "#056B4E",
    mintMedium: "#2BD5A2",
    mintBorder: "#A9EAD7",
    mintStreakBackground: "#C2F1E4",
    streakOrange: "#EF6B5F",
    cardSubtitle: "#7C8C85",
    tabBarBackground: "#E1FAF2",
  },
  dark: {
    text: "#ffffff",
    background: "#000000",
    backgroundElement: "#212225",
    backgroundSelected: "#2E3135",
    textSecondary: "#B0B4BA",
    // Jeda Mint Theme
    mintLight: "#1A3D33",
    mintGradientStart: "#122D25",
    mintGradientEnd: "#000000",
    mintDark: "#2BD5A2",
    mintMedium: "#056B4E",
    mintBorder: "#1A4D3E",
    mintStreakBackground: "#163E33",
    streakOrange: "#FF7B6E",
    cardSubtitle: "#9CAB9F",
    tabBarBackground: "#102B23",
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
