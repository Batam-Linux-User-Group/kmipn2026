import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View, ActivityIndicator, Alert, Modal, TextInput } from "react-native";
import { ArrowLeft, Mail, Lock, Eye, UserX, Trash2 } from "lucide-react-native";
import { useRouter } from "expo-router";

import { useTheme } from "@/hooks/use-theme";
import { FontFamily } from "@/constants/fontsfamily";
import { supabase } from "@/services/supabase";
import { usersApi } from "@/services/api";

export default function AccountSettingsScreen() {
  const router = useRouter();
  const theme = useTheme();

  const [email, setEmail] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Email update modal states
  const [isEmailModalVisible, setIsEmailModalVisible] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  useEffect(() => {
    let mounted = true;
    usersApi.getMe()
      .then((res) => {
        if (!mounted) return;
        setEmail(res.user.email || "");
        setIsAnonymous(res.user.is_anonymous || false);
      })
      .catch((err) => console.error("[AccountSettings] load error:", err))
      .finally(() => { if (mounted) setIsLoading(false); });
    return () => { mounted = false; };
  }, []);

  const handleToggleAnonymous = async (newValue: boolean) => {
    setIsAnonymous(newValue);
    setIsUpdating(true);
    try {
      await usersApi.updateMe({ is_anonymous: newValue });
    } catch (err) {
      console.error("[AccountSettings] toggle anonymous error:", err);
      // Revert local state on error
      setIsAnonymous(!newValue);
      Alert.alert("Gagal Mengubah", (err as Error).message || "Gagal mengubah mode anonim.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!newEmail.trim()) {
      Alert.alert("Error", "Email tidak boleh kosong");
      return;
    }

    setIsEmailModalVisible(false);
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      Alert.alert(
        "Sukses",
        "Tautan konfirmasi telah dikirim ke email baru Anda. Silakan verifikasi untuk menyelesaikan perubahan."
      );
      setNewEmail("");
    } catch (err) {
      Alert.alert("Gagal Mengubah Email", (err as Error).message || "Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) return;
    Alert.alert(
      "Ubah Kata Sandi",
      "Kirim tautan reset kata sandi ke email Anda?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Kirim",
          onPress: async () => {
            try {
              const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: "jeda://auth/login",
              });
              if (error) throw error;
              Alert.alert("Sukses", "Tautan reset kata sandi telah dikirim ke email Anda.");
            } catch (err) {
              Alert.alert("Gagal", (err as Error).message || "Gagal mengirim tautan reset.");
            }
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Hapus Akun Permanen",
      "Tindakan ini tidak dapat dibatalkan. Semua data riwayat asesmen, jurnal, dan postingan Anda akan dihapus permanen.",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus Akun",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              // 1. Delete profile from PostgreSQL backend
              await usersApi.deleteMe();
              // 2. Sign out from Supabase Auth
              await supabase.auth.signOut();
              router.replace("/auth/login");
            } catch (err) {
              Alert.alert("Gagal Menghapus Akun", (err as Error).message || "Terjadi kesalahan.");
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  // Helper to mask email address: fawwaz.k***@gmail.com
  const getMaskedEmail = (rawEmail: string) => {
    if (!rawEmail) return "";
    const parts = rawEmail.split("@");
    if (parts.length < 2) return rawEmail;
    const name = parts[0];
    const domain = parts[1];
    if (name.length <= 4) return name[0] + "***@" + domain;
    return name.slice(0, 4) + "***@" + domain;
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#3BCFA6" />
      </View>
    );
  }

  const menuItems = [
    {
      icon: Mail,
      title: "Ubah Email",
      subtitle: getMaskedEmail(email),
      onPress: () => setIsEmailModalVisible(true),
    },
    {
      icon: Lock,
      title: "Ubah Kata Sandi",
      subtitle: "Kirim tautan reset ke email",
      onPress: handleResetPassword,
    },
    {
      icon: Eye,
      title: "Privasi Profil",
      subtitle: "Semua jurnal Anda tersimpan aman",
      onPress: () => Alert.alert("Informasi", "Seluruh riwayat journal Anda dienkripsi dan disimpan secara privat."),
    },
  ];

  const socialItems = [
    {
      icon: UserX,
      title: "Daftar Blokir",
      onPress: () => Alert.alert("Informasi", "Fitur blokir pengguna akan tersedia di versi berikutnya."),
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
            {isUpdating ? (
              <ActivityIndicator size="small" color="#2BD5A2" style={{ marginLeft: 8 }} />
            ) : (
              <Switch
                value={isAnonymous}
                onValueChange={handleToggleAnonymous}
                trackColor={{ false: "#E0E0E0", true: "#A9EAD7" }}
                thumbColor={isAnonymous ? "#2BD5A2" : "#F4F4F4"}
              />
            )}
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
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
            <Trash2 size={20} color="#EF4444" />
            <Text style={styles.deleteButtonText}>Hapus Akun Permanen</Text>
          </TouchableOpacity>
        </View>

        {/* Version Info */}
        <Text style={styles.versionText}>Versi Aplikasi 2.4.1 (Stable)</Text>
        
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Email Update Modal */}
      <Modal
        visible={isEmailModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEmailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ubah Email</Text>
            <Text style={styles.modalDescription}>
              Masukkan alamat email baru Anda. Kami akan mengirimkan tautan konfirmasi ke email tersebut.
            </Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Email Baru"
              placeholderTextColor="#9CA3AF"
              value={newEmail}
              onChangeText={setNewEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#ECEFEF' }]}
                onPress={() => {
                  setIsEmailModalVisible(false);
                  setNewEmail("");
                }}
              >
                <Text style={[styles.modalButtonText, { color: '#4B5563' }]}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.mintDark }]}
                onPress={handleUpdateEmail}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: FontFamily.manropeBold,
    color: "#1E2A22",
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 13,
    fontFamily: FontFamily.manropeRegular,
    color: "#6B7280",
    lineHeight: 18,
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#1E2A22",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    minWidth: 80,
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 14,
    fontFamily: FontFamily.manropeBold,
  },
});
