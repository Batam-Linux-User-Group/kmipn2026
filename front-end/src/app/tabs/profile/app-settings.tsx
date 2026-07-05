import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Moon, BellRing, Volume2, Globe, Trash2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { FontFamily } from '@/constants/fontsfamily';

export default function AppSettingsScreen() {
  const router = useRouter();
  const theme = useTheme();

  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [sound, setSound] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<'Indonesia' | 'English'>('Indonesia');

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.mintDark} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.mintDark }]}>Pengaturan Aplikasi</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* TAMPILAN Section */}
          <Text style={styles.sectionTitle}>TAMPILAN</Text>
          
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: '#1A1A2E' }]}>
                  <Moon size={18} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={styles.settingLabel}>Mode Gelap</Text>
                  <Text style={styles.settingHint}>Ubah tampilan ke mode gelap</Text>
                </View>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: "#E0E0E0", true: "#A9EAD7" }}
                thumbColor={darkMode ? "#2BD5A2" : "#F4F4F4"}
              />
            </View>
          </View>

          {/* NOTIFIKASI Section */}
          <Text style={styles.sectionTitle}>NOTIFIKASI</Text>

          <View style={styles.card}>
            <View style={[styles.settingRow, styles.settingRowBorder]}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: '#FFF3E0' }]}>
                  <BellRing size={18} color="#F5A623" />
                </View>
                <View>
                  <Text style={styles.settingLabel}>Notifikasi Push</Text>
                  <Text style={styles.settingHint}>Terima pemberitahuan harian</Text>
                </View>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: "#E0E0E0", true: "#A9EAD7" }}
                thumbColor={notifications ? "#2BD5A2" : "#F4F4F4"}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconBox, { backgroundColor: '#E8F5E9' }]}>
                  <Volume2 size={18} color="#388E3C" />
                </View>
                <View>
                  <Text style={styles.settingLabel}>Efek Suara</Text>
                  <Text style={styles.settingHint}>Suara saat latihan pernapasan</Text>
                </View>
              </View>
              <Switch
                value={sound}
                onValueChange={setSound}
                trackColor={{ false: "#E0E0E0", true: "#A9EAD7" }}
                thumbColor={sound ? "#2BD5A2" : "#F4F4F4"}
              />
            </View>
          </View>

          {/* BAHASA Section */}
          <Text style={styles.sectionTitle}>BAHASA</Text>

          <View style={styles.card}>
            {(['Indonesia', 'English'] as const).map((lang, idx) => {
              const isActive = selectedLanguage === lang;
              return (
                <Pressable
                  key={lang}
                  onPress={() => setSelectedLanguage(lang)}
                  style={[
                    styles.languageRow,
                    idx === 0 && styles.settingRowBorder,
                  ]}
                >
                  <View style={styles.settingLeft}>
                    <View style={[styles.iconBox, { backgroundColor: '#E3F2FD' }]}>
                      <Globe size={18} color="#1565C0" />
                    </View>
                    <Text style={styles.settingLabel}>{lang}</Text>
                  </View>
                  <View style={[styles.radioOuter, isActive && { borderColor: theme.mintMedium }]}>
                    {isActive && <View style={[styles.radioInner, { backgroundColor: theme.mintMedium }]} />}
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* DATA Section */}
          <Text style={styles.sectionTitle}>DATA</Text>

          <Pressable style={styles.clearCacheButton}>
            <Trash2 size={18} color="#7C8C85" />
            <Text style={styles.clearCacheText}>Hapus Cache Aplikasi</Text>
          </Pressable>

          <Text style={styles.cacheHint}>Menghapus cache tidak akan menghapus data akun Anda.</Text>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FontFamily.manropeBold,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: FontFamily.manropeSemiBold,
    color: '#6B7280',
    marginTop: 24,
    marginBottom: 12,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 17,
    elevation: 4,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontFamily: FontFamily.manropeMedium,
    color: '#1F2937',
  },
  settingHint: {
    fontSize: 12,
    fontFamily: FontFamily.manropeRegular,
    color: '#9CA3AF',
    marginTop: 2,
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  clearCacheButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 17,
    elevation: 4,
  },
  clearCacheText: {
    fontSize: 15,
    fontFamily: FontFamily.manropeMedium,
    color: '#7C8C85',
  },
  cacheHint: {
    fontSize: 11,
    fontFamily: FontFamily.manropeRegular,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 12,
  },
});