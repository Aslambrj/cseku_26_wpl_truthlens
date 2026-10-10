# TruthLens Mobile

Separate Expo Android client for the existing TruthLens backend. The web app and
backend remain in their existing directories and are not replaced by this client.

## Run with Expo Go

1. Install Node.js and Expo Go on the Android phone.
2. From this directory, copy `.env.example` to `.env`.
3. Set `EXPO_PUBLIC_API_URL` to the PC's LAN IPv4 address, for example
   `http://192.168.1.10:5000/api`. Do not use `localhost` from the phone.
4. Start the existing backend from `backend/` and confirm it is reachable at
   `http://<PC-LAN-IP>:5000/api/health`.
5. Connect the phone and PC to the same Wi-Fi network, then run:

   ```sh
   npm install
   npx expo start
   ```

6. Scan the QR code with Expo Go. If the Wi-Fi network blocks device discovery,
   try `npx expo start --tunnel`.

The API URL is public client configuration, not a secret. Never put backend
credentials, model-provider keys, or the JWT signing secret in this app.
Plain HTTP is only for local development; use HTTPS for a deployed backend.

## Implemented client features

- Signup, login, logout, and persisted JWT session using Expo SecureStore.
- Home dashboard and Home / History / Profile bottom tabs.
- Text, image, and video analysis using the existing backend endpoints.
- Image gallery and camera selection; video document selection and upload progress.
- Server-backed history filtering and a mobile pricing-plan presentation.

Text analysis sends JSON to `/api/analyses/text`. Image analysis sends the
base64 data URI expected by `/api/analyses/image`. Video analysis streams the
selected local file as raw `application/octet-stream` bytes to
`/api/analyses/video`, including the required `X-File-Name` header.

## Validation

```sh
npm run typecheck
npx expo-doctor
```

Device testing still requires a physical Android phone and a running backend.
