import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

/**
 * Reusable Avatar Component
 *
 * @param {string} name - Nama pengguna untuk generate inisial
 * @param {string} photoURL - URL atau data URI foto avatar (opsional)
 * @param {number} size - Ukuran diameter avatar (default: 44)
 * @param {string} backgroundColor - Background avatar (default: '#007AFF')
 * @param {boolean} showOnlineBadge - Tampilkan indikator status
 * @param {string} badgeColor - Warna badge (default: '#10B981')
 * @param {object} style - Custom container style
 */
export default function Avatar({
  name = "?",
  photoURL,
  size = 44,
  backgroundColor = "#007AFF",
  showOnlineBadge = false,
  badgeColor = "#10B981",
  style,
}) {
  const initial = (name || "?")[0].toUpperCase();
  const fontSize = Math.round(size * 0.4);
  const badgeSize = Math.max(10, Math.round(size * 0.28));

  return (
    <View style={[styles.wrapper, style]}>
      {photoURL ? (
        <Image
          source={{ uri: photoURL }}
          style={[
            styles.avatarImage,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
        />
      ) : (
        <View
          style={[
            styles.avatar,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor,
            },
          ]}
        >
          <Text style={[styles.initial, { fontSize }]}>{initial}</Text>
        </View>
      )}

      {showOnlineBadge && (
        <View
          style={[
            styles.badge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              backgroundColor: badgeColor,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
  },
  avatar: {
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    backgroundColor: "#E2E8F0",
  },
  initial: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
});
