import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { supabase } from "@/services/supabase";
import { usersApi, assessmentsApi } from "@/services/api";

function JEDALogo() {
  return (
    <View style={styles.logoContainer}>
      <Image
        source={require('@/assets/icons/Jeda_Logo.png')}
        style={styles.logoImage}
        resizeMode="contain"
      />
    </View>
  );
}

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Email dan password harus diisi");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError("Email atau password salah");
        return;
      }

      if (data?.session) {
        const historyRes = await assessmentsApi.getHistory(1);
        if (historyRes.history && historyRes.history.length === 0) {
          router.replace('/assessment');
        } else {
          router.replace('/tabs');
        }
        return;
      }

      router.replace('/tabs');
    } catch {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#A8DDD0" />

      {/* Logo Section */}
      <View style={styles.logoSection}>
        <JEDALogo />
      </View>

      {/* Text Section */}
      <View style={styles.textSection}>
        <Text style={styles.welcomeTitle}>Selamat Datang{"\n"}di JEDA</Text>
        <Text style={styles.subtitle}>
          Masuk dengan akun Anda untuk mengakses JEDA
        </Text>
      </View>

      {/* Form Section */}
      <View style={styles.formSection}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#7C8C85"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setError("");
          }}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!isLoading}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#7C8C85"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setError("");
          }}
          secureTextEntry
          autoCapitalize="none"
          editable={!isLoading}
        />

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}
      </View>

      {/* Button Section */}
      <View style={styles.buttonSection}>
        <Pressable
          onPress={handleSignIn}
          disabled={isLoading}
          style={({ pressed }) => [
            styles.loginButton,
            pressed && !isLoading && styles.loginButtonPressed,
            isLoading && styles.loginButtonDisabled,
          ]}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.loginButtonText}>Masuk</Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => router.push('/auth/register')}
          disabled={isLoading}
          style={styles.registerLink}
        >
          <Text style={styles.registerLinkText}>
            Belum punya akun? <Text style={styles.registerLinkHighlight}>Daftar</Text>
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#A8DDD0",
    alignItems: "center",
    justifyContent: "center",
  },
  logoSection: {
    marginBottom: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    width: 160,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: {
    width: 160,
    height: 160,
  },
  textSection: {
    alignItems: "center",
    paddingHorizontal: 32,
    paddingBottom: 24,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#000000",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "400",
    color: "#000000",
    textAlign: "center",
    lineHeight: 20,
    opacity: 0.8,
  },
  formSection: {
    width: "100%",
    paddingHorizontal: 32,
    marginBottom: 24,
    gap: 12,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: "#1E2A22",
    borderWidth: 1,
    borderColor: "#BEECE0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 4,
  },
  buttonSection: {
    width: "100%",
    paddingHorizontal: 32,
    paddingBottom: 16,
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1A886A",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: "#1A886A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  loginButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  registerLink: {
    marginTop: 16,
    alignItems: "center",
  },
  registerLinkText: {
    fontSize: 14,
    color: "#1E2A22",
    fontWeight: "500",
  },
  registerLinkHighlight: {
    color: "#1A886A",
    fontWeight: "700",
  },
});
