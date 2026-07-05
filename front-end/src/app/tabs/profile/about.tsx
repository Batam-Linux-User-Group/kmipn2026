import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Linking,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ExternalLink, Shield, Heart } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { FontFamily } from '@/constants/fontsfamily';

export default function AboutScreen() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.mintDark} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.mintDark }]}>Tentang Aplikasi</Text>
          <View style={{ width: 32 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Logo & Version */}
          <View style={styles.logoSection}>
            <Image
              source={require('@/assets/icons/Jeda_Logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.appName}>JEDA</Text>
            <Text style={styles.versionText}>Versi 2.4.1 (Stable)</Text>
          </View>

          {/* Description Card */}
          <View style={styles.descCard}>
            <Text style={styles.descTitle}>Tentang JEDA</Text>
            <Text style={styles.descText}>
              JEDA adalah aplikasi pendamping kesehatan mental yang dirancang khusus untuk membantu investor digital mengelola emosi dan perilaku investasi mereka.{'\n\n'}
              Dengan fitur asesmen, jurnal harian, latihan pernapasan, dan forum komunitas, JEDA membantu Anda mengambil jeda sejenak sebelum membuat keputusan investasi yang impulsif.
            </Text>
          </View>

          {/* Team Card */}
          <View style={styles.teamCard}>
            <Text style={styles.teamTitle}>TIM PENGEMBANG</Text>
            <View style={styles.teamRow}>
              <View style={[styles.teamIcon, { backgroundColor: '#E0F2F1' }]}>
                <Heart size={16} color="#00796B" />
              </View>
              <View>
                <Text style={styles.teamName}>Batam Linux User Group</Text>
                <Text style={styles.teamRole}>Developer Team — KMIPN 2026</Text>
              </View>
            </View>
          </View>

          {/* Links */}
          <Text style={styles.linksTitle}>TAUTAN</Text>

          <Pressable
            style={styles.linkRow}
            onPress={() => console.log('Privacy Policy')}
          >
            <View style={styles.linkLeft}>
              <View style={[styles.linkIcon, { backgroundColor: '#E8EAF6' }]}>
                <Shield size={18} color="#3F51B5" />
              </View>
              <Text style={styles.linkText}>Kebijakan Privasi</Text>
            </View>
            <ExternalLink size={16} color="#9CA3AF" />
          </Pressable>

          <Pressable
            style={styles.linkRow}
            onPress={() => console.log('Terms')}
          >
            <View style={styles.linkLeft}>
              <View style={[styles.linkIcon, { backgroundColor: '#FFF3E0' }]}>
                <Shield size={18} color="#E65100" />
              </View>
              <Text style={styles.linkText}>Syarat & Ketentuan</Text>
            </View>
            <ExternalLink size={16} color="#9CA3AF" />
          </Pressable>

          {/* Footer */}
          <Text style={styles.footerText}>
            Made with ❤️ in Batam, Indonesia{'\n'}
            © 2026 JEDA App. All rights reserved.
          </Text>

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
    paddingTop: 24,
    paddingBottom: 40,
  },

  // Logo Section
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoImage: {
    width: 90,
    height: 90,
    marginBottom: 12,
  },
  appName: {
    fontSize: 28,
    fontFamily: FontFamily.manropeExtraBold,
    color: '#056B4E',
    letterSpacing: 2,
  },
  versionText: {
    fontSize: 13,
    fontFamily: FontFamily.manropeMedium,
    color: '#9CA3AF',
    marginTop: 4,
  },

  // Description Card
  descCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 17,
    elevation: 4,
  },
  descTitle: {
    fontSize: 16,
    fontFamily: FontFamily.manropeBold,
    color: '#056B4E',
    marginBottom: 10,
  },
  descText: {
    fontSize: 14,
    fontFamily: FontFamily.manropeRegular,
    color: '#4B5563',
    lineHeight: 22,
  },

  // Team Card
  teamCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 17,
    elevation: 4,
  },
  teamTitle: {
    fontSize: 11,
    fontFamily: FontFamily.manropeBold,
    color: '#7C8C85',
    letterSpacing: 1,
    marginBottom: 14,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  teamName: {
    fontSize: 15,
    fontFamily: FontFamily.manropeBold,
    color: '#1E2A22',
  },
  teamRole: {
    fontSize: 12,
    fontFamily: FontFamily.manropeRegular,
    color: '#7C8C85',
    marginTop: 2,
  },

  // Links
  linksTitle: {
    fontSize: 11,
    fontFamily: FontFamily.manropeBold,
    color: '#7C8C85',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 17,
    elevation: 3,
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  linkText: {
    fontSize: 14,
    fontFamily: FontFamily.manropeSemiBold,
    color: '#1E2A22',
  },

  // Footer
  footerText: {
    fontSize: 12,
    fontFamily: FontFamily.manropeRegular,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 32,
    lineHeight: 20,
  },
});