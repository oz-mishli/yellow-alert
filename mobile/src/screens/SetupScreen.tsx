import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  FlatList,
  TextInput,
  Modal,
} from "react-native";
import Slider from "@react-native-community/slider";
import { api } from "../lib/api";

interface Props {
  phone: string;
  pushToken: string;
  initialCity?: string;
  initialRange?: number;
  onComplete: () => void;
}

export default function SetupScreen({ phone, pushToken, initialCity, initialRange, onComplete }: Props) {
  const [cities, setCities] = useState<string[]>([]);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [cityName, setCityName] = useState(initialCity ?? "");
  const [rangeKm, setRangeKm] = useState(initialRange ?? 10);
  const [loading, setLoading] = useState(false);
  const [loadingCities, setLoadingCities] = useState(true);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.getCities().then(({ data, error }) => {
      if (error || !data) {
        Alert.alert("Error", "Could not load city list. Is the server running?");
      } else {
        setCities(data);
        setFilteredCities(data);
      }
      setLoadingCities(false);
    });
  }, []);

  function handleSearch(text: string) {
    setSearch(text);
    setFilteredCities(
      text.trim() === ""
        ? cities
        : cities.filter((c) => c.includes(text))
    );
  }

  function selectCity(name: string) {
    setCityName(name);
    setSearch("");
    setFilteredCities(cities);
    setPickerVisible(false);
  }

  async function handleSubmit() {
    if (!cityName) {
      Alert.alert("Select a city", "Please choose your city before continuing.");
      return;
    }
    setLoading(true);
    const { error } = await api.subscribe({ phone, expoPushToken: pushToken, cityName, rangeKm });
    setLoading(false);
    if (error) {
      Alert.alert("Error", error);
    } else {
      onComplete();
    }
  }

  if (loadingCities) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator color="#EAB308" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Yellow Alert</Text>
        <Text style={styles.subtitle}>Choose your location and alert range.</Text>

        <Text style={styles.label}>Your city</Text>
        <TouchableOpacity
          style={styles.picker}
          onPress={() => setPickerVisible(true)}
        >
          <Text style={cityName ? styles.pickerValue : styles.pickerPlaceholder}>
            {cityName || "Select a city…"}
          </Text>
          <Text style={styles.pickerChevron}>›</Text>
        </TouchableOpacity>

        <Text style={styles.label}>
          Alert range: <Text style={styles.rangeValue}>{rangeKm} km</Text>
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={5}
          maximumValue={100}
          step={5}
          value={rangeKm}
          onValueChange={(v) => setRangeKm(Math.round(v))}
          minimumTrackTintColor="#EAB308"
          maximumTrackTintColor="#E5E7EB"
          thumbTintColor="#EAB308"
        />
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>5 km</Text>
          <Text style={styles.sliderLabel}>100 km</Text>
        </View>

        <TouchableOpacity
          style={[styles.button, (!cityName || loading) && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={!cityName || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Start alerts</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* City picker modal */}
      <Modal visible={pickerVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select city</Text>
            <TouchableOpacity onPress={() => setPickerVisible(false)}>
              <Text style={styles.modalClose}>Cancel</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search…"
            value={search}
            onChangeText={handleSearch}
            autoFocus
          />
          <FlatList
            data={filteredCities}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.cityRow} onPress={() => selectCity(item)}>
                <Text style={styles.cityText}>{item}</Text>
              </TouchableOpacity>
            )}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      </Modal>
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
  title: { fontSize: 26, fontWeight: "700", color: "#CA8A04", marginBottom: 6 },
  subtitle: { fontSize: 14, color: "#6B7280", marginBottom: 24 },
  label: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8 },
  rangeValue: { color: "#EAB308", fontWeight: "700" },
  picker: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pickerValue: { fontSize: 16, color: "#111827" },
  pickerPlaceholder: { fontSize: 16, color: "#9CA3AF" },
  pickerChevron: { fontSize: 20, color: "#9CA3AF" },
  slider: { width: "100%", marginBottom: 4 },
  sliderLabels: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  sliderLabel: { fontSize: 12, color: "#9CA3AF" },
  button: {
    backgroundColor: "#EAB308",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  modal: { flex: 1, backgroundColor: "#fff" },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  modalClose: { fontSize: 16, color: "#EAB308", fontWeight: "600" },
  searchInput: {
    margin: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
  },
  cityRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F9FAFB",
  },
  cityText: { fontSize: 16, color: "#111827" },
});
