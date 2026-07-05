import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Camera } from 'lucide-react-native';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { FontFamily } from '@/constants/fontsfamily';

// Reuse the profile avatar from profile/index
function ProfileAvatar({ size = 100 }: { size?: number }) {
  const scale = size / 100;
  return (
    <View style={{ marginBottom: 8 }}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Circle cx={50} cy={50} r={48} stroke="#FF8E85" strokeWidth={2.5} fill="#FFFFFF" />
        <Circle cx={50} cy={50} r={44} fill="#FFEBE9" />
        <G scale={scale * 0.9} translate={[5, 5]}>
          <Path d="M44 65h12v12H44z" fill="#FAD7A0" />
          <Path d="M28 55c0-14 10-23 22-23s22 9 22 23c0 9-4 11-4 14H32c0-3-4-5-4-14z" fill="#E53935" />
          <Circle cx={50} cy={42} r={20} fill="#00796B" />
          <Circle cx={50} cy={47} r={15} fill="#FAD7A0" />
          <Path d="M38 45h9v5h-9zM53 45h9v5h-9z" fill="#212F3D" />
          <Path d="M46 47h8" stroke="#212F3D" strokeWidth={1.5} />
          <Path d="M35 36l6-8 3 9 4-11 5 10 5-9 3 7" stroke="#00796B" strokeWidth={3} strokeLinecap="round" fill="none" />
          <Path d="M38 32l5-7 3 8" fill="#00796B" />
          <Path d="M46 28l4-10 4 10" fill="#00796B" />
          <Path d="M54 32l4-7 3 7" fill="#00796B" />
          <Path d="M22 85c3-11 11-15 28-15s25 4 28 15H22z" fill="#E53935" />
          <Path d="M32 70l18 10 18-10" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" fill="none" />
          <Path d="M45 70a5 5 0 0010 0" fill="#212F3D" />
        </G>
      </Svg>
    </View>
  );
}

export default function EditProfileScreen() {
  const router = useRouter();
  const theme = useTheme();

  const [username, setUsername] = useState('TheLittleRabbit90');
  const [bio, setBio] = useState('Investor pemula yang sedang belajar mengelola emosi.');
  const [email] = useState('fawwaz.k***@gmail.com');

  const handleSave = () => {
    // TODO: Save to backend
    router.back();
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.mintDark} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.mintDark }]}>Edit Profil</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <ProfileAvatar size={110} />
              <Pressable
                style={[styles.cameraButton, { backgroundColor: theme.mintMedium }]}
              >
                <Camera size={18} color="#FFFFFF" />
              </Pressable>
            </View>
            <Text style={styles.changePhotoText}>Ubah Foto Profil</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formSection}>
            <Text style={styles.fieldLabel}>Username</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                value={username}
                onChangeText={setUsername}
                placeholder="Masukkan username"
                placeholderTextColor="#A0A5A8"
              />
            </View>

            <Text style={styles.fieldLabel}>Bio / Status</Text>
            <View style={[styles.inputWrapper, { height: 100 }]}>
              <TextInput
                style={[styles.textInput, { height: 90, textAlignVertical: 'top' }]}
                value={bio}
                onChangeText={setBio}
                placeholder="Tulis bio singkat..."
                placeholderTextColor="#A0A5A8"
                multiline
              />
            </View>

            <Text style={styles.fieldLabel}>Email</Text>
            <View style={[styles.inputWrapper, { backgroundColor: '#F5F7F6' }]}>
              <TextInput
                style={[styles.textInput, { color: '#9CA3AF' }]}
                value={email}
                editable={false}
              />
            </View>
            <Text style={styles.fieldHint}>Email tidak dapat diubah di sini. Buka Pengaturan Akun.</Text>
          </View>

          {/* Save Button */}
          <Pressable
            onPress={handleSave}
            style={({ pressed }) => [
              styles.saveButton,
              { backgroundColor: theme.mintMedium },
              pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
            ]}
          >
            <Text style={styles.saveButtonText}>Simpan Perubahan</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FontFamily.manropeBold,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: 40,
  },

  // Avatar
  avatarSection: {
    alignItems: 'center',
    marginBottom: Spacing.five,
  },
  avatarContainer: {
    position: 'relative',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 8,
    right: -4,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  changePhotoText: {
    fontSize: 14,
    fontFamily: FontFamily.manropeSemiBold,
    color: '#2BD5A2',
    marginTop: 4,
  },

  // Form
  formSection: {
    marginBottom: Spacing.five,
  },
  fieldLabel: {
    fontSize: 13,
    fontFamily: FontFamily.manropeSemiBold,
    color: '#7C8C85',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECEFEF',
    paddingHorizontal: 16,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 17,
    elevation: 3,
  },
  textInput: {
    fontSize: 15,
    fontFamily: FontFamily.manropeMedium,
    color: '#1E2A22',
    paddingVertical: 14,
  },
  fieldHint: {
    fontSize: 11,
    fontFamily: FontFamily.manropeRegular,
    color: '#9CA3AF',
    marginTop: -12,
    marginBottom: 16,
    marginLeft: 4,
  },

  // Save Button
  saveButton: {
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2BD5A2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 17,
    elevation: 6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: FontFamily.manropeBold,
  },
});