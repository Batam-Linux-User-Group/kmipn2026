import { Tabs } from "expo-router";
import { BarChart2, Home, MessageSquare, User } from "lucide-react-native";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { useTheme } from "@/hooks/use-theme";

// SVG Background with a Bezier Curve cutout that moves based on the dipCenter
interface TabBgProps {
  width: number;
  dipCenter: number;
  color: string;
}

function TabBg({ width, dipCenter, color }: TabBgProps) {
  const mainTop = 15;
  const dipBottom = 48;
  const dipWidth = 80; // Total width of the dip curve

  const dipStart = dipCenter - dipWidth / 2;
  const dipEnd = dipCenter + dipWidth / 2;

  // Draw smooth Bezier curve cutout around the active tab center
  const d = `
    M 0,${mainTop}
    L ${Math.max(0, dipStart)},${mainTop}
    C ${dipCenter - dipWidth * 0.3},${mainTop} ${dipCenter - dipWidth * 0.35},${dipBottom} ${dipCenter},${dipBottom}
    C ${dipCenter + dipWidth * 0.35},${dipBottom} ${dipCenter + dipWidth * 0.3},${mainTop} ${Math.min(width, dipEnd)},${mainTop}
    L ${width},${mainTop}
    L ${width},85
    L 0,85
    Z
  `;

  return (
    <Svg width={width} height={85} style={StyleSheet.absoluteFill}>
      <Path d={d} fill={color} />
    </Svg>
  );
}

function CustomTabBar({ state, descriptors, navigation }: any) {
  const theme = useTheme();
  const { width } = Dimensions.get("window");

  const allowedRoutes = ["index", "forum", "progress", "profile"];

  // Filter out any auto-discovered routes to find the 4 main visible ones
  const visibleRoutes = state.routes.filter((route: any) => {
    return allowedRoutes.includes(route.name);
  });

  const N = visibleRoutes.length;
  // Account for paddingHorizontal: 8 in tabButtonsWrapper (total padding = 16)
  const containerWidth = width - 16;
  const tabWidth = containerWidth / N;

  // Determine active visible index
  const activeRouteName = state.routes[state.index].name;

  // If the active route is a sub-route (forum-detail or forum-create),
  // map it to the parent tab 'forum' so it remains active.
  let activeTabName = activeRouteName;
  if (
    activeRouteName === "forum-detail" ||
    activeRouteName === "forum-create"
  ) {
    activeTabName = "forum";
  }

  const activeVisibleIndex = visibleRoutes.findIndex(
    (r: any) => r.name === activeTabName,
  );

  // Calculate dynamic dip center coordinate, adding 8 to offset the left paddingHorizontal: 8
  const dipCenter =
    activeVisibleIndex !== -1
      ? tabWidth * (activeVisibleIndex + 0.5) + 6
      : tabWidth * 0.5;

  return (
    <View style={styles.tabBarContainer}>
      {/* Dynamic Curved Tab Background */}
      <TabBg
        width={width}
        dipCenter={dipCenter}
        color={theme.tabBarBackground}
      />

      <View style={styles.tabButtonsWrapper}>
        {state.routes.map((route: any, index: number) => {
          // Explicitly do not render any tabs that are not in the main allowed tab list
          if (!allowedRoutes.includes(route.name)) return null;

          const isFocused =
            state.routes[state.index].name === route.name ||
            (route.name === "forum" &&
              (activeRouteName === "forum-detail" ||
                activeRouteName === "forum-create"));

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          // Icon and Label selection
          let IconComponent = Home;
          let labelText = "Home";

          if (route.name === "index") {
            IconComponent = Home;
            labelText = "Home";
          } else if (route.name === "forum") {
            IconComponent = MessageSquare;
            labelText = "Forum";
          } else if (route.name === "progress") {
            IconComponent = BarChart2;
            labelText = "Progress";
          } else if (route.name === "profile") {
            IconComponent = User;
            labelText = "Profile";
          }

          return (
            <View key={route.key} style={styles.tabItemContainer}>
              {isFocused ? (
                // Focused Tab - Raised Circular Button
                <View style={styles.raisedTabContent}>
                  <Pressable
                    onPress={onPress}
                    style={({ pressed }) => [
                      styles.homeRaisedButton,
                      {
                        borderColor: theme.mintBorder,
                        backgroundColor: "#FFFFFF",
                      },
                      pressed && { opacity: 0.9, transform: [{ scale: 0.95 }] },
                    ]}
                  >
                    <IconComponent
                      size={24}
                      color={theme.mintDark}
                      strokeWidth={2.5}
                    />
                  </Pressable>
                  <Text
                    style={[
                      styles.tabLabel,
                      { color: theme.mintDark },
                      styles.absoluteLabel,
                    ]}
                  >
                    {labelText}
                  </Text>
                </View>
              ) : (
                // Unfocused Tab - Flat Button
                <Pressable
                  onPress={onPress}
                  style={({ pressed }) => [
                    styles.tabButton,
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <View style={styles.unfocusedIconWrapper}>
                    <IconComponent size={22} color="#7C8C85" strokeWidth={2} />
                  </View>
                  <Text
                    style={[
                      styles.tabLabel,
                      { color: "#7C8C85" },
                      styles.absoluteLabel,
                    ]}
                  >
                    {labelText}
                  </Text>
                </Pressable>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function AppTabs() {
  return (
    <Tabs tabBar={(props) => <CustomTabBar {...props} />}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="forum"
        options={{
          title: "Forum",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
        }}
      />

      {/* Sub-routes under Forum (hidden from bottom navigation) */}
      <Tabs.Screen
        name="forum-detail"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="forum-create"
        options={{
          href: null,
          headerShown: false,
        }}
      />

      {/* Hide the default explore screen */}
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 85,
    backgroundColor: "transparent",
    shadowColor: "#056B4E",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 8,
  },
  tabButtonsWrapper: {
    flexDirection: "row",
    height: 85,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  tabItemContainer: {
    flex: 1,
    height: 85,
    alignItems: "center",
    justifyContent: "center",
  },
  tabButton: {
    width: "100%",
    height: 85,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  unfocusedIconWrapper: {
    position: "absolute",
    top: 20, // aligns perfectly with raised button's vertical visual center
    height: 32,
    justifyContent: "center",
  },
  raisedTabContent: {
    width: "100%",
    height: 85,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  homeRaisedButton: {
    position: "absolute",
    top: 8, // lowered down from -12 to fit nicely inside the curve without floating too high or clashing
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#056B4E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  absoluteLabel: {
    position: "absolute",
    bottom: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
});
