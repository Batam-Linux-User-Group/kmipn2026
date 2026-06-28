import { router } from 'expo-router';
import { Bell, Clock, Heart, MessageSquare, Plus, Search, Share2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { Image } from "react-native";


import { Avatar } from '@/components/avatar';
import { Post, postsStore } from '@/constants/posts-data';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';


// Checkmark badge for username
function CheckmarkIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14" fill="none" style={{ marginLeft: 4 }}>
      <Circle cx={7} cy={7} r={6.5} fill="#0FB184" />
      <Path d="M4.5 7.5l1.5 1.5 3.5-4" stroke="#FFFFFF" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function ForumScreen() {
  const theme = useTheme();
  const [posts, setPosts] = useState<Post[]>(() => postsStore.getPosts());
  const [selectedCategory, setSelectedCategory] = useState<'Semua Kategori' | 'Minta Saran' | 'Berbagi Cerita'>('Semua Kategori');

  // Load and subscribe to posts changes
  useEffect(() => {
    // Subscribe to store updates
    const unsubscribe = postsStore.subscribe(() => {
      setPosts(postsStore.getPosts());
    });
    
    return unsubscribe;
  }, []);

  const handleLike = (postId: string) => {
    postsStore.likePost(postId);
  };

  const handlePostDetail = (postId: string) => {
    router.push({
      pathname: '/tabs/forum-detail',
      params: { id: postId }
    });
  };

  // Filter posts based on selected category
  const filteredPosts = posts.filter((post) => {
    if (selectedCategory === 'Semua Kategori') return true;
    return post.category === selectedCategory;
  });

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={require('@/assets/images/logo-shield.png')}
              style={{ width: 38, height: 38 }}
              resizeMode="contain"
            />
            <Text style={[styles.headerTitle, { color: theme.mintDark }]}>Forum Diskusi</Text>
          </View>
          <View style={styles.headerRight}>
            <Pressable style={styles.iconButton}>
              <Search size={22} color={theme.mintDark} />
            </Pressable>
            <Pressable style={styles.iconButton}>
              <Bell size={22} color={theme.mintDark} />
            </Pressable>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* SHARE BANNER CARD */}
          <View style={[styles.shareCard, { backgroundColor: theme.mintDark }]}>
            <View style={styles.shareCardLeft}>
              <Avatar type="cool" size={44} />
              <View style={styles.shareCardText}>
                <Text style={styles.shareCardTitle}>BERBAGI HARI INI</Text>
                <Text style={styles.shareCardSubtitle}>Apa yang sedang kamu pikirkan?</Text>
              </View>
            </View>
            <Pressable
              onPress={() => router.push('/tabs/forum-create')}
              style={({ pressed }) => [
                styles.plusButton,
                { backgroundColor: theme.mintMedium },
                pressed && { opacity: 0.9, transform: [{ scale: 0.95 }] }
              ]}
            >
              <Plus size={20} color="#FFFFFF" strokeWidth={3} />
            </Pressable>
          </View>

          {/* CATEGORIES ROW */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesRow}
          >
            {(['Semua Kategori', 'Minta Saran', 'Berbagi Cerita'] as const).map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <Pressable
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  style={[
                    styles.categoryPill,
                    isActive
                      ? { backgroundColor: theme.mintDark, borderColor: theme.mintDark }
                      : { backgroundColor: '#ECEFEF', borderColor: '#ECEFEF' }
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
          </ScrollView>

          {/* POSTS LIST */}
          {filteredPosts.map((post) => (
            <Pressable
              key={post.id}
              onPress={() => handlePostDetail(post.id)}
              style={styles.postCard}
            >
              {/* User info row */}
              <View style={styles.postHeader}>
                <View style={styles.postHeaderLeft}>
                  <Avatar type={post.avatarType} size={44} />
                  <View style={styles.postUserText}>
                    <View style={styles.usernameRow}>
                      <Text style={styles.usernameText}>{post.username}</Text>
                      {post.hasCheckmark && <CheckmarkIcon />}
                    </View>
                    <Text style={[styles.userRole, { color: theme.cardSubtitle }]}>{post.role}</Text>
                  </View>
                </View>

                {/* Category tag */}
                <View
                  style={[
                    styles.tagPill,
                    { borderColor: theme.mintBorder }
                  ]}
                >
                  <Text style={[styles.tagText, { color: theme.mintDark }]}>
                    {post.category.toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Post Content */}
              <Text style={styles.postContent} numberOfLines={4}>
                {post.content}
              </Text>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Footer Engagement */}
              <View style={styles.postFooter}>
                <View style={styles.footerLeft}>
                  <Clock size={16} color="#7C8C85" style={{ marginRight: 4 }} />
                  <Text style={styles.footerText}>{post.timeText}</Text>
                </View>

                <View style={styles.footerRight}>
                  {/* Comments button */}
                  <Pressable
                    onPress={() => handlePostDetail(post.id)}
                    style={styles.footerActionButton}
                  >
                    <MessageSquare size={16} color="#7C8C85" style={{ marginRight: 4 }} />
                    <Text style={styles.footerText}>{post.commentsCount}</Text>
                  </Pressable>

                  {/* Likes button */}
                  <Pressable
                    onPress={() => handleLike(post.id)}
                    style={styles.footerActionButton}
                  >
                    <Heart size={16} color="#7C8C85" style={{ marginRight: 4 }} />
                    <Text style={styles.footerText}>{post.likes}</Text>
                  </Pressable>

                  {/* Share button */}
                  <Pressable style={styles.footerActionButton}>
                    <Share2 size={16} color="#7C8C85" />
                  </Pressable>
                </View>
              </View>
            </Pressable>
          ))}
          
          {filteredPosts.length === 0 && (
            <Text style={[styles.noPostsText, { color: theme.cardSubtitle }]}>
              Belum ada postingan di kategori ini.
            </Text>
          )}
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
  headerRight: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: Spacing.one,
    marginLeft: Spacing.two,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: 110, // Avoid bottom tab bar obstruction
  },
  shareCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 24,
    marginBottom: Spacing.four,
    shadowColor: '#056B4E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  shareCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareCardText: {
    marginLeft: 12,
  },
  shareCardTitle: {
    color: '#A9EAD7',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  shareCardSubtitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  plusButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesRow: {
    flexDirection: 'row',
    paddingBottom: Spacing.four,
  },
  categoryPill: {
    paddingHorizontal: Spacing.four,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    marginRight: 10,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '700',
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: Spacing.four,
    borderWidth: 1,
    borderColor: '#ECEFEF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  postHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postUserText: {
    marginLeft: 12,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  usernameText: {
    fontSize: 15,
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFDFD',
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  postContent: {
    fontSize: 15,
    color: '#283830',
    lineHeight: 22,
    fontWeight: '500',
    marginVertical: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F2F2',
    marginVertical: 4,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    paddingVertical: 4,
  },
  footerText: {
    fontSize: 13,
    color: '#7C8C85',
    fontWeight: '600',
  },
  noPostsText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 15,
  },
});
