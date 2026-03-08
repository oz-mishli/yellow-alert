import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { api } from "../lib/api";

interface Props {
  phone: string;
  cityName: string;
  rangeKm: number;
  active: boolean;
  onEdit: () => void;
  onToggleActive: (active: boolean) => void;
}

export default function HomeScreen({ phone, cityName, rangeKm, active, onEdit, onToggleActive }: Props) {
  const [toggling, setToggling] = useState(false);

  const handleToggle = useCallback(async (value: boolean) => {
    setToggling(true);
    const { error } = await api.setActive(phone, value);
    setToggling(false);
    if (error) {
      Alert.alert("Error", error);
    } else {
      onToggleActive(value);
    }
  }, [phone, onToggleActive]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Yellow Alert</Text>

        <View style={[styles.statusBadge, active ? styles.statusActive : styles.statusPaused]}>
          <Text style={[styles.statusText, active ? styles.statusTextActive : styles.statusTextPaused]}>
            {active ? "Active" : "Paused"}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Location</Text>
          <Text style={styles.infoValue}>{cityName}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Alert range</Text>
          <Text style={styles.infoValue}>{rangeKm} km</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Phone</Text>
          <Text style={styles.infoValue}>
            {"0" + phone.slice(3, 5) + "-" + phone.slice(5, 8) + "-" + phone.slice(8)}
          </Text>
        </View>

        <View style={styles.toggleRow}>
          <View>
            <Text style={styles.toggleLabel}>Receive alerts</Text>
            <Text style={styles.toggleSub}>Toggle to pause or resume notifications</Text>
          </View>
          {toggling ? (
            <ActivityIndicator color="#EAB308" />
          ) : (
            <Switch
              value={active}
              onValueChange={handleToggle}
              trackColor={{ false: "#E5E7EB", true: "#FDE68A" }}
              thumbColor={active ? "#EAB308" : "#9CA3AF"}
            />
          )}
        </View>

        <TouchableOpacity style={styles.editButton} onPress={onEdit}>
          <Text style={styles.editButtonText}>Update location or range</Text>
        </TouchableOpacity>
      </View>

      {active && (
        <Text style={styles.hint}>
          You will be notified when an attack occurs within {rangeKm} km of {cityName}.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FEFCE8",
    padding: 24,
    justifyContent: "center",
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
  title: { fontSize: 26, fontWeight: "700", color: "#CA8A04", marginBottom: 16 },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 20,
  },
  statusActive: { backgroundColor: "#DCFCE7" },
  statusPaused: { backgroundColor: "#F3F4F6" },
  statusText: { fontSize: 13, fontWeight: "600" },
  statusTextActive: { color: "#16A34A" },
  statusTextPaused: { color: "#6B7280" },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  infoLabel: { fontSize: 14, color: "#6B7280" },
  infoValue: { fontSize: 14, fontWeight: "600", color: "#111827" },
  divider: { height: 1, backgroundColor: "#F3F4F6" },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    marginBottom: 20,
  },
  toggleLabel: { fontSize: 15, fontWeight: "600", color: "#111827" },
  toggleSub: { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
  editButton: {
    paddingVertical: 10,
    alignItems: "center",
  },
  editButtonText: { fontSize: 14, color: "#EAB308", fontWeight: "600" },
  hint: {
    marginTop: 16,
    fontSize: 13,
    color: "#92400E",
    textAlign: "center",
    lineHeight: 18,
  },
});
