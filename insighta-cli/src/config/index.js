import os from "os";
import path from "path";

export const BASE_URL = "http://localhost:3000/api";
export const AUTH_BASE_URL = "http://localhost:3000/auth";
export const AUTH_API_URL = "http://localhost:3000/api/auth";
export const AUTH_URL = `${AUTH_BASE_URL}/github`;

export const CONFIG_DIR = path.join(os.homedir(), ".insighta");
export const CONFIG_FILE = path.join(CONFIG_DIR, "credentials.json");
