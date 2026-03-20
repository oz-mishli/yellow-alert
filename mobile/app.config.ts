import { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Yellow Alert",
  slug: "yellow-alert",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: "com.yellowalert.app",
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        "Used to determine your vicinity range for alerts.",
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/android-icon-foreground.png",
      backgroundImage: "./assets/android-icon-background.png",
      backgroundColor: "#ffffff",
    },
    package: "com.yellowalert.app",
  },
  plugins: [
    [
      "expo-notifications",
      {
        color: "#EAB308",
        defaultChannel: "default",
      },
    ],
  ],
  extra: {
    apiBaseUrl: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000",
  },
};

export default config;
