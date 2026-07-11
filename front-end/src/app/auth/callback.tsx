// src/app/auth/callback.tsx
// Handles deep link redirect after Google OAuth completes.
// Supabase automatically parses the token from the URL fragment.

import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { supabase } from '@/services/supabase';

export default function AuthCallbackScreen() {
  const router = useRouter();

  useEffect(() => {
    // onAuthStateChange in _layout.tsx handles the session.
    // Here we just need to redirect after a short wait.
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.replace('/tabs');
      } else {
        // Retry after token is set via deep link
        setTimeout(async () => {
          const { data } = await supabase.auth.getSession();
          router.replace(data.session ? '/tabs' : '/auth/login');
        }, 1500);
      }
    };

    checkSession();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#3BCFA6" />
      <Text style={styles.text}>Memproses login...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#A8DDD0',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  text: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1A886A',
  },
});
