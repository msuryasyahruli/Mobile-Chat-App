import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

export default function SettingScreen() {
  const currentUserId = auth.currentUser?.uid;

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [loading, setLoading] = useState(true);
  const [updatingField, setUpdatingField] = useState(null);

  /**
   * Mengambil preferensi pengguna saat ini dari dokumen Firestore `users/{uid}`
   */
  useEffect(() => {
    let isMounted = true;

    const fetchPreferences = async () => {
      if (!currentUserId) {
        setLoading(false);
        return;
      }

      try {
        const userDocRef = doc(db, "users", currentUserId);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists() && isMounted) {
          const data = docSnap.data();
          if (data.preferences) {
            setNotificationsEnabled(
              data.preferences.notificationsEnabled ?? true,
            );
            setReadReceipts(data.preferences.readReceipts ?? true,);
          }
        }
      } catch (error) {
        console.error("Gagal memuat pengaturan:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPreferences();

    return () => {
      isMounted = false;
    };
  }, [currentUserId]);

  /**
   * Menyimpan perubahan toggle ke Firestore
   */
  const handleTogglePreference = async (key, newValue) => {
    if (!currentUserId) return;

    // Optimistic UI update
    if (key === "notificationsEnabled") setNotificationsEnabled(newValue);
    if (key === "readReceipts") setReadReceipts(newValue);

    setUpdatingField(key);

    try {
      const userDocRef = doc(db, "users", currentUserId);
      await updateDoc(userDocRef, {
        [`preferences.${key}`]: newValue,
      });
    } catch (error) {
      console.error(`Gagal memperbarui preferensi ${key}:`, error);
      // Fallback rollback jika gagal
      if (key === "notificationsEnabled") setNotificationsEnabled(!newValue);
      if (key === "readReceipts") setReadReceipts(!newValue);
      Alert.alert("Gagal Menyimpan", "Pengaturan gagal diperbarui.");
    } finally {
      setUpdatingField(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Pengaturan Notifikasi */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Notifikasi</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <View style={styles.iconBadge}>
              <Ionicons
                name="notifications-outline"
                size={20}
                color="#007AFF"
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.settingLabel}>Push Notification</Text>
              <Text style={styles.settingDescription}>
                Terima pemberitahuan saat pesan obrolan baru masuk
              </Text>
            </View>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={(val) =>
              handleTogglePreference("notificationsEnabled", val)
            }
            trackColor={{ false: "#E2E8F0", true: "#007AFF" }}
            thumbColor="#FFFFFF"
            disabled={updatingField === "notificationsEnabled"}
          />
        </View>
      </View>

      {/* Privasi & Keamanan */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Privasi & Laporan Baca</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <View style={styles.iconBadge}>
              <Ionicons
                name="checkmark-done-outline"
                size={20}
                color="#007AFF"
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.settingLabel}>
                Laporan Dibaca (Read Receipts)
              </Text>
              <Text style={styles.settingDescription}>
                Jika dinonaktifkan, orang lain tidak akan melihat centang biru
                saat Anda membaca pesan mereka.
              </Text>
            </View>
          </View>
          <Switch
            value={readReceipts}
            onValueChange={(val) => handleTogglePreference("readReceipts", val)}
            trackColor={{ false: "#E2E8F0", true: "#007AFF" }}
            thumbColor="#FFFFFF"
            disabled={updatingField === "readReceipts"}
          />
        </View>
      </View>

      {/* Informasi Aplikasi */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Tentang Aplikasi</Text>

        <TouchableOpacity style={styles.settingRow} activeOpacity={0.6}>
          <View style={styles.settingInfo}>
            <View style={styles.iconBadge}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#007AFF"
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.settingLabel}>Versi Aplikasi</Text>
              <Text style={styles.settingDescription}>MobileChatApp v1.1.0</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 18,
    marginBottom: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 14,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#EBF5FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
  },
  settingDescription: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 3,
    lineHeight: 16,
  },
});
