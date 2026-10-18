import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * Reusable AppInput Component
 *
 * @param {string} label - Label di atas input (opsional)
 * @param {string} error - Pesan error di bawah input (opsional)
 * @param {string} leftIcon - Nama ikon Ionicons di sebelah kiri (opsional)
 * @param {string} rightIcon - Nama ikon Ionicons di sebelah kanan (opsional)
 * @param {function} onRightIconPress - Handler saat rightIcon ditekan (opsional)
 * @param {boolean} isPassword - Toggle visibility password (opsional)
 * @param {object} containerStyle - Style pembungkus terluar
 * @param {object} inputContainerStyle - Style box input
 */
export default function AppInput({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  isPassword = false,
  containerStyle,
  inputContainerStyle,
  style,
  placeholderTextColor = "#94A3B8",
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          !!error && styles.inputError,
          inputContainerStyle,
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={isFocused ? "#007AFF" : "#94A3B8"}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={placeholderTextColor}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword && !showPassword}
          {...props}
        />

        {isPassword ? (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.rightIconTouch}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#94A3B8"
            />
          </TouchableOpacity>
        ) : rightIcon ? (
          <TouchableOpacity
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            style={styles.rightIconTouch}
            activeOpacity={0.7}
          >
            <Ionicons name={rightIcon} size={20} color="#94A3B8" />
          </TouchableOpacity>
        ) : null}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
    width: "100%",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    minHeight: 46,
  },
  inputFocused: {
    borderColor: "#007AFF",
    backgroundColor: "#FFFFFF",
  },
  inputError: {
    borderColor: "#EF4444",
  },
  leftIcon: {
    marginRight: 10,
  },
  rightIconTouch: {
    padding: 4,
    marginLeft: 6,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
    paddingVertical: 10,
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
  },
});
