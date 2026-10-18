import React from "react";
import BaseModal from "./BaseModal";
import AppButton from "./AppButton";
import { View, Text, StyleSheet } from "react-native";

/**
 * Reusable Confirmation Modal Component (Refactored using BaseModal & AppButton)
 *
 * @param {boolean} visible - Status modal muncul/sembunyi
 * @param {string} title - Judul konfirmasi
 * @param {string} message - Pesan/keterangan konfirmasi
 * @param {string} iconName - Nama ikon Ionicons (opsional, default: 'alert-circle-outline')
 * @param {string} iconColor - Warna ikon (opsional, default: '#EF4444')
 * @param {string} cancelText - Teks tombol batal (opsional, default: 'Batal')
 * @param {string} confirmText - Teks tombol konfirmasi (opsional, default: 'Ya')
 * @param {string} confirmButtonColor - Warna background tombol konfirmasi (opsional, default: '#EF4444')
 * @param {function} onCancel - Callback saat tombol batal atau overlay ditekan
 * @param {function} onConfirm - Callback saat tombol konfirmasi ditekan
 */
export default function ConfirmationModal({
  visible = false,
  title = "Konfirmasi",
  message = "Apakah Anda yakin ingin melanjutkan tindakan ini?",
  iconName = "alert-circle-outline",
  iconColor = "#EF4444",
  cancelText = "Batal",
  confirmText = "Ya",
  confirmButtonColor = "#EF4444",
  onCancel,
  onConfirm,
}) {
  return (
    <BaseModal
      visible={visible}
      title={title}
      iconName={iconName}
      iconColor={iconColor}
      onClose={onCancel}
      showCloseButton={false}
      avoidKeyboard={false}
      footer={
        <View style={styles.buttonRow}>
          <AppButton
            title={cancelText}
            variant="secondary"
            onPress={onCancel}
            style={styles.flexBtn}
          />
          <AppButton
            title={confirmText}
            variant="danger"
            onPress={onConfirm}
            style={[styles.flexBtn, { backgroundColor: confirmButtonColor }]}
          />
        </View>
      }
    >
      <Text style={styles.message}>{message}</Text>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  message: {
    fontSize: 14,
    lineHeight: 20,
    color: "#64748B",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 4,
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
