import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./src/lib/api";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import SetupScreen from "./src/screens/SetupScreen";
import HomeScreen from "./src/screens/HomeScreen";

type Screen = "loading" | "onboarding" | "setup" | "home";

interface Sub {
  phone: string;
  pushToken: string;
  cityName: string;
  rangeKm: number;
  active: boolean;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("loading");
  const [sub, setSub] = useState<Sub | null>(null);

  useEffect(() => {
    (async () => {
      const phone = await AsyncStorage.getItem("ya_phone");
      const pushToken = await AsyncStorage.getItem("ya_push_token");
      if (!phone || !pushToken) {
        setScreen("onboarding");
        return;
      }

      const { data } = await api.getStatus(phone);
      if (data?.registered && data.cityName) {
        setSub({
          phone,
          pushToken,
          cityName: data.cityName,
          rangeKm: data.rangeKm ?? 10,
          active: data.active ?? true,
        });
        setScreen("home");
      } else {
        setSub({ phone, pushToken, cityName: "", rangeKm: 10, active: true });
        setScreen("setup");
      }
    })();
  }, []);

  function handleOnboardingComplete(phone: string, pushToken: string) {
    setSub({ phone, pushToken, cityName: "", rangeKm: 10, active: true });
    setScreen("setup");
  }

  function handleSetupComplete() {
    // Refresh from server so we have the latest values
    if (!sub) return;
    api.getStatus(sub.phone).then(({ data }) => {
      if (data?.registered && data.cityName) {
        setSub((prev) =>
          prev
            ? { ...prev, cityName: data.cityName!, rangeKm: data.rangeKm ?? 10, active: data.active ?? true }
            : prev
        );
      }
      setScreen("home");
    });
  }

  if (screen === "loading" || !sub) return null;

  if (screen === "onboarding") {
    return (
      <>
        <StatusBar style="dark" />
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      </>
    );
  }

  if (screen === "setup") {
    return (
      <>
        <StatusBar style="dark" />
        <SetupScreen
          phone={sub.phone}
          pushToken={sub.pushToken}
          initialCity={sub.cityName}
          initialRange={sub.rangeKm}
          onComplete={handleSetupComplete}
        />
      </>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <HomeScreen
        phone={sub.phone}
        cityName={sub.cityName}
        rangeKm={sub.rangeKm}
        active={sub.active}
        onEdit={() => setScreen("setup")}
        onToggleActive={(active) => setSub((prev) => (prev ? { ...prev, active } : prev))}
      />
    </>
  );
}
