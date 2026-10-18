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
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { AppButton, AppInput } from "../components";

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Error", "Harap isi semua kolom.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Kata sandi minimal 6 karakter.");
      return;
    }

    try {
      setLoading(true);
      // 1. Buat user di Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );
      const user = userCredential.user;

      // 2. Perbarui nama profil auth
      await updateProfile(user, { displayName: name.trim() });

      // 3. Simpan data user ke Cloud Firestore (koleksi "users")
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        displayName: name.trim(),
        email: email.trim().toLowerCase(),
        preferences: {
          notificationsEnabled: true,
          readReceipts: true,
        },
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      Alert.alert("Registrasi Gagal", error.message);
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
        <Text style={styles.title}>Buat Akun</Text>
        <Text style={styles.subtitle}>Daftar untuk mulai terhubung</Text>

        <AppInput
          label="Nama Lengkap"
          placeholder="Nama Anda"
          value={name}
          onChangeText={setName}
          leftIcon="person-outline"
        />

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
          placeholder="Minimal 6 karakter"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          isPassword
          leftIcon="lock-closed-outline"
        />

        <AppButton
          title="Daftar Sekarang"
          onPress={handleRegister}
          loading={loading}
          size="lg"
          style={styles.submitButton}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Sudah punya akun? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.linkText}>Masuk di sini</Text>
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
    color: "#666",
    marginBottom: 24,
  },
  input: {
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 16,
    color: "#333",
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
