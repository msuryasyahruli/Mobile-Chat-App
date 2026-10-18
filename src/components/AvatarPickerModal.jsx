import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import BaseModal from "./BaseModal";
import AppButton from "./AppButton";
import Avatar from "./Avatar";

// Preset avatar ilustrasi modern bebas royalti (Unsplash curated avatar faces)
export const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=250&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=250&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=250&q=80",
];

export default function AvatarPickerModal({
  visible,
  onClose,
  currentPhotoURL,
  displayName,
  onSelectAvatar,
  isSaving = false,
}) {
  const [selectedUri, setSelectedUri] = useState(currentPhotoURL || "");
  const [pickingFromGallery, setPickingFromGallery] = useState(false);

  React.useEffect(() => {
    if (visible) {
      setSelectedUri(currentPhotoURL || "");
    }
  }, [visible, currentPhotoURL]);

  const handlePickFromGallery = async () => {
    try {
      setPickingFromGallery(true);
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Izin Ditolak",
          "Aplikasi membutuhkan izin akses galeri untuk mengupload foto profil.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0].uri;

        setSelectedUri(asset);
      }
    } catch (error) {
      console.error("Gagal memilih gambar dari galeri:", error);
      Alert.alert("Gagal", "Tidak dapat membuka galeri.");
    } finally {
      setPickingFromGallery(false);
    }
  };

  const handleSave = () => {
    onSelectAvatar(selectedUri);
  };

  const handleRemovePhoto = () => {
    setSelectedUri("");
  };

  return (
    <BaseModal
      visible={visible}
      title="Pilih Foto Profil"
      iconName="image-outline"
      iconColor="#007AFF"
      onClose={isSaving ? undefined : onClose}
      showCloseButton={!isSaving}
      footer={
        <View style={styles.buttonRow}>
          <AppButton
            title="Batal"
            variant="secondary"
            onPress={onClose}
            disabled={isSaving}
            style={styles.flexBtn}
          />
          <AppButton
            title="Simpan Foto"
            variant="primary"
            onPress={handleSave}
            loading={isSaving}
            disabled={isSaving}
            style={styles.flexBtn}
          />
        </View>
      }
    >
      <View style={styles.previewContainer}>
        <Avatar
          name={displayName}
          photoURL={selectedUri}
          size={84}
          style={styles.previewAvatar}
        />
        <Text style={styles.previewLabel}>Pratinjau Foto Profil</Text>

        {selectedUri ? (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={handleRemovePhoto}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={14} color="#EF4444" />
            <Text style={styles.removeText}>Hapus Foto (Gunakan Inisial)</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Tombol Ambil dari Galeri */}
      <TouchableOpacity
        style={styles.galleryButton}
        onPress={handlePickFromGallery}
        disabled={pickingFromGallery || isSaving}
        activeOpacity={0.8}
      >
        {pickingFromGallery ? (
          <ActivityIndicator size="small" color="#007AFF" />
        ) : (
          <>
            <View style={styles.galleryIconWrap}>
              <Ionicons name="folder-open-outline" size={20} color="#007AFF" />
            </View>
            <View style={styles.galleryTextWrap}>
              <Text style={styles.galleryTitle}>Pilih dari Galeri HP</Text>
              <Text style={styles.gallerySubtitle}>
                Gunakan foto pribadi dari perangkat Anda
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </>
        )}
      </TouchableOpacity>

      {/* Pilihan Preset Avatar */}
      <Text style={styles.sectionTitle}>Atau Pilih Karakter Preset</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.presetList}
      >
        {PRESET_AVATARS.map((url, index) => {
          const isSelected = selectedUri === url;
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.presetItem,
                isSelected && styles.presetItemSelected,
              ]}
              onPress={() => setSelectedUri(url)}
              activeOpacity={0.8}
            >
              <Image source={{ uri: url }} style={styles.presetImage} />
              {isSelected && (
                <View style={styles.checkBadge}>
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  previewContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  previewAvatar: {
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  previewLabel: {
    fontSize: 12,
    color: "#64748B",
  },
  removeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  removeText: {
    fontSize: 12,
    color: "#EF4444",
    fontWeight: "500",
  },
  galleryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  galleryIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  galleryTextWrap: {
    flex: 1,
  },
  galleryTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  gallerySubtitle: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 10,
  },
  presetList: {
    gap: 10,
    paddingVertical: 4,
  },
  presetItem: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: "transparent",
    position: "relative",
  },
  presetItemSelected: {
    borderColor: "#007AFF",
  },
  presetImage: {
    width: "100%",
    height: "100%",
    borderRadius: 25,
    backgroundColor: "#E2E8F0",
  },
  checkBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#007AFF",
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  flexBtn: {
    flex: 1,
  },
});
