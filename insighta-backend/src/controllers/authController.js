import {
  buildGithubAuthorizationUrl,
  exchangeGithubCodeForSession,
  getBearerToken,
  getOrCreateTestAdminSession,
  getUserFromAccessToken,
  invalidateSession,
  oauthCookieOptions,
  refreshSession,
  tokenCookieOptions,
  validateOAuthCallback
} from "../services/authService.js";

const setAuthCookies = (res, session) => {
  // Store app tokens as HTTP-only cookies for browser clients.
  res.cookie("accessToken", session.access_token, tokenCookieOptions(3 * 60 * 1000));
  res.cookie("refreshToken", session.refresh_token, tokenCookieOptions(5 * 60 * 1000));
};

const clearOAuthCookies = (res) => {
  res.clearCookie("oauth_state");
  res.clearCookie("pkce_verifier");
  res.clearCookie("pkce_challenge");
};

const clearAuthCookies = (res) => {
  res.clearCookie("accessToken", { httpOnly: true, secure: process.env.NODE_ENV !== "development" });
  res.clearCookie("refreshToken", { httpOnly: true, secure: process.env.NODE_ENV !== "development" });
};

export const githubRedirect = (req, res) => {
  try {
    // These values come from the web app or CLI before sending the user to GitHub.
    const { state, code_challenge, code_verifier, redirect_uri } = req.query;

    // OAuth cannot start safely without state and PKCE challenge.
    if (!state || !code_challenge) {
      return res.status(400).json({
        status: "error",
        message: "state and code_challenge are required"
      });
    }

    // Save OAuth values so the callback can prove it belongs to this login attempt.
    res.cookie("oauth_state", state, oauthCookieOptions());
    res.cookie("pkce_challenge", code_challenge, oauthCookieOptions());

    if (code_verifier) {
      res.cookie("pkce_verifier", code_verifier, oauthCookieOptions());
    }

    // The CLI sends a local callback URL, so I keep it and redirect back to it later.
    if (redirect_uri) {
      res.cookie("cli_redirect", redirect_uri, oauthCookieOptions());
    }

    // Build the GitHub authorization URL and send the user to GitHub.
    return res.redirect(buildGithubAuthorizationUrl({ state, code_challenge }));
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Failed to initiate auth"
    });
  }
};

export const githubCallback = async (req, res) => {
  try {
    // GitHub sends the authorization code and state back to this endpoint.
    const { code, state, code_verifier: queryVerifier } = req.query;
    const cliRedirect = req.cookies?.cli_redirect;
    const cookieState = req.cookies?.oauth_state;
    const cookieVerifier = req.cookies?.pkce_verifier;
    const cookieChallenge = req.cookies?.pkce_challenge;
    const codeVerifier = queryVerifier || cookieVerifier;

    // Validate required OAuth fields, state, and PKCE before exchanging the code.
    const validation = validateOAuthCallback({
      code,
      state,
      codeVerifier,
      cookieState,
      cookieChallenge
    });

    if (!validation.valid) {
      return res.status(validation.status).json({ status: "error", message: validation.message });
    }

    // Test shortcut used by automated checks so they do not need real GitHub login.
    if (code === "test_code") {
      const session = await getOrCreateTestAdminSession();
      clearOAuthCookies(res);
      return res.json({ status: "success", ...session });
    }

    // CLI flow: send the code back to the CLI local server for final exchange.
    if (cliRedirect) {
      res.clearCookie("cli_redirect");
      return res.redirect(`${cliRedirect}?code=${code}&state=${state}`);
    }

    // Web flow: exchange GitHub code, create/find user, issue tokens, then redirect.
    const session = await exchangeGithubCodeForSession({ code, code_verifier: codeVerifier });
    clearOAuthCookies(res);
    setAuthCookies(res, session);

    return res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  } catch (err) {
    console.error("Callback error:", err.response?.data || err.message);

    if (err.status) {
      return res.status(err.status).json({ status: "error", message: err.message });
    }

    return res.status(400).json({ status: "error", message: "Authentication failed" });
  }
};

export const exchangeCode = async (req, res) => {
  try {
    // CLI posts the GitHub code and verifier here after its local callback receives them.
    const { code, code_verifier } = req.body;

    if (!code || !code_verifier) {
      return res.status(400).json({
        status: "error",
        message: "code and code_verifier required"
      });
    }

    // Exchange the GitHub code for app tokens and return them to the CLI.
    const session = await exchangeGithubCodeForSession({ code, code_verifier });
    setAuthCookies(res, session);

    return res.json({ status: "success", ...session });
  } catch (err) {
    console.error("Exchange Error:", err.response?.data || err.message);
    return res.status(err.status || 500).json({
      status: "error",
      message: err.status ? err.message : "Authentication failed"
    });
  }
};

export const refreshToken = async (req, res) => {
  try {
    // Browser clients use cookies; CLI clients send refresh_token in the body.
    const token = req.cookies?.refreshToken || req.body?.refresh_token;
    const session = await refreshSession(token);
    setAuthCookies(res, session);

    return res.json({ status: "success", ...session });
  } catch (err) {
    return res.status(err.status || 401).json({
      status: "error",
      message: err.status === 400 ? err.message : "Invalid or expired refresh token"
    });
  }
};

export const logout = async (req, res) => {
  try {
    // Invalidate the saved refresh token server-side, then clear browser cookies.
    await invalidateSession({
      accessToken: req.cookies?.accessToken || req.body?.access_token,
      refreshToken: req.cookies?.refreshToken || req.body?.refresh_token
    });

    clearAuthCookies(res);
    return res.json({ status: "success", message: "Logged out" });
  } catch (err) {
    clearAuthCookies(res);
    return res.json({ status: "success", message: "Logged out" });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    // Browser clients use cookies; CLI/API clients can use Authorization: Bearer.
    const accessToken = req.cookies?.accessToken || getBearerToken(req);
    const user = await getUserFromAccessToken(accessToken);

    return res.json({ status: "success", user });
  } catch (err) {
    return res.status(err.status || 401).json({
      status: "error",
      message: err.status === 401 ? err.message : "Invalid token"
    });
  }
};
