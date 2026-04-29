import crypto from "crypto";
import fs from "fs";
import os from "os";
import path from "path";
import jwt from "jsonwebtoken";

import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import axios from "axios";
import User from "../models/User.js";
import { uuidv7 } from "uuidv7";



// controllers/auth.controller.js

export const githubRedirect = (req, res) => {
  try {
    const { GITHUB_CLIENT_ID, GITHUB_CALLBACK_URL } = process.env;

    const { state, code_challenge } = req.query;

    if (!state || !code_challenge) {
      return res.status(400).json({
        status: "error",
        message: "state and code_challenge are required"
      });
    }

    const encodedCallback = encodeURIComponent(GITHUB_CALLBACK_URL);

    const githubURL =
      `https://github.com/login/oauth/authorize` +
      `?client_id=${GITHUB_CLIENT_ID}` +
      `&redirect_uri=${encodedCallback}` +
      `&scope=read:user user:email` +
      `&state=${state}` +
      `&code_challenge=${code_challenge}` +
      `&code_challenge_method=S256`;

    return res.redirect(githubURL);

  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Failed to initiate auth"
    });
  }
};

// ==========================
// 🔹 GITHUB CALLBACK HANDLER
// ==========================
export const githubCallback = (req, res) => {
  try {
    const { code, state } = req.query;

    console.log("🔥 CALLBACK HIT", { code, state });

    if (!code || !state) {
      return res.status(400).json({
        status: "error",
        message: "Missing code or state"
      });
    }

    const redirectUrl = `http://localhost:5173/callback?code=${code}&state=${state}`;

    console.log("➡️ Redirecting to:", redirectUrl);

    return res.redirect(redirectUrl);

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status: "error",
      message: "Callback handling failed"
    });
  }
};
// ==========================
// 🔹 REDIRECT TO GITHUB LOGIN
// ==========================
// controllers/auth.controller.js

export const exchangeCode = async (req, res) => {
  try {
    const { code, code_verifier } = req.body;

    if (!code || !code_verifier) {
      return res.status(400).json({
        status: "error",
        message: "code and code_verifier required"
      });
    }

    // 🔁 Exchange code with GitHub
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        code_verifier
      },
      {
        headers: {
          Accept: "application/json"
        }
      }
    );

    const githubAccessToken = tokenRes.data.access_token;

    if (!githubAccessToken) {
      return res.status(400).json({
        status: "error",
        message: "Failed to retrieve GitHub token"
      });
    }

    // 👤 Get GitHub user
    const userRes = await axios.get(
      "https://api.github.com/user",
      {
        headers: {
          Authorization: `Bearer ${githubAccessToken}`
        }
      }
    );

    const githubUser = userRes.data;

    // 📧 Get email
    const emailRes = await axios.get(
      "https://api.github.com/user/emails",
      {
        headers: {
          Authorization: `Bearer ${githubAccessToken}`
        }
      }
    );

    const primaryEmail =
      emailRes.data.find(e => e.primary)?.email || null;

    // 🗄️ Find or create user
// 🗄️ Find user first
let user = await User.findOne({
  github_id: githubUser.id
});

if (!user) {
  // ✅ COUNT BEFORE CREATION (THIS IS THE FIX)
  const userCount = await User.countDocuments();

  const role = githubUser.id  === process.env.ADMIN_GITHUB_ID ? "admin" : "analyst";

  user = await User.create({
    github_id: githubUser.id,
    username: githubUser.login,
    email: primaryEmail,
    avatar_url: githubUser.avatar_url,
    role, // ✅ dynamic
    is_active: true,
    last_login_at: new Date()
  });

} else {
  // ✅ DO NOT TOUCH ROLE
  user.username = githubUser.login;
  user.email = primaryEmail;
  user.avatar_url = githubUser.avatar_url;
  user.last_login_at = new Date();

  await user.save();
}

    // 🚫 Check inactive
    if (!user.is_active) {
      return res.status(403).json({
        status: "error",
        message: "User inactive"
      });
    }

    // 🔐 Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // 💾 Save refresh token (basic version)
    user.refresh_token = refreshToken;
    await user.save();

    return res.json({
      status: "success",
      access_token: accessToken,
      refresh_token: refreshToken
    });

  } catch (error) {
    console.error("Exchange Error:", error);

    return res.status(500).json({
      status: "error",
      message: "Authentication failed"
    });
  }
};



// ==========================
// 🔹 REFRESH TOKEN
// ==========================
export const refreshToken = async (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({
      status: "error",
      message: "Refresh token required"
    });
  }

  try {
    const decoded = jwt.verify(
      refresh_token,
      process.env.JWT_REFRESH_SECRET
    );

    const user = await User.findById(decoded.id);

    if (!user || user.refresh_token !== refresh_token) {
      return res.status(401).json({
        status: "error",
        message: "Invalid refresh token"
      });
    }

    user.refresh_token = null;

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    user.refresh_token = newRefreshToken;
    await user.save();

    return res.json({
      status: "success",
      access_token: newAccessToken,
      refresh_token: newRefreshToken
    });

  } catch (err) {
    return res.status(401).json({
      status: "error",
      message: "Invalid or expired refresh token"
    });
  }
};


// ==========================
// 🔹 LOGOUT
// ==========================
export const logout = async (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.json({
      status: "success",
      message: "Logged out"
    });
  }

  const user = await User.findOne({ refresh_token });

  if (user) {
    user.refresh_token = null;
    await user.save();
  }

  return res.json({
    status: "success",
    message: "Logged out"
  });
};