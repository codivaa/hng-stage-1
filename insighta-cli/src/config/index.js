import os from "os";
import path from "path";

export const BASE_URL = "http://localhost:3000/api";
export const AUTH_URL = "http://localhost:3000/api/v1/auth/github";

export const CONFIG_DIR = path.join(os.homedir(), ".insighta");
export const CONFIG_FILE = path.join(CONFIG_DIR, "credentials.json");