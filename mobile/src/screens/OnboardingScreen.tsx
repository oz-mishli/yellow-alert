import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerForPushNotifications } from "../lib/notifications";

interface Props {
  onComplete: (phone: string, pushToken: string) => void;
}

function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("972") && digits.length === 12) return digits;
  if (digits.startsWith("0") && digits.length === 10) return "972" + digits.slice(1);
  return null;
}

export default function OnboardingScreen({ onComplete }: Props) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleContinue() {
    const normalized = normalizePhone(phone);
    if (!normalized) {
      Alert.alert("Invalid number", "Please enter a valid Israeli mobile number (e.g. 052-123-4567).");
      return;
    }

    setLoading(true);
    try {
      const token = await registerForPushNotifications();
      if (!token) {
        Alert.alert(
          "Notifications required",
          "Please enable push notifications in Settings to receive Yellow Alerts."
        );
        return;
      }

      await AsyncStorage.setItem("ya_phone", normalized);
      await AsyncStorage.setItem("ya_push_token", token);

      onComplete(normalized, token);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Yellow Alert</Text>
        <Text style={styles.subtitle}>
          Get notified when missile or drone attacks occur near your location — before they reach you.
        </Text>

        <Text style={styles.label}>Your Israeli mobile number</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="052-123-4567"
          keyboardType="phone-pad"
          autoComplete="tel"
          returnKeyType="done"
          onSubmitEditing={handleContinue}
        />

        <TouchableOpacity
          style={[styles.button, (!phone || loading) && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={!phone || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Continue</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.note}>
          Your number is used only to identify your subscription. It is not verified or shared.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FEFCE8",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#CA8A04",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 24,
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#EAB308",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  note: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 17,
  },
});
