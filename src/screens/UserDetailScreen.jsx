import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { Avatar, AppButton } from "../components";
import { useHeaderHeight } from "@react-navigation/elements";

export default function UserDetailScreen({ route, navigation }) {
  const { userId, userName } = route.params;
  const currentUserId = auth.currentUser?.uid;
  const headerHeight = useHeaderHeight();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isContact, setIsContact] = useState(false);
  const [addingContact, setAddingContact] = useState(false);

  /**
   * 1. Ambil detail profil user dari Firestore `users/{userId}`
   */
  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists() && isMounted) {
          setUserData(userDoc.data());
        }
      } catch (error) {
        console.error("Gagal mengambil data user:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  /**
   * 2. Periksa apakah user ini sudah ada di kontak privat currentUser
   */
  useEffect(() => {
    if (!currentUserId || !userId) return;

    const contactRef = doc(db, "users", currentUserId, "contacts", userId);
    const unsubscribe = onSnapshot(contactRef, (docSnap) => {
      setIsContact(docSnap.exists());
    });

    return () => unsubscribe();
  }, [currentUserId, userId]);

  /**
   * 3. Tambahkan ke daftar kontak jika belum ada
   */
  const handleAddContact = async () => {
    if (!currentUserId || !userData) return;

    try {
      setAddingContact(true);
      const contactRef = doc(db, "users", currentUserId, "contacts", userId);
      await setDoc(contactRef, {
        uid: userId,
        displayName: userData.displayName || userName || "Pengguna",
        email: userData.email || "",
        photoURL: userData.photoURL || null,
        addedAt: serverTimestamp(),
      });

      Alert.alert(
        "Berhasil",
        `${userData.displayName || "Pengguna"} telah ditambahkan ke kontak Anda.`,
      );
    } catch (error) {
      console.error("Gagal menambahkan kontak:", error);
      Alert.alert("Error", "Gagal menambahkan kontak.");
    } finally {
      setAddingContact(false);
    }
  };

  /**
   * 4. Buka Layar Chat
   */
  const handleStartChat = () => {
    navigation.navigate("Chat", {
      receiverId: userId,
      userName: userData?.displayName || userName || "Pengguna",
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const nameToShow = userData?.displayName || userName || "Pengguna";
  const emailToShow = userData?.email || "Tidak tersedia";
  const bioToShow = userData?.bio || "Hai, saya menggunakan MobileChatApp!";

  return (
    <ScrollView
      style={{ ...styles.container, paddingTop: headerHeight }}
      contentContainerStyle={styles.content}
    >
      {/* Kartu Profil Utama */}
      <View style={styles.profileCard}>
        <Avatar
          name={nameToShow}
          photoURL={userData?.photoURL}
          size={90}
          style={styles.avatarShadow}
        />

        <Text style={styles.displayName}>{nameToShow}</Text>
        <Text style={styles.emailText}>{emailToShow}</Text>

        <Text style={styles.bioText}>"{bioToShow}"</Text>

        <View style={styles.actionRow}>
          {/* Tombol Mulai Chat */}
          <AppButton
            title="Kirim Pesan"
            icon="chatbubble-ellipses-outline"
            variant="primary"
            onPress={handleStartChat}
            style={styles.actionBtn}
          />

          {/* Tombol Tambah Kontak (Hanya jika belum disimpan & bukan diri sendiri) */}
          {currentUserId !== userId && (
            <AppButton
              title={isContact ? "Sudah di Kontak" : "Tambah Kontak"}
              icon={isContact ? "checkmark-circle" : "person-add-outline"}
              variant={isContact ? "secondary" : "outline"}
              onPress={isContact ? undefined : handleAddContact}
              disabled={isContact || addingContact}
              loading={addingContact}
              style={styles.actionBtn}
            />
          )}
        </View>
      </View>

      {/* Informasi Detail */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Informasi Pengguna</Text>

        <View style={styles.infoRow}>
          <View style={styles.iconBadge}>
            <Ionicons name="person-outline" size={20} color="#007AFF" />
          </View>
          <View style={styles.infoDetail}>
            <Text style={styles.infoLabel}>Nama Lengkap</Text>
            <Text style={styles.infoValue}>{nameToShow}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <View style={styles.iconBadge}>
            <Ionicons name="mail-outline" size={20} color="#007AFF" />
          </View>
          <View style={styles.infoDetail}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{emailToShow}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <View style={styles.iconBadge}>
            <Ionicons
              name="chatbox-ellipses-outline"
              size={20}
              color="#007AFF"
            />
          </View>
          <View style={styles.infoDetail}>
            <Text style={styles.infoLabel}>Bio</Text>
            <Text style={styles.infoValue}>{bioToShow}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <View style={styles.iconBadge}>
            <Ionicons
              name={isContact ? "checkbox-outline" : "close-circle-outline"}
              size={20}
              color={isContact ? "#10B981" : "#94A3B8"}
            />
          </View>
          <View style={styles.infoDetail}>
            <Text style={styles.infoLabel}>Status Kontak</Text>
            <Text
              style={[
                styles.infoValue,
                { color: isContact ? "#10B981" : "#64748B" },
              ]}
            >
              {isContact
                ? "Tersimpan di daftar kontak Anda"
                : "Belum tersimpan di kontak Anda"}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  avatarShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  displayName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0F172A",
    marginTop: 14,
  },
  emailText: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 2,
  },
  bioText: {
    fontSize: 13,
    fontStyle: "italic",
    color: "#475569",
    marginTop: 10,
    textAlign: "center",
    marginHorizontal: 16,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
    width: "100%",
  },
  actionBtn: {
    flex: 1,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoDetail: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#94A3B8",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1E293B",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 4,
  },
});
