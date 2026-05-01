import crypto from "crypto";
import jwt from "jsonwebtoken";
import axios from "axios";
import User from "../models/User.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";

export const oauthCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV !== "development",
  sameSite: "lax",
  maxAge: 10 * 60 * 1000
});

export const tokenCookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV !== "development",
  sameSite: process.env.NODE_ENV === "production" ? "lax" : false,
  maxAge
});

export const createCodeChallenge = (verifier) => {
  return crypto
    .createHash("sha256")
    .update(verifier)
    .digest("base64url");
};

export const getBearerToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;
  return authHeader.split(" ")[1];
};

export const serializeUser = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  avatar_url: user.avatar_url,
  role: user.role
});

export const buildGithubAuthorizationUrl = ({ state, code_challenge }) => {
  // This is where I use the GitHub client ID and callback URL to build the OAuth URL.
  const encodedCallback = encodeURIComponent(process.env.GITHUB_CALLBACK_URL);

  return (
    "https://github.com/login/oauth/authorize" +
    `?client_id=${process.env.GITHUB_CLIENT_ID}` +
    `&redirect_uri=${encodedCallback}` +
    "&scope=read:user user:email" +
    `&state=${state}` +
    `&code_challenge=${code_challenge}` +
    "&code_challenge_method=S256"
  );
};

export const validateOAuthCallback = ({ code, state, codeVerifier, cookieState, cookieChallenge }) => {
  // GitHub must return a code; without it there is nothing to exchange for tokens.
  if (!code) {
    return { valid: false, status: 400, message: "code is required" };
  }

  // State protects the app from accepting callbacks that did not start from my login flow.
  if (!state) {
    return { valid: false, status: 400, message: "state is required" };
  }

  if (cookieState && state !== cookieState) {
    return { valid: false, status: 400, message: "Invalid state" };
  }

  // PKCE requires a verifier to prove this callback belongs to the original request.
  if (!codeVerifier) {
    return { valid: false, status: 400, message: "code_verifier is required" };
  }

  // I hash the verifier and compare it to the challenge that was saved before redirect.
  if (cookieChallenge && createCodeChallenge(codeVerifier) !== cookieChallenge) {
    return { valid: false, status: 400, message: "Invalid PKCE code_verifier" };
  }

  return { valid: true };
};

const issueSession = async (user) => {
  // My app issues its own short-lived access token and refresh token after GitHub login.
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refresh_token = refreshToken;
  await user.save();

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    user: serializeUser(user)
  };
};

export const getOrCreateTestAdminSession = async () => {
  let adminUser = await User.findOne({ github_id: "test_admin" });

  if (!adminUser) {
    adminUser = await User.create({
      github_id: "test_admin",
      username: "test_admin",
      email: "admin@test.com",
      avatar_url: "",
      role: "admin",
      is_active: true,
      last_login_at: new Date()
    });
  }

  return issueSession(adminUser);
};

const getGithubAccessToken = async ({ code, code_verifier }) => {
  // Exchange GitHub's temporary code for a GitHub access token.
  const tokenRes = await axios.post(
    "https://github.com/login/oauth/access_token",
    {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: process.env.GITHUB_CALLBACK_URL,
      code_verifier
    },
    { headers: { Accept: "application/json" } }
  );

  return tokenRes.data.access_token;
};

const getGithubUserProfile = async (githubAccessToken) => {
  // Use the GitHub access token to fetch the user's GitHub profile and primary email.
  const userRes = await axios.get("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${githubAccessToken}` }
  });

  const emailRes = await axios.get("https://api.github.com/user/emails", {
    headers: { Authorization: `Bearer ${githubAccessToken}` }
  });

  const githubUser = userRes.data;
  const primaryEmail = emailRes.data.find((email) => email.primary)?.email || null;

  return { githubUser, primaryEmail };
};

const upsertGithubUser = async ({ githubUser, primaryEmail }) => {
  // Find the user by GitHub ID; create the user if this is their first login.
  let user = await User.findOne({ github_id: githubUser.id });

  if (!user) {
    const role = String(githubUser.id) === process.env.ADMIN_GITHUB_ID ? "admin" : "analyst";

    return User.create({
      github_id: githubUser.id,
      username: githubUser.login,
      email: primaryEmail,
      avatar_url: githubUser.avatar_url,
      role,
      is_active: true,
      last_login_at: new Date()
    });
  }

  user.username = githubUser.login;
  user.email = primaryEmail;
  user.avatar_url = githubUser.avatar_url;
  user.last_login_at = new Date();
  await user.save();

  return user;
};

export const exchangeGithubCodeForSession = async ({ code, code_verifier }) => {
  // Full login service: GitHub code -> GitHub user -> database user -> app session.
  const githubAccessToken = await getGithubAccessToken({ code, code_verifier });

  if (!githubAccessToken) {
    const error = new Error("Invalid authorization code");
    error.status = 400;
    throw error;
  }

  const profile = await getGithubUserProfile(githubAccessToken);
  const user = await upsertGithubUser(profile);

  if (!user.is_active) {
    const error = new Error("User inactive");
    error.status = 403;
    throw error;
  }

  return issueSession(user);
};

export const refreshSession = async (token) => {
  // Refresh rotates tokens: the old refresh token must match, then a new pair is issued.
  if (!token) {
    const error = new Error("Refresh token required");
    error.status = 400;
    throw error;
  }

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  const user = await User.findOne({ id: decoded.id });

  if (!user || user.refresh_token !== token) {
    const error = new Error("Invalid refresh token");
    error.status = 401;
    throw error;
  }

  user.refresh_token = null;
  return issueSession(user);
};

export const invalidateSession = async ({ accessToken, refreshToken }) => {
  // Logout clears the stored refresh token so it cannot be used again.
  if (accessToken) {
    try {
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
      const user = await User.findOne({ id: decoded.id });

      if (user) {
        user.refresh_token = null;
        await user.save();
      }
    } catch (err) {}
  }

  if (refreshToken) {
    await User.findOneAndUpdate(
      { refresh_token: refreshToken },
      { $set: { refresh_token: null } }
    );
  }
};

export const getUserFromAccessToken = async (accessToken) => {
  // Decode the access token and return the active user attached to it.
  if (!accessToken) {
    const error = new Error("Unauthorized");
    error.status = 401;
    throw error;
  }

  const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
  const user = await User.findOne({ id: decoded.id });

  if (!user || !user.is_active) {
    const error = new Error("Unauthorized");
    error.status = 401;
    throw error;
  }

  return serializeUser(user);
};
