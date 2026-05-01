import axios from "axios";
import { loadCredentials, saveCredentials } from "./storage.js";
import { AUTH_BASE_URL } from "../config/index.js";

export const refreshAccessToken = async () => {
  // Refresh uses the saved refresh token from ~/.insighta/credentials.json.
  const creds = await loadCredentials();

  if (!creds?.refresh_token) {
    throw new Error("No refresh token found");
  }

  const res = await axios.post(`${AUTH_BASE_URL}/refresh`, {
    refresh_token: creds.refresh_token
  });

  // Save the rotated token pair while keeping the cached user object.
  await saveCredentials({
    ...creds,
    access_token: res.data.access_token,
    refresh_token: res.data.refresh_token,
    user: res.data.user || creds.user
  });

  return res.data.access_token;
};
