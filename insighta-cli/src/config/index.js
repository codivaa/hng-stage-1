import os from "os";
import path from "path";

// API base for profile requests. The API service appends /profiles, /profiles/search, etc.
export const BASE_URL = "http://localhost:3000/api";

// Auth endpoints are separated because the project requires /auth/... routes.
export const AUTH_BASE_URL = "http://localhost:3000/auth";
export const AUTH_API_URL = "http://localhost:3000/api/auth";
export const AUTH_URL = `${AUTH_BASE_URL}/github`;

// CLI credentials are stored in the user's home folder, so they work from any directory.
export const CONFIG_DIR = path.join(os.homedir(), ".insighta");
export const CONFIG_FILE = path.join(CONFIG_DIR, "credentials.json");
