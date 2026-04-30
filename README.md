# Insighta Labs+ — Stage 3

A secure, multi-interface profile analytics platform built with GitHub OAuth, PKCE, role-based access control, and support for CLI and Web interfaces.

---

## System Architecture

The system is structured into three repositories:

- **insighta-backend** — Express.js REST API with MongoDB, JWT authentication, and GitHub OAuth
- **insighta-web** — React web portal with HTTP-only cookie authentication
- **insighta-cli** — Node.js CLI tool for terminal-based access

All three share the same backend API as a single source of truth.