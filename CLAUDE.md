# Yellow Alert Project Brief

## Goal
The app sends real time alerts on missile or drone attacks which are in vicinity to a selected location, but not currently in that location (i.e. Yellow alert). The attacks are reported by Israeli HomeFrontCommand (HFC) app. Users for this app are people based in Israel, primarily during times of war. It solves the problem of being aware that an attack is taking place nearby your current location, but not in your current location right now (if it would, you would have received an alert from HFC). That way, you wouldn't be surprised when you hear loud explosions nearby, or you will get a heads up before the threat (and the siren) finally gets to your location (mostly relevant for drone attacks that progress slowly and in unexpected trajectory).


## Tech Stack

### Mobile App
- **Framework:** Expo (React Native) — iOS first, Android-ready from day one
- **Language:** TypeScript
- **Push notifications:** Expo Notifications → APNs (iOS) / FCM (Android) — free
- **Distribution (alpha):** TestFlight

### Backend
- **Framework:** Next.js 14 (App Router) — API routes only (no web UI for end users)
- **Language:** TypeScript
- **Database:** SQLite via Prisma — zero-ops for local alpha, easy to migrate to Postgres later
- **Auth:** None for alpha — phone number is entered by the user, unverified. Acceptable for a small trusted group.
- **Deployment:** Local laptop for alpha; cloud server after alpha
- **Other libs:** Zod (validation), Haversine (distance calculation)

## Architecture
- **Expo mobile app** handles all end-user interaction: phone entry, city/range selection, push notification registration, pause/resume
- **Next.js backend** exposes REST API consumed by the mobile app, and runs the HFC background worker in the same process
- **Background worker** (co-located with Next.js via custom server.ts) polls the HFC API every 5 seconds, detects new alerts, and dispatches push notifications via Expo Push API
- **SQLite DB** stores subscribers (phone, Expo push token, location, range, status) and a sent-alerts log for deduplication

## Core Features (prioritized)
1. **Onboarding:** User opens the app and enters their Israeli phone number (unverified for alpha). App requests push notification permission and registers the device's Expo push token with the backend.
2. **Location setup:** User selects their city from a dropdown of all HFC cities/zones + sets a vicinity range in km (default: 10 km). On submission, backend stores the subscription.
3. **Single location per device/phone** (to be extended in future). Updating location does not require re-onboarding.
4. **Alert monitoring:** Background worker polls `https://www.oref.org.il/WarningMessages/alert/alerts.json` every 5 seconds. On each new alert:
   - Skip if alert data contains "הסתיים" or "מבזק" (substring match) — all other alert types are considered relevant
   - For each active subscriber: compute Haversine distance between user's city centroid and alert city centroid. If distance ≤ vicinity range → send push notification via Expo Push API.
   - No batching or rate limiting — each HFC alert triggers a separate notification (urgency takes priority)
5. **Deduplication:** Sent alerts are persisted to SQLite. On restart, already-sent alerts are not re-sent.
6. **Pause / Resume:** In-app toggle to pause or resume alerts. Backend marks subscription as active/paused accordingly.

## Push Notification Format
**Title:** `Yellow Alert`
**Body:**
```
<Alert type> in <location name>, approximately <X> km from your location.
```
- Distance is rounded to the nearest integer
- "approximately" is always included

## HFC Data Source
- **Endpoint:** `https://www.oref.org.il/WarningMessages/alert/alerts.json`
- **Polling interval:** 5 seconds
- **Alert type matching:** substring/contains (case-sensitive Hebrew)
- **Location mapping:** Static JSON mapping of HFC Hebrew city/zone names → `{lat, lng}` centroid coordinates, built from Israeli CBS open data
- **Distance method:** Haversine (straight-line) between city centroids

## Out of Scope
- Alerts that are not yellow (i.e. alert is at user's own location)
- Phone number verification for alpha
- Polygon/edge-based distance (centroid-to-centroid is used)
- Per-user alert history in the app (deduplication log is operational only)

## Input / Output Examples
Push notification on alert:
> **Title:** Yellow Alert
> **Body:** [alert type] in [location name], approximately [X] km from your location.

## External Services / APIs
1. HFC alerts: `oref.org.il` REST API (no auth required, public)
2. Push notifications: Expo Push API → APNs (iOS) / FCM (Android) — free, no dedicated number needed

## Acceptance Criteria
- [ ] User can enter phone number and select city + range in the app
- [ ] App registers for push notifications and sends Expo push token to backend
- [ ] Background worker detects new HFC alerts within 10 seconds
- [ ] Yellow alerts sent only for in-range subscribers as push notifications
- [ ] No duplicate alerts sent after server restart
- [ ] In-app pause/resume toggle works; backend reflects status

## Constraints
- Server runs locally on laptop for alpha (assumed always-on during active periods)
- Expo push notifications are free and work without a dedicated phone number
- Apple Developer account required for TestFlight distribution ($99/yr)
- For production (post-alpha): move backend to cloud server; Expo push service continues to work as-is
