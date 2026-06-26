import { Tabs } from "expo-router";
import { BarChart2, Home, MessageSquare, User } from "lucide-react-native";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/hooks/use-theme";

function CustomTabBar({ state, descriptors, navigation }: any) {
  const theme = useTheme();
  const { width } = Dimensions.get("window");

  const allowedRoutes = ["index", "forum", "progress", "profile"];
  const visibleRoutes = state.routes.filter((route: any) =>
    allowedRoutes.includes(route.name)
  );

  const containerWidth = width - 40;
  const tabSpacing = 76;
  const totalTabsWidth = visibleRoutes.length * tabSpacing;
  const sidePadding = (containerWidth - totalTabsWidth) / 2;

  const activeRouteName = state.routes[state.index].name;
  let activeTabName = activeRouteName;

  if (activeRouteName === "forum-detail" || activeRouteName === "forum-create") {
    activeTabName = "forum";
  }

  const icons: Record<string, { Icon: any; label: string }> = {
    index:    { Icon: Home,          label: "Home"     },
    forum:    { Icon: MessageSquare, label: "Forum"    },
    progress: { Icon: BarChart2,     label: "Progress" },
    profile:  { Icon: User,          label: "Profile"  },
  };

  return (
    <View style={styles.tabBarContainer}>
      {/* Background solid mint pill */}
      <View style={styles.tabBarBg} />

      <View style={[styles.tabButtonsWrapper, { paddingHorizontal: sidePadding }]}>
        {state.routes.map((route: any) => {
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

          const { Icon: IconComponent, label: labelText } = icons[route.name];

          return (
            <View key={route.key} style={styles.tabItemContainer}>
              {isFocused ? (
                <View style={styles.raisedTabContent}>
                  {/* Circle putih yang naik ke atas */}
                  <Pressable
                    onPress={onPress}
                    style={({ pressed }) => [
                      styles.activeButton,
                      pressed && { opacity: 0.85, transform: [{ scale: 0.95 }] },
                    ]}
                  >
                    <IconComponent
                      size={24}
                      color="#1A7A5E"
                      strokeWidth={2}
                    />
                  </Pressable>
                  <Text style={[styles.tabLabel, styles.activeLabelText, styles.absoluteLabel]}>
                    {labelText}
                  </Text>
                </View>
              ) : (
                <Pressable
                  onPress={onPress}
                  style={({ pressed }) => [
                    styles.tabButton,
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <View style={styles.unfocusedIconWrapper}>
                    <IconComponent size={22} color="#8AADA0" strokeWidth={1.8} />
                  </View>
                  <Text style={[styles.tabLabel, styles.inactiveLabelText, styles.absoluteLabel]}>
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
      <Tabs.Screen name="index"        options={{ title: "Home",     headerShown: false }} />
      <Tabs.Screen name="forum"        options={{ title: "Forum",    headerShown: false }} />
      <Tabs.Screen name="progress"     options={{ title: "Progress", headerShown: false }} />
      <Tabs.Screen name="profile"      options={{ title: "Profile",  headerShown: false }} />
      <Tabs.Screen name="forum-detail" options={{ href: null,        headerShown: false }} />
      <Tabs.Screen name="forum-create" options={{ href: null,        headerShown: false }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 36,
    height: 72,
    borderRadius: 1000,
    overflow: "visible",
    // Shadow hijau mint tipis
    shadowColor: "#C0E8DD",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 10,
  },
  tabBarBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 1000,
    backgroundColor: "#DBFFF5",   // mint solid sesuai referensi
    borderWidth: 1.5,
    borderColor: "#FFFFFF",       // border putih tipis
  },
  tabButtonsWrapper: {
    flexDirection: "row",
    height: 72,
    alignItems: "center",
    justifyContent: "center",
  },
  tabItemContainer: {
    width: 76,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
  },

  // Tab tidak aktif
  tabButton: {
    width: "100%",
    height: 72,
    alignItems: "center",
    justifyContent: "center",
  },
  unfocusedIconWrapper: {
    position: "absolute",
    top: 12,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },

  // Tab aktif
  raisedTabContent: {
    width: "100%",
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  activeButton: {
    position: "absolute",
    top: -24,             // naik ke atas bar
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#DBFFF5",   // circle putih
    alignItems: "center",
    justifyContent: "center",
    // Shadow lembut di bawah circle
    shadowColor: "#3BCFA6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 12,
  },

  // Label
  absoluteLabel: {
    position: "absolute",
    bottom: 6,
  },
  tabLabel: {
    fontSize: 11,
  },
  activeLabelText: {
    color: "#424242",
    fontWeight: "700",
  },
  inactiveLabelText: {
    color: "#424242",
    fontWeight: "500",
  },
});