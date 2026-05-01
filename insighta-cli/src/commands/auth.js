import open from "open";
import http from "http";
import axios from "axios";

import { AUTH_API_URL, AUTH_URL, CONFIG_FILE } from "../config/index.js";
import { generateCodeVerifier, generateCodeChallenge, generateState } from "../utils/pkce.js";
import { saveCredentials, loadCredentials, clearCredentials } from "../services/storage.js";

const CALLBACK_PORT = 5178;

// Small HTML response helper for the temporary browser callback page.
const sendHtml = (res, statusCode, message) => {
  res.writeHead(statusCode, { "Content-Type": "text/html" });
  res.end(`<p>${message}</p>`);
};

export default (program) => {
  program.command("login").action(async () => {
    // PKCE values make the OAuth flow safe for CLI/browser login.
    const code_verifier = generateCodeVerifier();
    const code_challenge = await generateCodeChallenge(code_verifier);
    const state = generateState();
    const redirectUri = `http://localhost:${CALLBACK_PORT}/callback`;

    // These query params are sent to my backend, which then redirects to GitHub.
    const params = new URLSearchParams({
      state,
      code_challenge,
      code_verifier,
      redirect_uri: redirectUri
    });

    const url = `${AUTH_URL}?${params.toString()}`;

    // The CLI starts a temporary local server to receive the OAuth callback.
    const server = http.createServer(async (req, res) => {
      if (!req.url?.startsWith("/callback")) {
        sendHtml(res, 404, "Not found");
        return;
      }

      const parsed = new URL(req.url, redirectUri);
      const code = parsed.searchParams.get("code");
      const returnedState = parsed.searchParams.get("state");
      const error = parsed.searchParams.get("error");

      // If GitHub/backend sends an OAuth error, stop the login.
      if (error) {
        sendHtml(res, 400, "Login failed. You can close this tab.");
        server.close();
        console.error(`Login failed: ${error}`);
        return;
      }

      // The code is what the CLI exchanges with my backend for app tokens.
      if (!code) {
        sendHtml(res, 400, "Missing authorization code. You can close this tab.");
        server.close();
        console.error("Login failed: missing authorization code");
        return;
      }

      // State must match the value generated before opening GitHub.
      if (returnedState !== state) {
        sendHtml(res, 400, "Invalid state. You can close this tab.");
        server.close();
        console.error("Login failed: state mismatch");
        return;
      }

      try {
        console.log("Completing login...");

        // Final CLI login step: exchange GitHub code + verifier for my app tokens.
        const response = await axios.post(`${AUTH_API_URL}/exchange`, {
          code,
          code_verifier
        });

        // Save tokens to ~/.insighta/credentials.json for future CLI requests.
        await saveCredentials({
          access_token: response.data.access_token,
          refresh_token: response.data.refresh_token,
          user: response.data.user
        });

        sendHtml(res, 200, "Login complete. You can close this tab.");
        console.log(`Logged in as @${response.data.user.username}`);
        console.log(`Credentials saved to ${CONFIG_FILE}`);
      } catch (err) {
        sendHtml(res, 500, "Login failed. You can close this tab.");
        console.error("Login failed:", err.response?.data || err.message);
      } finally {
        server.close();
      }
    });

    // If the callback port is busy, the CLI cannot receive GitHub's response.
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`Port ${CALLBACK_PORT} is already in use. Stop the other process and retry.`);
        return;
      }

      console.error("Callback server error:", err.message);
    });

    // Start listening before opening the browser to avoid missing the callback.
    server.listen(CALLBACK_PORT, async () => {
      console.log(`Listening for callback on ${redirectUri}`);
      console.log("Opening GitHub login in your browser...");
      await open(url);
    });
  });

  program.command("whoami").action(async () => {
    try {
      // whoami reads the saved credentials and prints the cached user info.
      const creds = await loadCredentials();
      if (!creds?.access_token) {
        console.log("Not logged in. Run: insighta login");
        return;
      }

      console.log(`Logged in as @${creds.user?.username || "unknown"}`);
      console.log(`Role: ${creds.user?.role || "unknown"}`);
      console.log(`Email: ${creds.user?.email || "unknown"}`);
    } catch (err) {
      console.error("Error:", err.message);
    }
  });

  program.command("logout").action(async () => {
    try {
      // Send tokens to the backend so the refresh token can be invalidated.
      const creds = await loadCredentials();
      if (creds?.refresh_token || creds?.access_token) {
        await axios.post(`${AUTH_API_URL}/logout`, {
          refresh_token: creds.refresh_token,
          access_token: creds.access_token
        });
      }
    } catch (err) {
      // Local credentials should still be cleared if the remote token is already invalid.
    } finally {
      await clearCredentials();
      console.log("Logged out successfully");
    }
  });
};
