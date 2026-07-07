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
import { usersApi } from "@/services/api";

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

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!email || !username || !password || !confirmPassword) {
      setError("Semua kolom harus diisi");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
            full_name: username,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message || "Gagal melakukan registrasi");
        return;
      }

      // Sync backend user if session is created immediately
      if (data?.session) {
        try {
          const { user } = data.session;
          await usersApi.sync({
            email: user.email ?? "",
            display_name: user.user_metadata?.full_name || username || "User JEDA",
            username: user.user_metadata?.username || username,
            avatar_url: user.user_metadata?.avatar_url || "",
          });
        } catch (syncErr) {
          console.error("[Register] Sync backend error:", syncErr);
        }
        router.replace('/assessment');
      } else {
        // If confirmation is required or session isn't automatically created
        setError("Pendaftaran berhasil. Silakan periksa email Anda.");
      }
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
        <Text style={styles.welcomeTitle}>Daftar Akun{"\n"}JEDA</Text>
        <Text style={styles.subtitle}>
          Buat akun baru untuk memulai perjalanan finansial sehat Anda
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
          placeholder="Username"
          placeholderTextColor="#7C8C85"
          value={username}
          onChangeText={(text) => {
            setUsername(text);
            setError("");
          }}
          autoCapitalize="none"
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

        <TextInput
          style={styles.input}
          placeholder="Konfirmasi Password"
          placeholderTextColor="#7C8C85"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            setError("");
          }}
          secureTextEntry
          autoCapitalize="none"
          editable={!isLoading}
        />

        {error ? (
          <Text style={[styles.errorText, error.includes("berhasil") && { color: "#16A34A" }]}>
            {error}
          </Text>
        ) : null}
      </View>

      {/* Button Section */}
      <View style={styles.buttonSection}>
        <Pressable
          onPress={handleRegister}
          disabled={isLoading}
          style={({ pressed }) => [
            styles.registerButton,
            pressed && !isLoading && styles.registerButtonPressed,
            isLoading && styles.registerButtonDisabled,
          ]}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.registerButtonText}>Daftar</Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => router.push('/auth/login')}
          disabled={isLoading}
          style={styles.loginLink}
        >
          <Text style={styles.loginLinkText}>
            Sudah punya akun? <Text style={styles.loginLinkHighlight}>Masuk</Text>
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
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: {
    width: 120,
    height: 120,
  },
  textSection: {
    alignItems: "center",
    paddingHorizontal: 32,
    paddingBottom: 16,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000000",
    textAlign: "center",
    marginBottom: 6,
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
    marginBottom: 20,
    gap: 10,
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
  registerButton: {
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
  registerButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  loginLink: {
    marginTop: 16,
    alignItems: "center",
  },
  loginLinkText: {
    fontSize: 14,
    color: "#1E2A22",
    fontWeight: "500",
  },
  loginLinkHighlight: {
    color: "#1A886A",
    fontWeight: "700",
  },
});
