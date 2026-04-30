import open from "open";
import http from "http";
import crypto from "crypto";
import axios from "axios";

import { AUTH_URL } from "../config/index.js";
import { generateCodeVerifier, generateCodeChallenge, generateState } from "../utils/pkce.js";
import { saveCredentials, loadCredentials, clearCredentials } from "../services/storage.js";

export default (program) => {

  program.command("login").action(async () => {
    const code_verifier = generateCodeVerifier();
    const code_challenge = await generateCodeChallenge(code_verifier);
    const state = generateState();

    const port = 5178;
    const redirectUri = `http://localhost:${port}/callback`;

    const url =
      `${AUTH_URL}?state=${state}` +
      `&code_challenge=${code_challenge}` +
      `&code_verifier=${code_verifier}` +
      `&redirect_uri=${redirectUri}`;

    console.log("🌐 Opening browser...");
    await open(url);

    const server = http.createServer(async (req, res) => {
      if (req.url.startsWith("/callback")) {
        console.log("👉 Callback received");

        const parsed = new URL(req.url, `http://localhost:${port}`);
        const code = parsed.searchParams.get("code");
        const returnedState = parsed.searchParams.get("state");

        if (returnedState !== state) {
          res.end("❌ Invalid state");
          server.close();
          console.error("❌ State mismatch");
          return;
        }

        res.end("✅ Login complete. You can close this tab.");
        server.close();

        try {
          console.log("🔄 Completing login...");

          const response = await axios.post(
            "http://localhost:3000/api/v1/auth/exchange",
            { code, code_verifier }
          );

          await saveCredentials({
            access_token: response.data.access_token,
            refresh_token: response.data.refresh_token,
            user: response.data.user
          });

          console.log(`✅ Logged in as @${response.data.user.username}`);

        } catch (err) {
          console.error("❌ Login failed:", err.response?.data || err.message);
        }
      }
    });

    server.on("error", (err) => {
      console.error("❌ Server error:", err.message);
    });

    server.listen(port, () => {
      console.log(`🟢 Listening on http://localhost:${port}`);
    });
  });

  program.command("whoami").action(async () => {
    try {
      const creds = await loadCredentials();
      if (!creds?.access_token) {
        console.log("❌ Not logged in. Run: insighta login");
        return;
      }
      console.log(`✅ Logged in as @${creds.user?.username || "unknown"}`);
      console.log(`   Role: ${creds.user?.role || "unknown"}`);
      console.log(`   Email: ${creds.user?.email || "unknown"}`);
    } catch (err) {
      console.error("❌ Error:", err.message);
    }
  });

  program.command("logout").action(async () => {
    try {
      const creds = await loadCredentials();
      if (creds?.access_token) {
        await axios.post("http://localhost:3000/api/v1/auth/logout", {
          access_token: creds.access_token
        });
      }
      await clearCredentials();
      console.log("✅ Logged out successfully");
    } catch (err) {
      await clearCredentials();
      console.log("✅ Logged out successfully");
    }
  });

};