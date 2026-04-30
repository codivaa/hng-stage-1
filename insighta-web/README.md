# Insighta Web Portal

A secure, modern web interface for the Insighta profile analytics platform. Built with React and Vite, it provides a user-friendly dashboard with profile management, searching, and analytics.

## Features

- **GitHub OAuth Authentication** - Secure login using GitHub OAuth with PKCE flow
- **HTTP-only Cookies** - Tokens stored securely in HTTP-only cookies, inaccessible to JavaScript
- **Dashboard** - Real-time metrics and analytics
- **Profile Management** - Browse, filter, and search profiles
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Role-based Access** - Admin and analyst roles with appropriate permissions

## Setup

### Prerequisites

- Node.js 16+ and npm
- Backend API running on `http://localhost:3000`
- GitHub OAuth app credentials

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Configure environment variables in `.env`:
```
VITE_API_URL=http://localhost:3000
VITE_GITHUB_CLIENT_ID=your_github_client_id_here
```

### Development

Run the development server:
```bash
npm run dev
```

The portal will be available at `http://localhost:5173`

### Build

Build for production:
```bash
npm run build
```

The built files will be in the `dist/` directory.

## Architecture

### Key Components

- **Authentication Context** - Manages user state and authentication
- **Protected Routes** - Route guards for authenticated pages
- **API Service** - Centralized API communication with automatic token refresh
- **PKCE Flow** - Secure OAuth implementation

### Directory Structure

```
src/
├── pages/           # Page components
├── components/      # Reusable components
├── services/        # API and auth services
├── contexts/        # React contexts
├── utils/          # Utility functions (PKCE)
├── App.jsx         # Main app component
└── index.css       # Global styles
```

## Pages

### Public Pages
- **Login** (`/login`) - GitHub OAuth login

### Protected Pages
- **Dashboard** (`/dashboard`) - Metrics and overview
- **Profiles** (`/profiles`) - Browse and filter profiles
- **Profile Detail** (`/profile/:id`) - View profile details
- **Search** (`/search`) - Search profiles with keywords
- **Account** (`/account`) - User account settings

## Authentication Flow

1. User clicks "Sign in with GitHub"
2. Generate PKCE challenge and state
3. Redirect to GitHub OAuth
4. GitHub redirects back with authorization code
5. Exchange code for tokens via backend
6. Tokens stored in HTTP-only cookies
7. User redirected to dashboard

## Security Features

- **HTTP-only Cookies** - Prevents XSS attacks
- **PKCE Flow** - Secure authorization code flow
- **CSRF Protection** - SameSite cookie attributes
- **Token Refresh** - Automatic token refresh before expiry
- **Role-based Access Control** - Different permissions for admin/analyst

## API Integration

The portal uses the same backend APIs as the CLI:

- `GET /api/profiles` - Get profiles with filters
- `GET /api/profiles/:id` - Get profile details
- `GET /api/profiles/search` - Search profiles
- `POST /api/auth/exchange` - Exchange OAuth code for tokens
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

## Environment Variables

- `VITE_API_URL` - Backend API URL (default: http://localhost:3000)
- `VITE_GITHUB_CLIENT_ID` - GitHub OAuth client ID

## License

ISC
