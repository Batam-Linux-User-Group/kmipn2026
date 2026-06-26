import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Flame, ChevronRight, Smile, Lock, Settings, Info, SquarePen, Heart, MessageSquare } from 'lucide-react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { Image } from "react-native";

import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';


// Custom high-fidelity profile avatar (green haired boy with sunglasses & hoodie)
function ProfileAvatar({ size = 100 }: { size?: number }) {
  const scale = size / 100;
  return (
    <View style={styles.avatarWrapper}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* Outer border ring */}
        <Circle cx={50} cy={50} r={48} stroke="#FF8E85" strokeWidth={2.5} fill="#FFFFFF" />
        {/* Background circle */}
        <Circle cx={50} cy={50} r={44} fill="#FFEBE9" />
        
        <G scale={scale * 0.9} translate={[5, 5]}>
          {/* Neck */}
          <Path d="M44 65h12v12H44z" fill="#FAD7A0" />
          
          {/* Hoodie Back Cap */}
          <Path d="M28 55c0-14 10-23 22-23s22 9 22 23c0 9-4 11-4 14H32c0-3-4-5-4-14z" fill="#E53935" />
          
          {/* Hair Back */}
          <Circle cx={50} cy={42} r={20} fill="#00796B" />
          
          {/* Face */}
          <Circle cx={50} cy={47} r={15} fill="#FAD7A0" />
          
          {/* Glasses */}
          <Path d="M38 45h9v5h-9zM53 45h9v5h-9z" fill="#212F3D" />
          <Path d="M46 47h8" stroke="#212F3D" strokeWidth={1.5} />
          
          {/* Hair spikes */}
          <Path d="M35 36l6-8 3 9 4-11 5 10 5-9 3 7" stroke="#00796B" strokeWidth={3} strokeLinecap="round" fill="none" />
          <Path d="M38 32l5-7 3 8" fill="#00796B" />
          <Path d="M46 28l4-10 4 10" fill="#00796B" />
          <Path d="M54 32l4-7 3 7" fill="#00796B" />
          
          {/* Hoodie Body */}
          <Path d="M22 85c3-11 11-15 28-15s25 4 28 15H22z" fill="#E53935" />
          
          {/* Hoodie trim */}
          <Path d="M32 70l18 10 18-10" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" fill="none" />
          {/* Inner collar */}
          <Path d="M45 70a5 5 0 0010 0" fill="#212F3D" />
        </G>
      </Svg>
    </View>
  );
}

export default function ProfileScreen() {
  const theme = useTheme();

  const handlePressSetting = (title: string) => {
    Alert.alert('Info', `Membuka halaman ${title}`);
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
              <Image
  source={require('@/assets/images/logo-shield.png')} // sesuaikan path logo kamu
  style={{ width: 38, height: 38 }}
  resizeMode="contain"
/>
            <Text style={[styles.headerTitle, { color: theme.mintDark }]}>Profile</Text>
          </View>
          <Pressable style={styles.bellButton}>
            <Bell size={22} color={theme.mintDark} />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* PROFILE CARD */}
          <View style={styles.profileHeaderContainer}>
            <ProfileAvatar size={105} />
            <Text style={styles.usernameText}>TheLittleRabbit90</Text>
            <Text style={styles.modeText}>Mode Anonim</Text>
          </View>

          {/* QUICK STATS ROW */}
          <View style={styles.quickStatsRow}>
            <View style={styles.quickStatCard}>
              <Flame size={20} color="#0FB184" style={styles.quickStatIcon} />
              <Text style={styles.quickStatValue}>7 Hari</Text>
              <Text style={styles.quickStatLabel}>LOGIN</Text>
            </View>
            <View style={styles.quickStatCard}>
              <Text style={styles.quickStatValue}>Baik</Text>
              <Text style={styles.quickStatLabel}>TINGKAT EMOSIONAL</Text>
            </View>
          </View>

          {/* KOMUNITAS CARD */}
          <View style={styles.communityCard}>
            <Text style={styles.communityTitle}>KOMUNITAS</Text>
            
            <View style={styles.communityStatsRow}>
              {/* Stat Column 1 */}
              <View style={styles.communityStatCol}>
                <View style={[styles.iconBox, { backgroundColor: '#FCE4EC' }]}>
                  <SquarePen size={20} color="#EC407A" />
                </View>
                <Text style={styles.communityStatValue}>4</Text>
                <Text style={styles.communityStatLabel}>Postingan</Text>
              </View>

              {/* Stat Column 2 */}
              <View style={styles.communityStatCol}>
                <View style={[styles.iconBox, { backgroundColor: '#E0F2F1' }]}>
                  <MessageSquare size={20} color="#00796B" />
                </View>
                <Text style={styles.communityStatValue}>21</Text>
                <Text style={styles.communityStatLabel}>Komentar</Text>
              </View>

              {/* Stat Column 3 */}
              <View style={styles.communityStatCol}>
                <View style={[styles.iconBox, { backgroundColor: '#E8F5E9' }]}>
                  <Heart size={20} color="#388E3C" />
                </View>
                <Text style={styles.communityStatValue}>147</Text>
                <Text style={styles.communityStatLabel}>Total Suka</Text>
              </View>
            </View>
          </View>

          {/* SETTINGS LIST */}
          <View style={styles.settingsList}>
            {[
              { title: 'Edit Profile', Icon: Smile },
              { title: 'Pengaturan Akun', Icon: Lock },
              { title: 'Pengaturan Aplikasi', Icon: Settings },
              { title: 'Tentang Aplikasi', Icon: Info },
            ].map((item, idx) => (
              <Pressable
                key={idx}
                onPress={() => handlePressSetting(item.title)}
                style={({ pressed }) => [
                  styles.settingRow,
                  pressed && { opacity: 0.8 }
                ]}
              >
                <View style={styles.settingRowLeft}>
                  <item.Icon size={20} color={theme.mintDark} style={{ marginRight: 12 }} />
                  <Text style={styles.settingText}>{item.title}</Text>
                </View>
                <ChevronRight size={18} color="#B0C2B8" />
              </Pressable>
            ))}
          </View>

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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: Spacing.two,
  },
  bellButton: {
    padding: Spacing.one,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: 110, // Avoid overlapping with bottom tab bar
  },
  profileHeaderContainer: {
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  avatarWrapper: {
    marginBottom: Spacing.two,
  },
  usernameText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#056B4E',
  },
  modeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7C8C85',
    marginTop: 2,
  },
  quickStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.four,
  },
  quickStatCard: {
    flex: 1,
    backgroundColor: '#FAFDFD',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#ECEFEF',
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    height: 96,
  },
  quickStatIcon: {
    marginBottom: 4,
  },
  quickStatValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E2A22',
  },
  quickStatLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#7C8C85',
    textAlign: 'center',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  communityCard: {
    backgroundColor: '#FAFDFD',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#ECEFEF',
    padding: 20,
    marginBottom: Spacing.four,
  },
  communityTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#7C8C85',
    letterSpacing: 1,
    marginBottom: 16,
  },
  communityStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  communityStatCol: {
    flex: 1,
    alignItems: 'center',
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  communityStatValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E2A22',
  },
  communityStatLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7C8C85',
    marginTop: 2,
  },
  settingsList: {
    marginTop: 10,
  },
  settingRow: {
    backgroundColor: '#FAFDFD',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECEFEF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 10,
  },
  settingRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E2A22',
  },
});
