import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import BaseModal from "../components/BaseModal";

export default function MessageActionModal({
  visible,
  onClose,
  message,
  onEditPress,
  onDeletePress,
}) {
  return (
    <BaseModal
      visible={visible}
      title="Opsi Pesan"
      iconName="chatbubble-ellipses-outline"
      iconColor="#007AFF"
      onClose={onClose}
      avoidKeyboard={false}
    >
      {message?.text ? (
        <Text style={styles.snippet} numberOfLines={2}>
          "{message.text}"
        </Text>
      ) : null}

      <TouchableOpacity
        style={styles.actionOption}
        activeOpacity={0.7}
        onPress={onEditPress}
      >
        <View style={[styles.actionIconBadge, { backgroundColor: "#EBF5FF" }]}>
          <Ionicons name="pencil" size={18} color="#007AFF" />
        </View>
        <Text style={styles.actionOptionText}>Edit Pesan</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.actionOption}
        activeOpacity={0.7}
        onPress={onDeletePress}
      >
        <View style={[styles.actionIconBadge, { backgroundColor: "#FEE2E2" }]}>
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </View>
        <Text style={[styles.actionOptionText, { color: "#EF4444" }]}>
          Hapus Pesan
        </Text>
      </TouchableOpacity>
    </BaseModal>
  );
}

const styles = StyleSheet.create({
  snippet: {
    fontSize: 13,
    color: "#64748B",
    fontStyle: "italic",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  actionOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 12,
  },
  actionIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  actionOptionText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
  },
});
