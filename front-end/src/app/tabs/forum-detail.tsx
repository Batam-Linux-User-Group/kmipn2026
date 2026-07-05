import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Clock, Heart, Send } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { Avatar } from '@/components/avatar';
import { Spacing } from '@/constants/theme';
import { FontFamily } from '@/constants/fontsfamily';
import { useTheme } from '@/hooks/use-theme';
import { useForumStore } from '@/store/useForumStore';

function CheckmarkIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14" fill="none" style={{ marginLeft: 4 }}>
      <Circle cx={7} cy={7} r={6.5} fill="#0FB184" />
      <Path d="M4.5 7.5l1.5 1.5 3.5-4" stroke="#FFFFFF" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function formatTime(dateStr: string): string {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} menit lalu`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} jam lalu`;
    const days = Math.floor(hours / 24);
    return `${days} hari lalu`;
  } catch {
    return '';
  }
}

export default function ForumDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    activePost,
    isLoadingDetail,
    detailError,
    isSubmittingComment,
    fetchPostDetail,
    togglePostLike,
    createComment,
    toggleCommentLike,
  } = useForumStore();

  const [commentText, setCommentText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (id) {
      fetchPostDetail(id);
    }
  }, [id]);

  const handleLike = () => {
    if (activePost) {
      togglePostLike(activePost.id);
    }
  };

  const handleSendComment = async () => {
    if (!activePost || !commentText.trim()) return;
    await createComment(activePost.id, commentText.trim());
    setCommentText('');
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  };

  // Loading state
  if (isLoadingDetail) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3BCFA6" />
      </View>
    );
  }

  // Error state
  if (detailError || !activePost) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.textSecondary }}>Postingan tidak ditemukan.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 12 }}>
          <Text style={{ color: theme.mintDark, fontFamily: FontFamily.manropeBold }}>Kembali</Text>
        </Pressable>
      </View>
    );
  }

  const comments = activePost.comments ?? [];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.mintDark} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.mintDark }]}>Baca Postingan</Text>
          <View style={{ width: 40 }} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* MAIN POST CONTENT */}
            <View style={styles.postDetailContainer}>
              <View style={styles.userInfoRow}>
                <Avatar type="user" size={44} />
                <View style={styles.userTextContainer}>
                  <View style={styles.usernameRow}>
                    <Text style={styles.username}>
                      {activePost.user?.display_name ?? activePost.user?.username ?? 'Anonim'}
                    </Text>
                    {activePost.user?.is_verified && <CheckmarkIcon />}
                  </View>
                  <Text style={[styles.userRole, { color: theme.cardSubtitle }]}>
                    {activePost.user?.role ?? 'Anggota'}
                  </Text>
                </View>

                {/* Category tag */}
                <View style={[styles.tagPill, { borderColor: theme.mintBorder }]}>
                  <Text style={[styles.tagText, { color: theme.mintDark }]}>
                    {activePost.category?.name?.toUpperCase() ?? ''}
                  </Text>
                </View>
              </View>

              <Text style={styles.postBodyText}>{activePost.content}</Text>

              {/* Engagement Stats */}
              <View style={styles.engagementRow}>
                <View style={styles.timeSection}>
                  <Clock size={16} color="#7C8C85" style={{ marginRight: 4 }} />
                  <Text style={styles.timeText}>{formatTime(activePost.created_at)}</Text>
                </View>

                <Pressable onPress={handleLike} style={styles.likesSection}>
                  <Heart size={18} color="#FF7B6E" fill="#FF7B6E" style={{ marginRight: 6 }} />
                  <Text style={styles.likesText}>{activePost.likes_count} Suka</Text>
                </Pressable>
              </View>
            </View>

            {/* COMMENTS HEADER */}
            <Text style={[styles.commentsSectionTitle, { color: theme.mintDark }]}>
              Komentar ({activePost.comments_count})
            </Text>

            {/* COMMENTS LIST */}
            {comments.map((comment) => (
              <View key={comment.id} style={styles.commentCard}>
                <View style={styles.commentHeader}>
                  <View style={styles.commentUserWrapper}>
                    <Avatar type="user" size={36} />
                    <View style={styles.commentUserText}>
                      <View style={styles.commentUserRow}>
                        <Text style={styles.commentUsername}>
                          {comment.user?.display_name ?? comment.user?.username ?? 'Anonim'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                <Text style={styles.commentContent}>{comment.content}</Text>

                <View style={styles.commentFooter}>
                  <Text style={styles.commentTime}>{formatTime(comment.created_at)}</Text>

                  <Pressable
                    style={styles.commentLikes}
                    onPress={() => toggleCommentLike(comment.id)}
                  >
                    <Heart size={13} color="#7C8C85" style={{ marginRight: 4 }} />
                    <Text style={styles.commentLikesText}>{comment.likes_count}</Text>
                  </Pressable>
                </View>
              </View>
            ))}

            {comments.length === 0 && (
              <Text style={[styles.noCommentsText, { color: theme.cardSubtitle }]}>
                Belum ada komentar. Jadilah yang pertama memberikan saran!
              </Text>
            )}
          </ScrollView>

          {/* INPUT BAR */}
          <View style={styles.inputBarContainer}>
            <TextInput
              value={commentText}
              onChangeText={setCommentText}
              placeholder="Tulis komentar disini..."
              placeholderTextColor="#A0A5A8"
              style={styles.textInput}
              multiline={false}
            />
            <Pressable
              onPress={handleSendComment}
              disabled={!commentText.trim() || isSubmittingComment}
              style={({ pressed }) => [
                styles.sendButton,
                { backgroundColor: theme.mintMedium },
                (!commentText.trim() || pressed || isSubmittingComment) && { opacity: 0.8 },
              ]}
            >
              {isSubmittingComment ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Send size={18} color="#FFFFFF" style={{ marginLeft: 2 }} />
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  safeArea: { flex: 1 },
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
    paddingTop: Spacing.two,
    paddingBottom: 100,
  },
  postDetailContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: Spacing.four,
    borderWidth: 1,
    borderColor: '#ECEFEF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 17,
    elevation: 5,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userTextContainer: {
    flex: 1,
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
  tagPill: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FAFDFD',
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  postBodyText: {
    fontSize: 16,
    color: '#283830',
    lineHeight: 24,
    fontFamily: FontFamily.manropeMedium,
    marginVertical: 18,
  },
  engagementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F2F2',
    paddingTop: 14,
  },
  timeSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 13,
    color: '#7C8C85',
    fontWeight: '600',
  },
  likesSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  likesText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#11221A',
  },
  commentsSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.three,
  },
  commentCard: {
    backgroundColor: '#E8FBF5',
    borderRadius: 20,
    padding: 16,
    marginBottom: Spacing.three,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 17,
    elevation: 3,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commentUserWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentUserText: {
    marginLeft: 10,
  },
  commentUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A2520',
  },
  streakIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 6,
  },
  streakFlame: {
    fontSize: 12,
  },
  streakCount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF7B6E',
    marginLeft: 2,
  },
  commentContent: {
    fontSize: 14,
    color: '#283830',
    lineHeight: 20,
    fontFamily: FontFamily.manropeMedium,
    marginTop: 8,
    marginBottom: 10,
  },
  commentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  commentTime: {
    fontSize: 12,
    color: '#7C8C85',
    fontWeight: '500',
  },
  replyLink: {
    fontSize: 12,
    fontWeight: '700',
  },
  commentLikes: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentLikesText: {
    fontSize: 12,
    color: '#7C8C85',
    fontWeight: '600',
  },
  noCommentsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
  inputBarContainer: {
    position: 'absolute',
    bottom: 15,
    left: Spacing.four,
    right: Spacing.four,
    height: 54,
    backgroundColor: '#FFFFFF',
    borderRadius: 27,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#ECEFEF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 17,
    elevation: 6,
  },
  textInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#283830',
    fontFamily: FontFamily.manropeMedium,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
