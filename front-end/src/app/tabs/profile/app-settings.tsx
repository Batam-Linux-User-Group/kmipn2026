import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Switch,
  StatusBar,
} from "react-native";
import {
  ArrowLeft,
  Bell,
  MessageCircle,
  Heart,
  Calendar,
  Globe,
  Sun,
  Moon,
  LogOut,
  Check,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/hooks/use-theme";

export default function AppSettingsScreen() {
  const router = useRouter();
  const theme = useTheme();

  const [pesanKomunitas, setPesanKomunitas] = useState(true);
  const [kabarKebaikan, setKabarKebaikan] = useState(false);
  const [eventTerdekat, setEventTerdekat] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState<"light" | "dark">("light");

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pengaturan Aplikasi</Text>
        <TouchableOpacity style={styles.headerIcon}>
          <Bell size={22} color="#1F2937" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=100&h=100&fit=crop&crop=face",
            }}
            style={styles.profilePhoto}
          />
          <Text style={styles.profileName}>Amanda Rahayu</Text>
          <Text style={styles.profileJoinDate}>Bergabung sejak Maret 2023</Text>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NOTIFIKASI</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: "#E8F5E9" }]}>
                  <MessageCircle size={20} color="#2D9E75" />
                </View>
                <View>
                  <Text style={styles.settingTitle}>Pesan Komunitas</Text>
                  <Text style={styles.settingSubtitle}>
                    Alert untuk balasan diskusi
                  </Text>
                </View>
              </View>
              <Switch
                value={pesanKomunitas}
                onValueChange={setPesanKomunitas}
                trackColor={{ false: "#E5E7EB", true: "#2D9E75" }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: "#FFF3E0" }]}>
                  <Heart size={20} color="#F59E0B" />
                </View>
                <View>
                  <Text style={styles.settingTitle}>Kabar Kebaikan</Text>
                  <Text style={styles.settingSubtitle}>
                    Update harian inspirasi pagi
                  </Text>
                </View>
              </View>
              <Switch
                value={kabarKebaikan}
                onValueChange={setKabarKebaikan}
                trackColor={{ false: "#E5E7EB", true: "#2D9E75" }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: "#E3F2FD" }]}>
                  <Calendar size={20} color="#3B82F6" />
                </View>
                <View>
                  <Text style={styles.settingTitle}>Event Terdekat</Text>
                  <Text style={styles.settingSubtitle}>
                    Info pertemuan offline rutin
                  </Text>
                </View>
              </View>
              <Switch
                value={eventTerdekat}
                onValueChange={setEventTerdekat}
                trackColor={{ false: "#E5E7EB", true: "#2D9E75" }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        {/* Language Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BAHASA</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: "#F3E8FF" }]}>
                  <Globe size={20} color="#8B5CF6" />
                </View>
                <Text style={styles.settingTitle}>Bahasa Indonesia</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Aktif</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Theme Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TEMA TAMPILAN</Text>
          <View style={styles.themeRow}>
            <TouchableOpacity
              style={[
                styles.themeOption,
                selectedTheme === "light" && styles.themeOptionSelected,
              ]}
              onPress={() => setSelectedTheme("light")}
            >
              <View style={styles.themeIconContainer}>
                <Sun size={28} color="#F59E0B" />
              </View>
              <Text style={styles.themeLabel}>Terang</Text>
              {selectedTheme === "light" && (
                <View style={styles.checkBadge}>
                  <Check size={14} color="#2D9E75" />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOption,
                selectedTheme === "dark" && styles.themeOptionSelected,
              ]}
              onPress={() => setSelectedTheme("dark")}
            >
              <View style={[styles.themeIconContainer, { backgroundColor: "#1F2937" }]}>
                <Moon size={28} color="#fff" />
              </View>
              <Text style={styles.themeLabel}>Gelap</Text>
              {selectedTheme === "dark" && (
                <View style={styles.checkBadge}>
                  <Check size={14} color="#2D9E75" />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton}>
            <LogOut size={20} color="#EF4444" />
            <Text style={styles.logoutButtonText}>Keluar dari Aplikasi</Text>
          </TouchableOpacity>
        </View>

        {/* Version */}
        <Text style={styles.versionText}>Versi Aplikasi 2.4.0 (Build 882)</Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 50,
    backgroundColor: "#F5F5F5",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
  },
  headerIcon: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  profilePhoto: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 12,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  profileJoinDate: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    marginBottom: 12,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 14,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1F2937",
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginHorizontal: 16,
  },
  badge: {
    backgroundColor: "#2D9E75",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  chevron: {
    fontSize: 22,
    color: "#9CA3AF",
  },
  themeRow: {
    flexDirection: "row",
    gap: 12,
  },
  themeOption: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  themeOptionSelected: {
    borderColor: "#2D9E75",
  },
  themeIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  themeLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1F2937",
  },
  checkBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: "#FEE2E2",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  logoutButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#EF4444",
  },
  versionText: {
    textAlign: "center",
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 8,
  },
});