import Constants from "expo-constants";

// Update this to your laptop's local IP when testing on a physical device.
// e.g. "http://192.168.1.42:3000"
const BASE_URL: string =
  (Constants.expoConfig?.extra?.apiBaseUrl as string | undefined) ?? "http://localhost:3000";

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<{ data: T | null; error: string | null }> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
    const json = await res.json();
    if (!res.ok) return { data: null, error: json.error ?? "Something went wrong" };
    return { data: json as T, error: null };
  } catch (e) {
    return { data: null, error: "Cannot reach server. Check your network or server URL." };
  }
}

export const api = {
  getCities(): Promise<{ data: string[] | null; error: string | null }> {
    return request<string[]>("/api/cities");
  },

  getStatus(phone: string) {
    return request<{
      registered: boolean;
      cityName?: string;
      rangeKm?: number;
      active?: boolean;
    }>(`/api/status?phone=${encodeURIComponent(phone)}`);
  },

  subscribe(payload: {
    phone: string;
    expoPushToken: string;
    cityName: string;
    rangeKm: number;
  }) {
    return request<{ ok: boolean }>("/api/subscribe", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  setActive(phone: string, active: boolean) {
    return request<{ ok: boolean; active: boolean }>("/api/status", {
      method: "PATCH",
      body: JSON.stringify({ phone, active }),
    });
  },
};
