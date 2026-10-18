import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";
import { AppButton, AppInput } from "../components";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Harap isi email dan kata sandi.");
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (error) {
      Alert.alert("Gagal Masuk", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Selamat Datang</Text>
        <Text style={styles.subtitle}>Masuk untuk melanjutkan chat</Text>

        <AppInput
          label="Email"
          placeholder="email@example.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          leftIcon="mail-outline"
        />

        <AppInput
          label="Kata Sandi"
          placeholder="Masukkan kata sandi"
          value={password}
          onChangeText={setPassword}
          isPassword
          leftIcon="lock-closed-outline"
        />

        <AppButton
          title="Masuk"
          onPress={handleLogin}
          loading={loading}
          size="lg"
          style={styles.submitButton}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Belum punya akun? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.linkText}>Daftar di sini</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F4F7",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 20,
  },
  submitButton: {
    marginTop: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  footerText: {
    color: "#64748B",
    fontSize: 14,
  },
  linkText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
