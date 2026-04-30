# Insighta Labs+ — Stage 3

A secure, multi-interface profile analytics platform built with GitHub OAuth, PKCE, role-based access control, and support for both a React web portal and a terminal CLI.

---

## Table of Contents

- [System Architecture](#system-architecture)
- [Authentication Flow](#authentication-flow)
  - [Web Portal Flow](#web-portal-flow)
  - [CLI Flow](#cli-flow)
- [CLI Usage](#cli-usage)
- [Token Handling Approach](#token-handling-approach)
- [Role Enforcement Logic](#role-enforcement-logic)
- [Natural Language Parsing Approach](#natural-language-parsing-approach)
- [Backend API Notes](#backend-api-notes)
- [Environment Variables](#environment-variables)

---

## System Architecture

Insighta Labs+ is organized as a modular mono-repo with three main packages:

- `insighta-backend`
  - Express.js REST API
  - MongoDB data storage
  - GitHub OAuth and JWT authentication
  - Profile CRUD, search, export, and role-based authorization
- `insighta-web`
  - React web portal
  - Uses HTTP-only cookies for auth
  - Connects to the backend API for data and session operations
- `insighta-cli`
  - Node.js command line client
  - Uses the same backend API as the web portal
  - Supports login, profile listing, search, get, create, and export

### Data Flow

- Web and CLI both authenticate through the backend
- The backend issues JWT tokens and manages refresh cycles
- Profile data is centralized in MongoDB
- Role enforcement occurs in the backend, not the clients

---

## Authentication Flow

Authentication is based on GitHub OAuth with PKCE to support both browser and CLI clients.

### Web Portal Flow

1. User clicks login in the web portal
2. Web frontend redirects to backend: `/api/v1/auth/github`
3. Backend builds an OAuth request to GitHub with PKCE and the configured callback URL
4. GitHub redirects back to backend at `/api/v1/auth/github/callback`
5. Backend exchanges the authorization code for a GitHub access token
6. Backend creates/updates the user, issues JWT access and refresh tokens, and sets them in HTTP-only cookies
7. User is redirected to the web dashboard

### CLI Flow

1. CLI generates PKCE values and starts a local callback server on `http://localhost:5178/callback`
2. CLI opens the default browser and starts GitHub login via backend: `/api/v1/auth/github?redirect_uri=http://localhost:5178/callback`
3. GitHub redirects back to the local callback server after user consent
4. CLI captures the authorization code and POSTs it to backend: `/api/v1/auth/exchange`
5. Backend exchanges the code with GitHub and returns JWT tokens in JSON
6. CLI stores tokens locally for future requests

---

## CLI Usage

The CLI supports terminal-based profile management using the same backend API.

### Available commands

- `insighta login`
  - Starts the GitHub OAuth login flow
- `insighta profiles list [options]`
  - List profiles with filtering, sorting, and pagination
  - Options: `--gender`, `--country`, `--age-group`, `--min-age`, `--max-age`, `--sort-by`, `--order`, `--page`, `--limit`
- `insighta profiles get <id>`
  - Retrieve a single profile by ID
- `insighta profiles search <query>`
  - Search profiles using natural language text
- `insighta profiles create --name <name>`
  - Create a new profile (admin only)
- `insighta profiles export [--format csv] [--gender <gender>] [--country <country>] [--min-age <minAge>] [--max-age <maxAge>]`
  - Export profile data to CSV

### Example

```bash
insighta login
insighta profiles list --gender female --sort-by age --order desc --page 1 --limit 20
insighta profiles search "young female from china"
insighta profiles export --format csv --country US
```

---

## Token Handling Approach

The backend uses JWTs for token handling and supports both cookie-based and bearer authentication.

- **Access token**
  - Issued as a JWT signed with `JWT_SECRET`
  - Expires in `3 minutes`
  - Used for authorization on protected endpoints
- **Refresh token**
  - Issued as a JWT signed with `JWT_REFRESH_SECRET`
  - Expires in `5 minutes`
  - Used to request a new access token from `/api/v1/auth/refresh`

### Web

- Uses HTTP-only cookies for `accessToken` and `refreshToken`
- Cookies are set by the backend after GitHub authentication
- The web portal sends cookies automatically with API requests when `credentials: true`

### CLI

- Stores `access_token` and `refresh_token` locally (not in cookies)
- Sends the access token using the `Authorization: Bearer <token>` header
- Uses `POST /api/v1/auth/refresh` to renew expired tokens

---

## Role Enforcement Logic

The backend enforces user roles on protected profile actions.

### Roles

- `admin`
  - Full access to profile creation and deletion
- `analyst`
  - Read-only access to profile listing, search, get, and export

### Enforcement

- `protect` middleware validates JWT tokens from cookies or bearer headers
- `authorize("admin")` middleware guards admin-only routes
- If the user role does not match, the backend returns `403 Forbidden`
- If authentication is missing or invalid, the backend returns `401 Unauthorized`

### Default behavior

- Users are created as `analyst` unless their GitHub ID matches `ADMIN_GITHUB_ID`
- Inactive users are blocked from access

---

## Natural Language Parsing Approach

Profile search accepts free text and maps common keywords into query filters.

### Supported keywords

- `male`, `female`
- `adult`
- `young`
- `old`, `senior`
- `nigeria`
- `china`

### How it works

- The search query is lowercased and scanned for keywords
- Matching keywords add filters such as:
  - gender
  - age group
  - age range
  - country ID
- The filtered results are returned with pagination and optional sorting

### Example queries

- `female adult from nigeria`
- `young male`
- `senior woman`

---

## Backend API Notes

- All profile routes are protected and require authentication
- `GET /api/v1/profiles`
  - supports query filters, sorting, and pagination
- `GET /api/v1/profiles/search?q=<query>`
  - natural language search with keyword mapping
- `GET /api/v1/profiles/:id`
- `POST /api/v1/profiles`
  - admin only
- `DELETE /api/v1/profiles/:id`
  - admin only
- `POST /api/v1/auth/exchange`
  - exchange GitHub code for tokens (CLI and web)
- `POST /api/v1/auth/refresh`
  - refresh access and refresh tokens

---

## Environment Variables

Required backend vars:

- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GITHUB_CALLBACK_URL`
- `ADMIN_GITHUB_ID`
- `FRONTEND_URL`

Required web vars:

- `VITE_GITHUB_CLIENT_ID`
- `VITE_API_URL`

---

## Notes

- The backend is designed to support both CLI and web clients using the same API
- Authentication is centralized in the backend for consistency and security
- Role checks are enforced server-side so clients cannot bypass permissions
