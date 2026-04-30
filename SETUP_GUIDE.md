# 🚀 Insighta Complete Setup Guide

This guide covers the setup and deployment of the complete Insighta platform including Backend, CLI, and Web Portal.

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Backend Setup](#backend-setup)
3. [CLI Setup](#cli-setup)
4. [Web Portal Setup](#web-portal-setup)
5. [GitHub OAuth Configuration](#github-oauth-configuration)
6. [Running the Full Stack](#running-the-full-stack)
7. [API Documentation](#api-documentation)
8. [Security Features](#security-features)

---

## Project Overview

The Insighta platform consists of three components:

### 1. **Backend API** (`insighta-backend/`)
- Express.js REST API
- MongoDB database
- GitHub OAuth authentication
- Role-based access control (Admin/Analyst)
- HTTP-only cookie-based authentication
- CORS enabled for web portal

### 2. **CLI Tool** (`insighta-cli/`)
- Command-line interface for profile management
- Authentication via GitHub OAuth with PKCE
- Profile searching and filtering
- Profile data export

### 3. **Web Portal** (`insighta-web/`)
- React + Vite frontend
- Responsive dashboard
- Profile browser with advanced filtering
- Real-time search
- Account management
- HTTP-only cookie authentication

---

## Backend Setup

### Prerequisites
- Node.js 16+
- MongoDB (local or Atlas)
- GitHub OAuth App credentials

### Installation

1. Navigate to backend directory:
```bash
cd insighta-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure `.env`:
```env
# Server
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/insighta
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/insighta

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/v1/auth/github/callback

# Admin
ADMIN_GITHUB_ID=your_github_id_for_admin_access

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

5. Seed the database (optional):
```bash
npm run dev
# Then in another terminal:
node src/seed/seedProfiles.js
node src/seed/seedAdmin.js
```

6. Run development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

---

## CLI Setup

### Installation

1. Navigate to CLI directory:
```bash
cd insighta-cli
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure `.env`:
```env
API_BASE_URL=http://localhost:3000/api/v1
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_AUTHORIZE_URL=https://github.com/login/oauth/authorize
GITHUB_TOKEN_URL=https://github.com/login/oauth/access_token
```

5. Run the CLI:
```bash
node bin/index.js
```

Available commands:
- `auth login` - Authenticate with GitHub
- `profiles list` - List all profiles
- `profiles search` - Search profiles
- `profiles get <id>` - Get profile details
- `profiles export` - Export profiles (admin only)

---

## Web Portal Setup

### Prerequisites
- Node.js 16+
- Backend API running
- GitHub OAuth App credentials

### Installation

1. Navigate to web portal directory:
```bash
cd insighta-web
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure `.env`:
```env
VITE_API_URL=http://localhost:3000
VITE_GITHUB_CLIENT_ID=your_github_client_id_here
```

5. Run development server:
```bash
npm run dev
```

The portal will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

This creates an optimized build in the `dist/` directory.

---

## GitHub OAuth Configuration

### Step 1: Create GitHub OAuth App

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in the form:
   - **Application name**: Insighta
   - **Homepage URL**: `http://localhost:5173`
   - **Authorization callback URL**: `http://localhost:3000/api/v1/auth/github/callback`
4. Create the app

### Step 2: Get Credentials

From the GitHub OAuth App:
- **Client ID**: Copy to `GITHUB_CLIENT_ID` in backend `.env`
- **Client Secret**: Copy to `GITHUB_CLIENT_SECRET` in backend `.env`

Also add to web portal `.env`:
- `VITE_GITHUB_CLIENT_ID=<your_client_id>`

### Step 3: Admin Setup

1. Get your GitHub user ID (username or ID)
2. Add to backend `.env` as `ADMIN_GITHUB_ID`
3. Login through the portal - you'll automatically become admin

---

## Running the Full Stack

### Terminal 1 - Backend API

```bash
cd insighta-backend
npm install
npm run dev
```

The API runs on `http://localhost:3000`

### Terminal 2 - Web Portal

```bash
cd insighta-web
npm install
npm run dev
```

The portal runs on `http://localhost:5173`

### Terminal 3 (Optional) - CLI

```bash
cd insighta-cli
npm install
node bin/index.js
```

### Access the Application

- **Web Portal**: http://localhost:5173
- **API Docs**: http://localhost:3000

---

## API Documentation

### Authentication Endpoints

#### GitHub OAuth Redirect
```
GET /api/v1/auth/github?state=<state>&code_challenge=<challenge>
```

#### Exchange Code for Tokens
```
POST /api/v1/auth/exchange
Content-Type: application/json

{
  "code": "github_auth_code",
  "code_verifier": "pkce_verifier"
}

Response:
{
  "status": "success",
  "user": {
    "id": "user_id",
    "username": "github_username",
    "email": "email@example.com",
    "avatar_url": "avatar_url",
    "role": "admin|analyst"
  }
}
```

#### Refresh Token
```
POST /api/v1/auth/refresh

Response:
{
  "status": "success",
  "user": { ... }
}
```

#### Get Current User
```
GET /api/v1/auth/me

Response:
{
  "status": "success",
  "user": { ... }
}
```

#### Logout
```
POST /api/v1/auth/logout

Response:
{
  "status": "success",
  "message": "Logged out"
}
```

### Profile Endpoints

#### Get All Profiles
```
GET /api/v1/profiles?gender=male&age_group=adult&country_id=NG&page=1&limit=10

Query Parameters:
- gender: male|female
- age_group: child|teenager|adult|senior
- country_id: country code (e.g., NG, US, CN)
- min_age: minimum age
- max_age: maximum age
- sort_by: age|created_at|name
- order: asc|desc
- page: page number (default: 1)
- limit: results per page (default: 10, max: 50)

Response:
{
  "status": "success",
  "page": 1,
  "limit": 10,
  "total": 100,
  "total_pages": 10,
  "links": {
    "self": "/api/v1/profiles?page=1&limit=10",
    "next": "/api/v1/profiles?page=2&limit=10",
    "prev": null
  },
  "data": [ ... ]
}
```

#### Get Profile by ID
```
GET /api/v1/profiles/:id

Response:
{
  "status": "success",
  "data": { ... }
}
```

#### Search Profiles
```
GET /api/v1/profiles/search?q=male&page=1&limit=10

Query Parameters:
- q: search query (e.g., "male", "young", "Nigeria")
- page: page number
- limit: results per page

Response:
{
  "status": "success",
  "page": 1,
  "limit": 10,
  "total": 50,
  "data": [ ... ]
}
```

#### Create Profile (Admin Only)
```
POST /api/v1/profiles
Content-Type: application/json

{
  "name": "John Doe",
  "gender": "male",
  "gender_probability": 0.95,
  "age": 28,
  "age_group": "adult",
  "country_id": "NG",
  "country_probability": 0.92
}
```

#### Delete Profile (Admin Only)
```
DELETE /api/v1/profiles/:id
```

---

## Security Features

### 1. HTTP-only Cookies
- JWT tokens stored in HTTP-only cookies
- Not accessible to JavaScript (prevents XSS attacks)
- Automatically sent with each request

### 2. PKCE Flow (OAuth)
- Code verifier and challenge for secure authorization
- Prevents authorization code interception

### 3. CSRF Protection
- SameSite cookie attributes
- Same-origin CORS policy
- CORS credentials enabled only for trusted origins

### 4. Role-Based Access Control
- Admin role for profile management
- Analyst role for viewing only
- Automatic role assignment based on GitHub ID

### 5. Token Refresh
- Access tokens: 3 minutes
- Refresh tokens: 5 minutes
- Automatic refresh before expiry

### 6. Input Validation
- Query parameter validation
- Pagination limits enforced
- Safe sorting fields only

---

## Troubleshooting

### Issue: "Unauthorized" on API calls
**Solution**: 
- Check if your access token is in the HTTP-only cookie
- Try logging out and logging back in
- Check browser DevTools → Application → Cookies

### Issue: "GitHub OAuth failed"
**Solution**:
- Verify GitHub Client ID and Client Secret
- Check callback URL matches in GitHub OAuth app
- Ensure backend is running

### Issue: MongoDB connection error
**Solution**:
- Verify MongoDB is running locally or Atlas connection string is correct
- Check `MONGODB_URI` in `.env`
- Verify MongoDB credentials

### Issue: Profile data not loading
**Solution**:
- Seed the database: `node src/seed/seedProfiles.js`
- Check MongoDB connection
- Verify API is returning data: `curl http://localhost:3000/api/v1/profiles`

---

## Production Deployment

### Backend Deployment (Railway, Heroku, etc.)

1. Set environment variables on platform
2. Update `FRONTEND_URL` to your production domain
3. Update GitHub OAuth callback URL
4. Deploy using git push or CLI

### Frontend Deployment (Vercel, Netlify, etc.)

1. Build the application:
```bash
npm run build
```

2. Deploy `dist/` folder
3. Set environment variables on platform
4. Update `VITE_API_URL` to your production API

---

## License

ISC

---

## Support

For issues or questions:
1. Check the API logs: `tail -f logs/api.log`
2. Check browser console for frontend errors
3. Verify all environment variables are set correctly
4. Ensure all services are running
