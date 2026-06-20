export interface Comment {
  id: string;
  username: string;
  avatarType: 'jane' | 'siti' | 'user';
  streak: number;
  content: string;
  timeText: string;
  likes: string;
  repliesText?: string;
}

export interface Post {
  id: string;
  username: string;
  avatarType: 'bunny' | 'sari' | 'user' | 'cool';
  role: string;
  hasCheckmark: boolean;
  category: 'Minta Saran' | 'Berbagi Cerita' | 'Atur Strategi';
  content: string;
  timeText: string;
  likes: number;
  commentsCount: number;
  commentsList: Comment[];
}

// Default initial posts matching mockup exactly
let posts: Post[] = [
  {
    id: 'post-1',
    username: 'SweetBunny22',
    avatarType: 'bunny',
    role: 'Keluarga Pecandu',
    hasCheckmark: true,
    category: 'Minta Saran',
    content: 'Halo, Selamat Malam Semua... Suami saya suka sekali melakukan judi online, bahkan sehari bisa ngehabisin uang ratusan ribu... Padahal kan uangnya bisa buat beli beras yakk.. Adakah saran dari temen-temen biar suami saya bisa berhenti?',
    timeText: '24 Jam lalu',
    likes: 9,
    commentsCount: 3,
    commentsList: [
      {
        id: 'c-1',
        username: 'JaneDoe999',
        avatarType: 'jane',
        streak: 12,
        content: 'Mba saya sebagai suami juga pernah pengalaman... coba dibicarakan baik-baik dengan suami nya beserta anggota keluarga dari pihak suami. semoga lekas membaik ya mba 🌸',
        timeText: '18 Jam yang lalu',
        likes: '1.276',
        repliesText: '182 Balasan'
      },
      {
        id: 'c-2',
        username: 'Siti Aisyah',
        avatarType: 'siti',
        streak: 15,
        content: 'sama mba, gimana ya solusinya 😢',
        timeText: '18 Jam yang lalu',
        likes: '1.276',
        repliesText: 'Balas'
      },
      {
        id: 'c-3',
        username: 'JaneDoe999',
        avatarType: 'jane',
        streak: 15,
        content: 'Diingetin sholat lima waktunya mba, biar terhindar dari perbuatan buruk',
        timeText: '18 Jam yang lalu',
        likes: '1.276',
        repliesText: 'Balas'
      }
    ]
  },
  {
    id: 'post-2',
    username: 'Ratna Sari',
    avatarType: 'sari',
    role: 'Keluarga Pecandu',
    hasCheckmark: false,
    category: 'Berbagi Cerita',
    content: 'Perjalanan hari ke-30 tanpa judi. Ternyata kuncinya adalah jujur sama keluarga. Dulu saya tutup-tutupi semua hutang, tapi setelah terbuka semua rasanya beban berat berkurang setengahnya.',
    timeText: '2 Hari lalu',
    likes: 45,
    commentsCount: 12,
    commentsList: []
  }
];

// Subscriptions callback array to trigger updates in UI
const listeners = new Set<() => void>();

export const postsStore = {
  getPosts() {
    return posts;
  },
  
  getPostById(id: string) {
    return posts.find((p) => p.id === id);
  },
  
  addPost(category: 'Minta Saran' | 'Berbagi Cerita' | 'Atur Strategi', content: string) {
    const newPost: Post = {
      id: `post-${Date.now()}`,
      username: 'SweetBunny22',
      avatarType: 'bunny',
      role: 'Keluarga Pecandu',
      hasCheckmark: true,
      category,
      content,
      timeText: 'Baru saja',
      likes: 0,
      commentsCount: 0,
      commentsList: []
    };
    posts = [newPost, ...posts];
    this.notify();
    return newPost;
  },
  
  addComment(postId: string, content: string) {
    const post = posts.find((p) => p.id === postId);
    if (post) {
      const newComment: Comment = {
        id: `c-${Date.now()}`,
        username: 'Fawwaz Khairiy',
        avatarType: 'user',
        streak: 7, // User's streak from home
        content,
        timeText: 'Baru saja',
        likes: '0',
        repliesText: 'Balas'
      };
      post.commentsList = [...post.commentsList, newComment];
      post.commentsCount = post.commentsList.length;
      this.notify();
    }
  },

  likePost(postId: string) {
    const post = posts.find((p) => p.id === postId);
    if (post) {
      post.likes += 1;
      this.notify();
    }
  },
  
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  
  notify() {
    listeners.forEach((l) => l());
  }
};
