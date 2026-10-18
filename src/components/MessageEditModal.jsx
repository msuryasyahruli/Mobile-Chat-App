import React from "react";
import { View, Text, StyleSheet } from "react-native";
import BaseModal from "../components/BaseModal";
import AppInput from "../components/AppInput";
import AppButton from "../components/AppButton";

export default function MessageEditModal({
  visible,
  onClose,
  editText,
  setEditText,
  onSave,
}) {
  return (
    <BaseModal
      visible={visible}
      title="Edit Pesan"
      iconName="pencil"
      iconColor="#007AFF"
      onClose={onClose}
      footer={
        <View style={styles.buttonRow}>
          <AppButton
            title="Batal"
            variant="secondary"
            onPress={onClose}
            style={styles.flexBtn}
          />
          <AppButton
            title="Simpan"
            variant="primary"
            onPress={onSave}
            style={styles.flexBtn}
          />
        </View>
      }
    >
      <AppInput
        placeholder="Ketik pesan..."
        value={editText}
        onChangeText={setEditText}
        multiline
        autoFocus
        inputContainerStyle={styles.textInputBox}
        style={styles.textInput}
      />
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  textInputBox: {
    minHeight: 74,
    alignItems: "flex-start",
    paddingTop: 8,
  },
  textInput: {
    textAlignVertical: "top",
    minHeight: 60,
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
