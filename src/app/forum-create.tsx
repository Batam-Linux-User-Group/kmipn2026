import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Image as ImageIcon, Smile } from 'lucide-react-native';
import Svg, { Path, Circle } from 'react-native-svg';

import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { Avatar } from '@/components/avatar';
import { postsStore } from '@/constants/posts-data';

function CheckmarkIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14" fill="none" style={{ marginLeft: 4 }}>
      <Circle cx={7} cy={7} r={6.5} fill="#0FB184" />
      <Path d="M4.5 7.5l1.5 1.5 3.5-4" stroke="#FFFFFF" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function ForumCreateScreen() {
  const theme = useTheme();
  const [postText, setPostText] = useState('');
  const [category, setCategory] = useState<'Minta Saran' | 'Berbagi Cerita' | 'Atur Strategi'>('Atur Strategi');

  const handlePost = () => {
    if (postText.trim()) {
      postsStore.addPost(category, postText.trim());
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.mintDark} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.mintDark }]}>Baca Postingan</Text>
          <View style={{ width: 40 }} /> {/* balance back button width */}
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* USER INFO HEADER */}
            <View style={styles.userInfoRow}>
              <Avatar type="bunny" size={48} />
              <View style={styles.userTextContainer}>
                <View style={styles.usernameRow}>
                  <Text style={styles.username}>SweetBunny22</Text>
                  <CheckmarkIcon />
                </View>
                <Text style={[styles.userRole, { color: theme.cardSubtitle }]}>Keluarga Pecandu</Text>
              </View>
            </View>

            {/* TEXT INPUT CARD */}
            <View style={styles.inputCard}>
              <TextInput
                value={postText}
                onChangeText={setPostText}
                placeholder="Tulis postingan kamu disini..."
                placeholderTextColor="#A0A5A8"
                style={styles.textArea}
                multiline
                textAlignVertical="top"
              />
              
              {/* Media attachments triggers */}
              <View style={styles.inputCardActions}>
                <Pressable style={styles.actionIconButton}>
                  <ImageIcon size={22} color="#7C8C85" />
                </Pressable>
                <Pressable style={styles.actionIconButton}>
                  <Smile size={22} color="#7C8C85" />
                </Pressable>
              </View>
            </View>

            {/* CATEGORY SELECTOR */}
            <Text style={[styles.sectionTitle, { color: theme.mintDark }]}>Pilih Kategori</Text>
            
            <View style={styles.categoriesContainer}>
              {(['Minta Saran', 'Berbagi Cerita', 'Atur Strategi'] as const).map((cat) => {
                const isActive = category === cat;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={[
                      styles.categoryPill,
                      isActive
                        ? { backgroundColor: theme.mintDark, borderColor: theme.mintDark }
                        : { backgroundColor: '#F2ECE9', borderColor: '#F2ECE9' }
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        { color: isActive ? '#FFFFFF' : theme.mintDark }
                      ]}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          {/* POST NOW BUTTON (FIXED AT BOTTOM) */}
          <View style={styles.footerContainer}>
            <Pressable
              onPress={handlePost}
              disabled={!postText.trim()}
              style={({ pressed }) => [
                styles.submitButton,
                { backgroundColor: theme.mintMedium },
                (!postText.trim() || pressed) && { opacity: 0.85 }
              ]}
            >
              <Text style={styles.submitButtonText}>Posting Sekarang</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
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
  backButton: {
    padding: Spacing.one,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: 120, // leave space for posting button
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  userTextContainer: {
    marginLeft: 12,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A2520',
  },
  userRole: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  inputCard: {
    backgroundColor: '#FAFDFD',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#ECEFEF',
    padding: 20,
    height: 250,
    justifyContent: 'space-between',
    marginBottom: Spacing.five,
  },
  textArea: {
    flex: 1,
    fontSize: 16,
    color: '#283830',
    fontWeight: '500',
    lineHeight: 24,
  },
  inputCardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  actionIconButton: {
    padding: Spacing.one,
    marginLeft: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: Spacing.three,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.four,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '700',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 24,
    left: Spacing.four,
    right: Spacing.four,
  },
  submitButton: {
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2BD5A2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
