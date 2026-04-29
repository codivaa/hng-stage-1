import open from "open";
import http from "http";
import crypto from "crypto";
import axios from "axios";

import { AUTH_URL } from "../config/index.js";
import { generatePKCE } from "../utils/pkce.js";
import { saveCredentials } from "../services/storage.js";

export default (program) => {

  program.command("login").action(async () => {
    const { code_verifier, code_challenge } = generatePKCE();
    const state = crypto.randomBytes(16).toString("hex");

    const port = 5173;
    const redirectUri = `http://localhost:${port}/callback`;

    const url =
      `${AUTH_URL}?state=${state}` +
      `&code_challenge=${code_challenge}` +
      `&code_challenge_method=S256`;

    console.log("🌐 Opening browser...");
    await open(url);

    const server = http.createServer(async (req, res) => {
      if (req.url.startsWith("/callback")) {
        console.log("👉 Callback received");

        const parsed = new URL(req.url, redirectUri);
        const code = parsed.searchParams.get("code");
        const returnedState = parsed.searchParams.get("state");

        // optional but good: validate state
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
            {
              code,
              code_verifier
            }
          );

          console.log("👉 Response:", response.data);

          await saveCredentials({
            access_token: response.data.access_token,
            refresh_token: response.data.refresh_token
          });
          
          console.log("✅ Logged in successfully");

        } catch (err) {
          console.error(
            "❌ Login failed:",
            err.response?.data || err.message
          );
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

};