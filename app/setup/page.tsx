"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Status = "loading" | "setup" | "confirmed";

export default function SetupPage() {
  const router = useRouter();
  const [phone, setPhone] = useState<string | null>(null);
  const [cities, setCities] = useState<string[]>([]);
  const [cityName, setCityName] = useState("");
  const [rangeKm, setRangeKm] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<Status>("loading");
  const [currentSub, setCurrentSub] = useState<{ cityName: string; rangeKm: number; active: boolean } | null>(null);

  useEffect(() => {
    const p = localStorage.getItem("ya_phone");
    if (!p) { router.push("/"); return; }
    setPhone(p);

    Promise.all([
      fetch("/api/cities").then((r) => r.json()),
      fetch(`/api/status?phone=${encodeURIComponent(p)}`).then((r) => r.json()),
    ]).then(([cityList, sub]) => {
      setCities(cityList);
      if (sub.cityName) {
        setCurrentSub({ cityName: sub.cityName, rangeKm: sub.rangeKm, active: sub.active });
        setCityName(sub.cityName);
        setRangeKm(sub.rangeKm);
      }
      setStatus("setup");
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone || !cityName) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, cityName, rangeKm }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to save subscription");
      } else {
        setCurrentSub({ cityName, rangeKm, active: true });
        setStatus("confirmed");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-yellow-50 flex items-center justify-center">
        <p className="text-gray-500">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-yellow-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-yellow-600 mb-1">Yellow Alert</h1>

        {currentSub && status !== "confirmed" && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${currentSub.active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
            {currentSub.active
              ? `Active: ${currentSub.cityName}, ${currentSub.rangeKm} km range`
              : `Paused: ${currentSub.cityName} — reply START on WhatsApp to resume`}
          </div>
        )}

        {status === "confirmed" && currentSub ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700 font-semibold mb-1">You're subscribed!</p>
              <p className="text-sm text-green-600">
                Location: <strong>{currentSub.cityName}</strong>
                <br />
                Range: <strong>{currentSub.rangeKm} km</strong>
              </p>
              <p className="text-xs text-green-500 mt-2">
                A confirmation was sent to your WhatsApp. Reply STOP to pause alerts.
              </p>
            </div>
            <button
              onClick={() => setStatus("setup")}
              className="w-full text-sm text-yellow-600 hover:text-yellow-700 underline"
            >
              Update location or range
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-gray-500 mb-2">
              Choose your location and how far away to watch for alerts.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your city
              </label>
              <select
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
              >
                <option value="">Select a city…</option>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alert range: <strong>{rangeKm} km</strong>
              </label>
              <input
                type="range"
                min={5}
                max={100}
                step={5}
                value={rangeKm}
                onChange={(e) => setRangeKm(Number(e.target.value))}
                className="w-full accent-yellow-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>5 km</span>
                <span>100 km</span>
              </div>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading || !cityName}
              className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition"
            >
              {loading ? "Saving…" : "Start alerts"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
