import axios from "axios";
import { loadCredentials, saveCredentials } from "./storage.js";

const BASE = "http://localhost:3000/api/auth";

export const refreshAccessToken = async () => {
  const creds = await loadCredentials();

  if (!creds?.refresh_token) {
    throw new Error("No refresh token found");
  }

  const res = await axios.post(`${BASE}/refresh`, {
    refresh_token: creds.refresh_token
  });

  await saveCredentials(res.data);

  return res.data.access_token;
};