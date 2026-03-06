# Yellow Alert Project Brief

## Goal
The app sends real time alerts on missle or drone attacks which are in vicinity to a selected location, but not currently in that location (i.e. Yellow alert). The attacks are reported by Israeli HomeFrontCommand (HFC) app. Users for this app are people based in Israeli, primarily during times of war. It solves the problem of being aware that an attack is taking place near by your current location, but not in your current location right now (if it would, you would have received an alert from HFC). That way, you wouldn't be surprised when you hear loud explostions nearby or you will get a heads up before the threat (and the siren) finally gets to your location (mostly relevant for drone attacks that progress slowly and in unexpected trajectory). 


## Tech Stack
- **Language:** e.g. TypeScript
- **Framework:** e.g. Next.js 14
- **Database:** e.g. Supabase (Postgres)
- **Auth:** e.g. Supabase Auth
- **Styling:** e.g. Tailwind CSS
- **Deployment:** e.g. Vercel
- **Other libs:** e.g. Stripe, Resend, Zod

## Core Features (prioritized)
1. On the web page, the user logs in by sharing submitting their phone numbe (must be Israeli). There is a verification of the number using WhatsApp
2. After 1 is successful, the user is asked to add their location. The location should include dropdown of all cities and villages in Israel (similar to HFC site) + vicinity range in kilometers (default is 10). Then the form is submitted, and organge alerts are active. The user should get approriate confirmation message in the website after submission. Then, a confirmation message of the subscription should also be sent to the WhatsApp number. 
3. For now, only a single location is allowed per phone number. This is likely to be extended in the future. 
4. The backend service should monitor all alerts from HFC in realtime, and send yellow alerts via WhatsApp for each of the registered phone numbers. The logic for sending a yellow alert should be run on every new HFC alert sent of types that represent "חדירת כלי טיס עוין" or ״ירי רקטות״:
    if distance in km between user location to alert location is equal or smaller to vicinty range then send yellow alert. Otherwise, do nothing. 


## Out of Scope
This app doesn't send any alert which is not yellow
There is no app installed on the end user's device, all communication is via the user's WhatsApp app which is assumed to be installed. 

## Input / Output Examples
How alert looks like:
"Yellow Alert! Alert <Alert type> is in <location name> which is <x> Kms from your location"


## External Services / APIs
1. Get real time HFC alerts (either from HFC website in JSON format, or from a telegram channel sending RT alerts based on HFC feed)
2. Send the yellow alert to the user to their WhatsApp (everybody in Israel use it)

## Acceptance Criteria
<!-- How you'll know when it's done -->
- [ ] 
- [ ] 

## Constraints
The server will be run locally on my laptop for the alpha version 

