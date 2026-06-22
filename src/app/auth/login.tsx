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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

// Google "G" logo SVG
function GoogleIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24">
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </Svg>
  );
}

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
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    
    try {
      // TODO: Tambahkan logika autentikasi Google di sini
      // Contoh:
      // await GoogleSignin.hasPlayServices();
      // const userInfo = await GoogleSignin.signIn();
      
      // Simulasi delay proses login (hapus ini setelah implementasi Google Auth)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Login berhasil!");
      
      // Navigasi ke halaman utama (tabs)
      // Menggunakan 'replace' agar user tidak bisa back ke halaman login
      router.replace("/tabs");
      
    } catch (error) {
      console.error("Error saat login:", error);
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
          Masuk dengan akun Google untuk mengakses JEDA
        </Text>
      </View>

      {/* Button Section */}
      <View style={styles.buttonSection}>
        <Pressable
          onPress={handleGoogleSignIn}
          disabled={isLoading}
          style={({ pressed }) => [
            styles.googleButton,
            pressed && !isLoading && styles.googleButtonPressed,
            isLoading && styles.googleButtonDisabled,
          ]}
        >
          {isLoading ? (
            <ActivityIndicator color="#1A1A1A" size="small" />
          ) : (
            <>
              <GoogleIcon />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </>
          )}
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
    marginBottom: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    width: 200,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: {
    width: 200,
    height: 200,
  },
  textSection: {
    alignItems: "center",
    paddingHorizontal: 32,
    paddingBottom: 32,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1A1A1A",
    textAlign: "center",
    lineHeight: 36,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "400",
    color: "#3D5A54",
    textAlign: "center",
    lineHeight: 20,
  },
  buttonSection: {
    width: "100%",
    paddingHorizontal: 32,
    paddingBottom: 16,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  googleButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  googleButtonDisabled: {
    opacity: 0.6,
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
    letterSpacing: 0.2,
  },
});