import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BaseModal from "../components/BaseModal";
import AppInput from "../components/AppInput";
import AppButton from "../components/AppButton";

export default function ProfileEditModal({
  visible,
  onClose,
  name,
  setName,
  bio,
  setBio,
  onSave,
  isSaving,
}) {
  return (
    <BaseModal
      visible={visible}
      title="Edit Profil"
      iconName="person-circle"
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
            title="Simpan"
            variant="primary"
            onPress={onSave}
            loading={isSaving}
            disabled={isSaving}
            style={styles.flexBtn}
          />
        </View>
      }
    >
      <AppInput
        label="Nama Lengkap"
        placeholder="Masukkan nama lengkap"
        value={name}
        onChangeText={setName}
        leftIcon="person-outline"
        editable={!isSaving}
      />

      <AppInput
        label="Bio / Status"
        placeholder="Tuliskan bio singkat Anda"
        value={bio}
        onChangeText={setBio}
        leftIcon="chatbox-ellipses-outline"
        multiline
        numberOfLines={3}
        maxLength={120}
        editable={!isSaving}
        inputContainerStyle={styles.bioContainer}
        style={styles.bioInput}
      />
      <Text style={styles.charCount}>{bio.length}/120 karakter</Text>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  bioContainer: {
    minHeight: 80,
    alignItems: "flex-start",
    paddingTop: 8,
  },
  bioInput: {
    textAlignVertical: "top",
    minHeight: 64,
  },
  charCount: {
    fontSize: 11,
    color: "#94A3B8",
    textAlign: "right",
    marginTop: -10,
    marginBottom: 6,
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
