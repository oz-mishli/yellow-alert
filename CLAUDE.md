# Yellow Alert Project Brief

## Goal
The app sends real time alerts on missile or drone attacks which are in vicinity to a selected location, but not currently in that location (i.e. Yellow alert). The attacks are reported by Israeli HomeFrontCommand (HFC) app. Users for this app are people based in Israel, primarily during times of war. It solves the problem of being aware that an attack is taking place nearby your current location, but not in your current location right now (if it would, you would have received an alert from HFC). That way, you wouldn't be surprised when you hear loud explosions nearby, or you will get a heads up before the threat (and the siren) finally gets to your location (mostly relevant for drone attacks that progress slowly and in unexpected trajectory).


## Tech Stack
- **Language:** TypeScript
- **Framework:** Next.js 14 (App Router) — full-stack, web UI + API routes
- **Database:** SQLite via Prisma — zero-ops for local alpha, easy to migrate to Postgres later
- **Auth:** Custom — WhatsApp OTP via Baileys (no third-party auth service)
- **WhatsApp:** Baileys (open-source WhatsApp Web client) — free, alpha only; migrate to Twilio for production
- **Styling:** Tailwind CSS
- **Deployment:** Local laptop for alpha; cloud server after alpha
- **Other libs:** Zod (validation), Haversine (distance calculation)

## Architecture
- **Next.js app** serves the web UI and API routes
- **Background worker** (Node.js process alongside Next.js) polls the HFC API every 5 seconds, detects new alerts, and dispatches WhatsApp messages via Baileys
- **Baileys** connects to a dedicated WhatsApp number via QR code scan at startup; handles both outbound alerts and inbound STOP/START commands
- **SQLite DB** stores subscribers (phone, location, range, status) and a sent-alerts log for deduplication

## Core Features (prioritized)
1. **Phone verification:** User enters their Israeli phone number on the web page. An OTP is sent to them via WhatsApp (using Baileys). User types the OTP into the web form to verify.
2. **Location setup:** After verification, user selects their city from a dropdown of all HFC cities/zones + sets a vicinity range in km (default: 10 km). On submission:
   - Web page shows confirmation message
   - WhatsApp confirmation sent to the user's number
3. **Single location per phone number** (to be extended in future). Updating location does not require re-verification.
4. **Alert monitoring:** Background worker polls `https://www.oref.org.il/WarningMessages/alert/alerts.json` every 5 seconds. On each new alert:
   - Skip if alert data contains "הסתיים" or "מבזק" (substring match) — all other alert types are considered relevant
   - For each active subscriber: compute Haversine distance between user's city centroid and alert city centroid. If distance ≤ vicinity range → send yellow alert via WhatsApp.
   - No batching or rate limiting — each HFC alert triggers a separate WhatsApp message (urgency takes priority)
5. **Deduplication:** Sent alerts are persisted to SQLite. On restart, already-sent alerts are not re-sent.
6. **STOP / START:** If a subscriber replies "STOP" to the WhatsApp number, their subscription is paused (not deleted). Reply "START" resumes it. Web UI reflects current status (active/paused).

## Alert Message Format
```
Yellow Alert! <Alert type> in <location name>, approximately <X> km from your location.
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
- App installed on end-user device — all communication via WhatsApp
- Polygon/edge-based distance (centroid-to-centroid is used)
- Per-user alert history visible in web UI (deduplication log is operational only)

## Input / Output Examples
Subscription confirmation WhatsApp message:
> "You are now subscribed to Yellow Alert for [City Name] with a range of [X] km. Reply STOP to pause alerts."

Alert message:
> "Yellow Alert! [alert type] in [location name], approximately [X] km from your location."

## External Services / APIs
1. HFC alerts: `oref.org.il` REST API (no auth required, public)
2. WhatsApp: Baileys (open-source, connects via QR scan to a dedicated WhatsApp number)

## Acceptance Criteria
- [ ] User can verify Israeli phone number via WhatsApp OTP
- [ ] User can select city and range; confirmation sent on web + WhatsApp
- [ ] Background worker detects new HFC alerts within 10 seconds
- [ ] Yellow alerts sent only for matching alert types and in-range subscribers
- [ ] No duplicate alerts sent after server restart
- [ ] STOP pauses subscription; START resumes it; web UI reflects status

## Constraints
- Server runs locally on laptop for alpha (assumed always-on during active periods)
- Baileys requires a dedicated phone number (not used for personal WhatsApp)
- Baileys violates WhatsApp ToS — acceptable for alpha, must migrate to official API (e.g. Twilio) for production
