// src/api/config.ts
// On a physical phone via Expo Go, localhost = the phone, NOT your computer.
// Use your machine's LAN IP so the phone can reach the backend over WiFi.
// Prefer configuring `EXPO_PUBLIC_API_URL` in the environment (app config).
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.2.26.44:4000';