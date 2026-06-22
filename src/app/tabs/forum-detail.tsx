import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Clock, Heart, Send } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
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
import { Post, postsStore } from '@/constants/posts-data';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

function CheckmarkIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14" fill="none" style={{ marginLeft: 4 }}>
      <Circle cx={7} cy={7} r={6.5} fill="#0FB184" />
      <Path d="M4.5 7.5l1.5 1.5 3.5-4" stroke="#FFFFFF" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function ForumDetailScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [commentText, setCommentText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  // Load post details and subscribe to updates
  useEffect(() => {
    const postId = id || 'post-1'; // fallback to first post if no id provided

    const unsubscribe = postsStore.subscribe(() => {
      // Keep state updates inside the store callback to avoid setState-in-effect linting.
      setPost(postsStore.getPostById(postId) || null);
    });

    // Initial load: schedule after effect commits.
    queueMicrotask(() => {
      // Defer to the next microtask so the effect body doesn't synchronously trigger setState.
      setPost(postsStore.getPostById(postId) || null);
    });


    return unsubscribe;
  }, [id]);

  const handleLike = () => {
    if (post) {
      postsStore.likePost(post.id);
    }
  };

  const handleSendComment = () => {
    if (post && commentText.trim()) {
      postsStore.addComment(post.id, commentText.trim());
      setCommentText('');
      // Scroll to bottom of comments list after comment is added
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  if (!post) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.textSecondary }}>Postingan tidak ditemukan.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 12 }}>
          <Text style={{ color: theme.mintDark, fontWeight: '700' }}>Kembali</Text>
        </Pressable>
      </View>
    );
  }

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
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* MAIN POST CONTENT */}
            <View style={styles.postDetailContainer}>
              <View style={styles.userInfoRow}>
                <Avatar type={post.avatarType} size={44} />
                <View style={styles.userTextContainer}>
                  <View style={styles.usernameRow}>
                    <Text style={styles.username}>{post.username}</Text>
                    {post.hasCheckmark && <CheckmarkIcon />}
                  </View>
                  <Text style={[styles.userRole, { color: theme.cardSubtitle }]}>{post.role}</Text>
                </View>

                {/* Category tag */}
                <View style={[styles.tagPill, { borderColor: theme.mintBorder }]}>
                  <Text style={[styles.tagText, { color: theme.mintDark }]}>
                    {post.category.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.postBodyText}>{post.content}</Text>

              {/* Engagement Stats row */}
              <View style={styles.engagementRow}>
                <View style={styles.timeSection}>
                  <Clock size={16} color="#7C8C85" style={{ marginRight: 4 }} />
                  <Text style={styles.timeText}>{post.timeText}</Text>
                </View>

                <Pressable onPress={handleLike} style={styles.likesSection}>
                  <Heart size={18} color="#FF7B6E" fill="#FF7B6E" style={{ marginRight: 6 }} />
                  <Text style={styles.likesText}>{post.likes} Suka</Text>
                </Pressable>
              </View>
            </View>

            {/* COMMENTS HEADER */}
            <Text style={[styles.commentsSectionTitle, { color: theme.mintDark }]}>Komentar</Text>

            {/* COMMENTS LIST */}
            {post.commentsList.map((comment) => (
              <View key={comment.id} style={styles.commentCard}>
                <View style={styles.commentHeader}>
                  <View style={styles.commentUserWrapper}>
                    <Avatar type={comment.avatarType} size={36} />
                    <View style={styles.commentUserText}>
                      <View style={styles.commentUserRow}>
                        <Text style={styles.commentUsername}>{comment.username}</Text>
                        <View style={styles.streakIndicator}>
                          <Text style={styles.streakFlame}>🔥</Text>
                          <Text style={styles.streakCount}>{comment.streak}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>

                <Text style={styles.commentContent}>{comment.content}</Text>

                {/* Comment Footer */}
                <View style={styles.commentFooter}>
                  <Text style={styles.commentTime}>{comment.timeText}</Text>
                  
                  {comment.repliesText && (
                    <Pressable>
                      <Text style={[styles.replyLink, { color: theme.mintDark }]}>
                        {comment.repliesText}
                      </Text>
                    </Pressable>
                  )}

                  <Pressable style={styles.commentLikes}>
                    <Heart size={13} color="#7C8C85" style={{ marginRight: 4 }} />
                    <Text style={styles.commentLikesText}>{comment.likes}</Text>
                  </Pressable>
                </View>
              </View>
            ))}

            {post.commentsList.length === 0 && (
              <Text style={[styles.noCommentsText, { color: theme.cardSubtitle }]}>
                Belum ada komentar. Jadilah yang pertama memberikan saran!
              </Text>
            )}
          </ScrollView>

          {/* INPUT BAR AT BOTTOM */}
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
              disabled={!commentText.trim()}
              style={({ pressed }) => [
                styles.sendButton,
                { backgroundColor: theme.mintMedium },
                (!commentText.trim() || pressed) && { opacity: 0.8 }
              ]}
            >
              <Send size={18} color="#FFFFFF" style={{ marginLeft: 2 }} />
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
    paddingTop: Spacing.two,
    paddingBottom: 100, // leave space for absolute comment input
  },
  postDetailContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: Spacing.four,
    borderWidth: 1,
    borderColor: '#ECEFEF',
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
    fontWeight: '500',
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
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
    fontWeight: '500',
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
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  textInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#283830',
    fontWeight: '500',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
