import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * Reusable BaseModal Component
 *
 * @param {boolean} visible - Status tampil modal
 * @param {string} title - Judul modal
 * @param {string} iconName - Ikon header modal (opsional)
 * @param {string} iconColor - Warna ikon (default: '#007AFF')
 * @param {function} onClose - Callback saat modal ditutup
 * @param {boolean} showCloseButton - Tampilkan tombol silang di kanan atas
 * @param {boolean} avoidKeyboard - Gunakan KeyboardAvoidingView
 * @param {React.ReactNode} children - Konten utama modal
 * @param {React.ReactNode} footer - Bagian tombol atau footer modal
 * @param {object} cardStyle - Custom style untuk card modal
 */
export default function BaseModal({
  visible = false,
  title,
  iconName,
  iconColor = "#007AFF",
  onClose,
  showCloseButton = true,
  avoidKeyboard = true,
  children,
  footer,
  cardStyle,
}) {
  const content = (
    <Pressable style={styles.overlay} onPress={onClose}>
      <Pressable
        style={[styles.modalCard, cardStyle]}
        onPress={(e) => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <View style={styles.header}>
            <View style={styles.titleRow}>
              {iconName && (
                <View
                  style={[
                    styles.iconBadge,
                    { backgroundColor: `${iconColor}15` },
                  ]}
                >
                  <Ionicons name={iconName} size={20} color={iconColor} />
                </View>
              )}
              {title && <Text style={styles.title}>{title}</Text>}
            </View>

            {showCloseButton && (
              <TouchableOpacity
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.closeButton}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={22} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.body}>{children}</View>

        {footer && <View style={styles.footer}>{footer}</View>}
      </Pressable>
    </Pressable>
  );

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      {avoidKeyboard ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    flexShrink: 1,
  },
  closeButton: {
    padding: 4,
    marginLeft: 8,
  },
  body: {
    width: "100%",
  },
  footer: {
    marginTop: 20,
    width: "100%",
  },
});
