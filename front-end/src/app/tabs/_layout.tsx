import { Tabs } from "expo-router";
import { BarChart2, Bold, Home, MessageSquare, User } from "lucide-react-native";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path, Circle } from "react-native-svg";
import MaskedView from '@react-native-masked-view/masked-view';

import { useTheme } from "@/hooks/use-theme";
import { FontFamily } from "@/constants/fontsfamily";

const TAB_BAR_HEIGHT = 75;
const CIRCLE_RADIUS = 30;
const CIRCLE_DIAMETER = CIRCLE_RADIUS * 2;

interface TabBgProps {
  width: number;
  cutoutCenter: number;
}

function TabBg({ width, cutoutCenter }: TabBgProps) {
  const h = TAB_BAR_HEIGHT;
  const r = CIRCLE_RADIUS + 6;

  const d = `
    M 0,20 Q 0,0 20,0
    L ${cutoutCenter - r - 12},0
    Q ${cutoutCenter - r},0 ${cutoutCenter - r},10
    A ${r + 12},${r + 12} 0 0 0 ${cutoutCenter + r},10
    Q ${cutoutCenter + r},0 ${cutoutCenter + r + 12},0
    L ${width - 20},0 Q ${width},0 ${width},20
    L ${width},${h} L 0,${h} Z
  `;

  return (
    <MaskedView
      style={StyleSheet.absoluteFill}
      maskElement={
        <Svg width={width} height={h}>
          <Path
  d={d}
  fill="#DCF5EC"
  fillOpacity={1.0} 
/>
        </Svg>
      }
    >
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(220, 245, 236, 0.85)' }]} />
    </MaskedView>
  );
}

function CustomTabBar({ state, descriptors, navigation }: any) {
  const theme = useTheme();
  const { width } = Dimensions.get("window");

  const allowedRoutes = ["index", "forum", "progress", "profile"];
  const visibleRoutes = state.routes.filter((route: any) =>
    allowedRoutes.includes(route.name)
  );

  const containerWidth = width - 40;
  const tabSpacing = containerWidth / visibleRoutes.length;

  const activeRouteName = state.routes[state.index].name;
  let activeTabName = activeRouteName;
  if (activeRouteName === "forum-detail" || activeRouteName === "forum-create") {
    activeTabName = "forum";
  }

  const activeVisibleIndex = visibleRoutes.findIndex(
    (r: any) => r.name === activeTabName
  );

  const cutoutCenter =
    activeVisibleIndex !== -1
      ? tabSpacing * activeVisibleIndex + tabSpacing / 2
      : tabSpacing / 2;

  const icons: Record<string, { Icon: any; label: string }> = {
    index:    { Icon: Home,          label: "Home"     },
    forum:    { Icon: MessageSquare, label: "Forum"    },
    progress: { Icon: BarChart2,     label: "Progress" },
    profile:  { Icon: User,          label: "Profile"  },
  };

  return (
    <View style={styles.tabBarContainer}>
      <TabBg width={containerWidth} cutoutCenter={cutoutCenter} />

      {/* Tab buttons */}
      <View style={styles.tabButtonsWrapper}>
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
            <View
              key={route.key}
              style={[styles.tabItemContainer, { width: tabSpacing }]}
            >
              {isFocused ? (
                <View style={styles.raisedTabContent}>
                  <Pressable
                    onPress={onPress}
                    style={({ pressed }) => [
                      styles.activeButton,
                      pressed && { transform: [{ scale: 0.95 }] },
                    ]}
                  >
                    <IconComponent size={28} color="#1A5C45" strokeWidth={2} />
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
                    pressed && { opacity: 0.6 },
                  ]}
                >
                  <View style={styles.unfocusedIconWrapper}>
                    <IconComponent size={22} color="#424242" strokeWidth={1.8} />
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
      
     
      
      <Tabs.Screen name="forum-detail" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="forum-create" options={{ href: null, headerShown: false }} />
    </Tabs>
  );
}
export const dynamic = 'force-dynamic';


const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 1, 
    height: TAB_BAR_HEIGHT,
    borderRadius: 30,
    overflow: "visible",
    shadowColor: "#2D9E75",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 17,
    elevation: 10,
  },
  tabButtonsWrapper: {
    flexDirection: "row",
    height: TAB_BAR_HEIGHT,
    alignItems: "center",
  },
  tabItemContainer: {
    height: TAB_BAR_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },

  tabButton: {
    width: "100%",
    height: TAB_BAR_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  unfocusedIconWrapper: {
    position: "absolute",
    top: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  raisedTabContent: {
    width: "100%",
    height: TAB_BAR_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  activeButton: {
    position: "absolute",
    top: -(CIRCLE_RADIUS - 10),  
    width: CIRCLE_DIAMETER,
    height: CIRCLE_DIAMETER,
    borderRadius: CIRCLE_RADIUS,
    backgroundColor: "#C8EFE0",   
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#757575",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 12,
  },

  // Label
  absoluteLabel: {
    position: "absolute",
    bottom: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontFamily: FontFamily.manropeSemiBold,
  },
  activeLabelText: {
    color: "#424242",
    fontFamily: FontFamily.manropeBold,
  },
  inactiveLabelText: {
    color: "#424242",
    fontFamily: FontFamily.manropeMedium,
  },
});