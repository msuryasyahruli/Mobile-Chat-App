import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { signOut, updateProfile } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import {
  ConfirmationModal,
  Avatar,
  AppButton,
  ProfileEditModal,
  AvatarPickerModal,
} from "../components";

export default function ProfileScreen({ navigation }) {
  const currentUser = auth.currentUser;

  const [displayName, setDisplayName] = useState(
    currentUser?.displayName || "Pengguna",
  );
  const [bio, setBio] = useState("Hai, saya menggunakan MobileChatApp!");
  const [photoURL, setPhotoURL] = useState(currentUser?.photoURL || "");
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [isAvatarPickerVisible, setIsAvatarPickerVisible] = useState(false);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);

  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchUserProfile = async () => {
      if (!currentUser?.uid) {
        setLoadingProfile(false);
        return;
      }

      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists() && isMounted) {
          const data = userDocSnap.data();
          if (data.displayName) setDisplayName(data.displayName);
          if (data.bio) setBio(data.bio);
          if (data.photoURL) setPhotoURL(data.photoURL);
        }
      } catch (error) {
        console.error("Gagal memuat profil pengguna:", error);
      } finally {
        if (isMounted) {
          setLoadingProfile(false);
        }
      }
    };

    fetchUserProfile();

    return () => {
      isMounted = false;
    };
  }, [currentUser?.uid]);

  const handleOpenEditModal = () => {
    setEditName(displayName);
    setEditBio(bio);
    setIsEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    const trimmedName = editName.trim();
    if (!trimmedName) {
      Alert.alert("Perhatian", "Nama lengkap tidak boleh kosong.");
      return;
    }

    setIsSaving(true);

    try {
      await updateProfile(auth.currentUser, {
        displayName: trimmedName,
      });

      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        displayName: trimmedName,
        bio: editBio.trim(),
      });

      setDisplayName(trimmedName);
      setBio(editBio.trim());
      setIsEditModalVisible(false);

      Alert.alert("Berhasil", "Profil Anda berhasil diperbarui!");
    } catch (error) {
      console.error("Gagal memperbarui profil:", error);
      Alert.alert("Error", "Gagal menyimpan perubahan profil.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAvatar = async (newPhotoURL) => {
    setIsSavingAvatar(true);

    try {
      await updateProfile(auth.currentUser, {
        photoURL: newPhotoURL || null,
      });

      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        photoURL: newPhotoURL || null,
      });

      setPhotoURL(newPhotoURL);
      setIsAvatarPickerVisible(false);

      Alert.alert("Berhasil", "Foto profil Anda berhasil diperbarui!");
    } catch (error) {
      console.error("Gagal memperbarui foto profil:", error);
      Alert.alert("Error", "Gagal menyimpan foto profil.");
    } finally {
      setIsSavingAvatar(false);
    }
  };

  const handleConfirmLogout = async () => {
    setIsLogoutModalVisible(false);
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Gagal logout:", error);
      Alert.alert("Error", "Gagal keluar dari akun.");
    }
  };

  if (loadingProfile) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Profile Card */}
      <View style={styles.profileCard}>
        {/* Avatar dengan tombol kamera untuk ubah foto */}
        <TouchableOpacity
          onPress={() => setIsAvatarPickerVisible(true)}
          activeOpacity={0.85}
          style={styles.avatarWrapper}
        >
          <Avatar
            name={displayName}
            photoURL={photoURL}
            size={90}
            style={styles.avatarShadow}
          />
          <View style={styles.cameraBadge}>
            <Ionicons name="camera" size={16} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setIsAvatarPickerVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.changePhotoText}>Ubah Foto Profil</Text>
        </TouchableOpacity>

        <Text style={styles.displayName}>{displayName}</Text>
        <Text style={styles.emailText}>{currentUser?.email}</Text>

        {bio ? <Text style={styles.bioText}>"{bio}"</Text> : null}

        {/* Tombol Aksi Edit Profil */}
        <AppButton
          title="Edit Data Diri"
          icon="create-outline"
          variant="outline"
          size="sm"
          onPress={handleOpenEditModal}
          style={styles.editButton}
        />
      </View>

      {/* Info Akun Section */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Informasi Akun</Text>

        <View style={styles.infoRow}>
          <View style={styles.iconBadge}>
            <Ionicons name="person-outline" size={20} color="#007AFF" />
          </View>
          <View style={styles.infoDetail}>
            <Text style={styles.infoLabel}>Nama Lengkap</Text>
            <Text style={styles.infoValue}>{displayName}</Text>
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
            <Text style={styles.infoLabel}>Bio / Status</Text>
            <Text style={styles.infoValue}>{bio || "Belum ada bio"}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <View style={styles.iconBadge}>
            <Ionicons name="mail-outline" size={20} color="#007AFF" />
          </View>
          <View style={styles.infoDetail}>
            <Text style={styles.infoLabel}>Alamat Email</Text>
            <Text style={styles.infoValue}>{currentUser?.email}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <View style={styles.iconBadge}>
            <Ionicons name="key-outline" size={20} color="#007AFF" />
          </View>
          <View style={styles.infoDetail}>
            <Text style={styles.infoLabel}>User ID</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {currentUser?.uid}
            </Text>
          </View>
        </View>
      </View>

      <AppButton
        title="Keluar dari Akun"
        icon="log-out-outline"
        variant="danger"
        size="md"
        style={styles.logoutButton}
        onPress={() => setIsLogoutModalVisible(true)}
      />

      {/* Modal Edit Nama & Bio */}
      <ProfileEditModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        name={editName}
        setName={setEditName}
        bio={editBio}
        setBio={setEditBio}
        onSave={handleSaveProfile}
        isSaving={isSaving}
      />

      {/* Modal Pilih & Upload Foto Profil */}
      <AvatarPickerModal
        visible={isAvatarPickerVisible}
        onClose={() => setIsAvatarPickerVisible(false)}
        currentPhotoURL={photoURL}
        displayName={displayName}
        onSelectAvatar={handleSaveAvatar}
        isSaving={isSavingAvatar}
      />

      {/* Modal Konfirmasi Logout */}
      <ConfirmationModal
        visible={isLogoutModalVisible}
        title="Konfirmasi Keluar"
        message="Apakah Anda yakin ingin keluar dari akun ini?"
        iconName="log-out-outline"
        iconColor="#EF4444"
        cancelText="Batal"
        confirmText="Keluar"
        confirmButtonColor="#EF4444"
        onCancel={() => setIsLogoutModalVisible(false)}
        onConfirm={handleConfirmLogout}
      />
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
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 6,
  },
  avatarShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  cameraBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: "#007AFF",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    elevation: 3,
  },
  changePhotoText: {
    fontSize: 13,
    color: "#007AFF",
    fontWeight: "600",
    marginTop: 4,
  },
  displayName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0F172A",
    marginTop: 10,
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
    marginTop: 8,
    textAlign: "center",
    marginHorizontal: 16,
    lineHeight: 18,
  },
  editButton: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
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
    color: "#0F172A",
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
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
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 4,
  },
  logoutButton: {
    marginTop: 8,
    width: "100%",
  },
});
