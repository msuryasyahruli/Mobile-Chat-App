import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * Reusable AppButton Component
 *
 * @param {string} title - Teks tombol
 * @param {function} onPress - Handler saat ditekan
 * @param {boolean} loading - Status loading spinner
 * @param {boolean} disabled - Disable klik
 * @param {'primary' | 'secondary' | 'danger' | 'outline' | 'ghost'} variant - Varian gaya tombol
 * @param {'sm' | 'md' | 'lg'} size - Ukuran tombol
 * @param {string} icon - Nama ikon Ionicons (opsional)
 * @param {'left' | 'right'} iconPosition - Posisi ikon (default: 'left')
 * @param {object} style - Custom container style
 * @param {object} textStyle - Custom text style
 */
export default function AppButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  size = "md",
  icon,
  iconPosition = "left",
  style,
  textStyle,
  children,
}) {
  const isDisabled = disabled || loading;

  const getVariantStyle = () => {
    switch (variant) {
      case "secondary":
        return styles.secondaryButton;
      case "danger":
        return styles.dangerButton;
      case "outline":
        return styles.outlineButton;
      case "ghost":
        return styles.ghostButton;
      case "primary":
      default:
        return styles.primaryButton;
    }
  };

  const getVariantTextStyle = () => {
    switch (variant) {
      case "secondary":
        return styles.secondaryText;
      case "danger":
        return styles.dangerText;
      case "outline":
        return styles.outlineText;
      case "ghost":
        return styles.ghostText;
      case "primary":
      default:
        return styles.primaryText;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case "sm":
        return styles.sizeSm;
      case "lg":
        return styles.sizeLg;
      case "md":
      default:
        return styles.sizeMd;
    }
  };

  const getSizeTextStyle = () => {
    switch (size) {
      case "sm":
        return styles.textSm;
      case "lg":
        return styles.textLg;
      case "md":
      default:
        return styles.textMd;
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case "secondary":
        return "#475569";
      case "danger":
        return "#FFFFFF";
      case "outline":
      case "ghost":
        return "#007AFF";
      case "primary":
      default:
        return "#FFFFFF";
    }
  };

  const iconElement = icon && (
    <Ionicons
      name={icon}
      size={size === "sm" ? 16 : size === "lg" ? 22 : 18}
      color={getIconColor()}
      style={iconPosition === "right" ? styles.iconRight : styles.iconLeft}
    />
  );

  return (
    <TouchableOpacity
      style={[
        styles.baseButton,
        getSizeStyle(),
        getVariantStyle(),
        isDisabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === "secondary" || variant === "outline" || variant === "ghost"
              ? "#007AFF"
              : "#FFFFFF"
          }
        />
      ) : (
        <View style={styles.contentRow}>
          {iconPosition === "left" && iconElement}
          {title ? (
            <Text
              style={[
                styles.baseText,
                getSizeTextStyle(),
                getVariantTextStyle(),
                isDisabled && styles.disabledText,
                textStyle,
              ]}
            >
              {title}
            </Text>
          ) : (
            children
          )}
          {iconPosition === "right" && iconElement}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  baseButton: {
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconLeft: {
    marginRight: 6,
  },
  iconRight: {
    marginLeft: 6,
  },
  // Sizes
  sizeSm: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  sizeMd: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  sizeLg: {
    height: 50,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  // Text sizes
  textSm: {
    fontSize: 13,
  },
  textMd: {
    fontSize: 15,
  },
  textLg: {
    fontSize: 16,
  },
  // Variants
  primaryButton: {
    backgroundColor: "#007AFF",
  },
  primaryText: {
    color: "#FFFFFF",
  },
  secondaryButton: {
    backgroundColor: "#F1F5F9",
  },
  secondaryText: {
    color: "#475569",
  },
  dangerButton: {
    backgroundColor: "#EF4444",
  },
  dangerText: {
    color: "#FFFFFF",
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#007AFF",
  },
  outlineText: {
    color: "#007AFF",
  },
  ghostButton: {
    backgroundColor: "transparent",
  },
  ghostText: {
    color: "#007AFF",
  },
  baseText: {
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.55,
  },
  disabledText: {
    color: "#94A3B8",
  },
});
