import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { ArrowLeft, Shield, Mail, Lock, Eye, UserX, Trash2 } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/hooks/use-theme";
import { FontFamily } from "@/constants/fontsfamily";

export default function AccountSettingsScreen() {
  const router = useRouter();
  const theme = useTheme();
  
  // State for anonymous mode toggle
  const [isAnonymous, setIsAnonymous] = useState(false);

  const menuItems = [
    {
      icon: Mail,
      title: "Ubah Email",
      subtitle: "sarah.j***@gmail.com",
      onPress: () => console.log("Change Email"),
    },
    {
      icon: Lock,
      title: "Ubah Kata Sandi",
      subtitle: "Terakhir diubah 3 bulan lalu",
      onPress: () => console.log("Change Password"),
    },
    {
      icon: Eye,
      title: "Privasi Profil",
      subtitle: "Atur siapa yang melihat jurnal Anda",
      onPress: () => console.log("Profile Privacy"),
    },
  ];

  const socialItems = [
    {
      icon: UserX,
      title: "Daftar Blokir",
      onPress: () => console.log("Block List"),
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={theme.mintDark} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.mintDark }]}>Pengaturan Akun</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Anonymous Mode Section */}
        <View style={styles.section}>
          <View style={styles.anonymousContainer}>
            <View style={styles.anonymousContent}>
              <Text style={styles.anonymousTitle}>Mode Anonim</Text>
              <Text style={styles.anonymousSubtitle}>
                Sembunyikan nama asli dan foto profil Anda saat berinteraksi di dalam komunitas untuk menjaga privasi.
              </Text>
            </View>
            <Switch
              value={isAnonymous}
              onValueChange={setIsAnonymous}
              trackColor={{ false: "#E0E0E0", true: "#A9EAD7" }}
              thumbColor={isAnonymous ? "#2BD5A2" : "#F4F4F4"}
            />
          </View>
        </View>

        {/* Security & Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>KEAMANAN & DATA</Text>
          <View style={styles.card}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  index !== menuItems.length - 1 && styles.menuItemBorder,
                ]}
                onPress={item.onPress}
              >
                <View style={styles.menuLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: '#D0F6EB' }]}>
                    <item.icon size={20} color={theme.mintDark} />
                  </View>
                  <View style={styles.menuTextContainer}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Social Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PREFERENSI SOSIAL</Text>
          <View style={styles.card}>
            {socialItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={item.onPress}
              >
                <View style={styles.menuLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: '#D0F6EB' }]}>
                    <item.icon size={20} color={theme.mintDark} />
                  </View>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Delete Account Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.deleteButton}>
            <Trash2 size={20} color="#EF4444" />
            <Text style={styles.deleteButtonText}>Hapus Akun Permanen</Text>
          </TouchableOpacity>
        </View>

        {/* Version Info */}
        <Text style={styles.versionText}>Versi Aplikasi 2.4.1 (Stable)</Text>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
  
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: "#F8F9FA",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FontFamily.manropeBold,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: FontFamily.manropeSemiBold,
    color: "#6B7280",
    marginBottom: 12,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  anonymousContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 17,
    elevation: 4,
  },
  anonymousContent: {
    flex: 1,
    marginRight: 12,
  },
  anonymousTitle: {
    fontSize: 16,
    fontFamily: FontFamily.manropeSemiBold,
    color: "#1F2937",
    marginBottom: 4,
  },
  anonymousSubtitle: {
    fontSize: 13,
    fontFamily: FontFamily.manropeRegular,
    color: "#6B7280",
    lineHeight: 18,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 17,
    elevation: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "white",
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontFamily: FontFamily.manropeMedium,
    color: "#1F2937",
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    fontFamily: FontFamily.manropeRegular,
    color: "#9CA3AF",
  },
  chevron: {
    fontSize: 24,
    color: "#9CA3AF",
    marginLeft: 8,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 17,
    elevation: 4,
  },
  deleteButtonText: {
    fontSize: 15,
    fontFamily: FontFamily.manropeMedium,
    color: "#EF4444",
  },
  versionText: {
    textAlign: "center",
    fontSize: 12,
    fontFamily: FontFamily.manropeRegular,
    color: "#9CA3AF",
    marginTop: 24,
    marginBottom: 8,
  },
});