import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  StatusBar,
} from "react-native";
import {
  ArrowLeft,
  Bell,
  User,
  AtSign,
  Mail,
  Lock,
  Camera,
  Save,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/hooks/use-theme";

export default function EditProfileScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [fullName, setFullName] = useState("Siti Aminah");
  const [username, setUsername] = useState("aminah_serene");
  const [bio, setBio] = useState(
    "I am passionate about mindfulness and supporting others on their wellness journey. Let's grow together in this serene space. 🌿"
  );

  const bioLimit = 200;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profil</Text>
        <TouchableOpacity style={styles.headerIcon}>
          <Bell size={22} color="#1F2937" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Photo */}
        <View style={styles.photoSection}>
          <View style={styles.photoContainer}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face",
              }}
              style={styles.profilePhoto}
            />
            <TouchableOpacity style={styles.cameraButton}>
              <Camera size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.changePhotoText}>UBAH FOTO PROFIL</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          {/* Nama Lengkap */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nama Lengkap</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Nama lengkap"
              />
              <User size={20} color="#9CA3AF" />
            </View>
          </View>

          {/* Username */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Username</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                value={username}
                onChangeText={setUsername}
                placeholder="Username"
              />
              <AtSign size={20} color="#9CA3AF" />
            </View>
            <Text style={styles.inputHint}>
              Username ini akan terlihat oleh anggota komunitas lainnya.
            </Text>
          </View>

          {/* Bio */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Bio</Text>
            <View style={styles.textAreaWrapper}>
              <TextInput
                style={styles.textArea}
                value={bio}
                onChangeText={setBio}
                placeholder="Ceritakan tentang dirimu..."
                multiline
                maxLength={bioLimit}
                textAlignVertical="top"
              />
            </View>
            <Text style={styles.charCounter}>
              {bio.length}/{bioLimit}
            </Text>
          </View>
        </View>

        {/* Account Settings Section */}
        <View style={styles.accountSection}>
          <Text style={styles.accountSectionTitle}>Pengaturan Akun</Text>
          <View style={styles.accountCard}>
            <TouchableOpacity style={styles.accountMenuItem}>
              <View style={styles.accountMenuLeft}>
                <Mail size={20} color="#6B7280" />
                <Text style={styles.accountMenuText}>Email</Text>
              </View>
              <Text style={styles.accountMenuValue}>siti@email.com</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.accountMenuItem}>
              <View style={styles.accountMenuLeft}>
                <Lock size={20} color="#6B7280" />
                <Text style={styles.accountMenuText}>Ubah Kata Sandi</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonSection}>
          <TouchableOpacity style={styles.saveButton}>
            <Save size={20} color="#fff" />
            <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.cancelButtonText}>Batalakan</Text>
          </TouchableOpacity>
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
  photoSection: {
    alignItems: "center",
    paddingVertical: 24,
  },
  photoContainer: {
    position: "relative",
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2D9E75",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  changePhotoText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 12,
    letterSpacing: 0.5,
  },
  formSection: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: "#1F2937",
  },
  inputHint: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 6,
  },
  textAreaWrapper: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 16,
    minHeight: 120,
  },
  textArea: {
    fontSize: 15,
    color: "#1F2937",
    lineHeight: 22,
  },
  charCounter: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "right",
    marginTop: 6,
  },
  accountSection: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  accountSectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2D9E75",
    marginBottom: 12,
  },
  accountCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  accountMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  accountMenuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  accountMenuText: {
    fontSize: 15,
    color: "#374151",
  },
  accountMenuValue: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginHorizontal: 16,
  },
  chevron: {
    fontSize: 22,
    color: "#9CA3AF",
  },
  buttonSection: {
    paddingHorizontal: 20,
    marginTop: 24,
    alignItems: "center",
    gap: 16,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2D9E75",
    borderRadius: 14,
    paddingVertical: 16,
    width: "100%",
    gap: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  cancelButtonText: {
    fontSize: 15,
    color: "#2D9E75",
    fontWeight: "500",
  },
});