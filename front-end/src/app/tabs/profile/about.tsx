import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Share,
} from "react-native";
import {
  ArrowLeft,
  FileText,
  Shield,
  BookOpen,
  Mail,
  Share2,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/hooks/use-theme";

export default function AboutAppScreen() {
  const router = useRouter();
  const theme = useTheme();

  const menuItems = [
    { icon: FileText, label: "Syarat & Ketentuan" },
    { icon: Shield, label: "Kebijakan Privasi" },
    { icon: BookOpen, label: "Panduan Komunitas" },
    { icon: Mail, label: "Hubungi Kami" },
  ];

  const handleShare = async () => {
    try {
      await Share.share({
        message: "Download Serene Community - ruang aman untuk tumbuh dan terhubung.",
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* App Logo & Info */}
        <View style={styles.appInfoSection}>
          <View style={styles.appLogo}>
            <View style={styles.leafIcon}>
              <View style={styles.leafShape} />
            </View>
          </View>
          <Text style={styles.appName}>Serene Community</Text>
          <Text style={styles.appVersion}>Versi 2.4.1</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <View style={styles.menuCard}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuRow,
                  index !== menuItems.length - 1 && styles.menuRowBorder,
                ]}
              >
                <View style={styles.menuLeft}>
                  <View style={[styles.menuIconBox, { backgroundColor: "#E8F5E9" }]}>
                    <item.icon size={20} color="#2D9E75" />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.descriptionText}>
            Serene Community didedikasikan untuk menciptakan ruang yang aman dan
            mendukung bagi setiap individu untuk tumbuh dan terhubung.
          </Text>
        </View>

        {/* Share Button */}
        <View style={styles.shareSection}>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Share2 size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2024 Serene Inc. Made with ♡ for Humanity.
          </Text>
        </View>

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
  scrollView: {
    flex: 1,
  },
  appInfoSection: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  appLogo: {
    width: 90,
    height: 90,
    borderRadius: 24,
    backgroundColor: "#2D9E75",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#2D9E75",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  leafIcon: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  leafShape: {
    width: 30,
    height: 30,
    backgroundColor: "#fff",
    borderRadius: 4,
    transform: [{ rotate: "45deg" }],
  },
  appName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 6,
  },
  appVersion: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  menuCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  menuRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 14,
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1F2937",
  },
  chevron: {
    fontSize: 22,
    color: "#9CA3AF",
  },
  descriptionSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  descriptionText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 22,
    textAlign: "center",
  },
  shareSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  shareButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  footer: {
    paddingHorizontal: 20,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
  },
});