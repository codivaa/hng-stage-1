import fs from "fs-extra";
import { CONFIG_FILE, CONFIG_DIR } from "../config/index.js";

export const loadCredentials = async () => {
  // Return null when the user has not logged in yet.
  if (!fs.existsSync(CONFIG_FILE)) return null;
  return fs.readJson(CONFIG_FILE);
};

export const saveCredentials = async (data) => {
  // Ensure ~/.insighta exists before writing credentials.json.
  await fs.ensureDir(CONFIG_DIR);
  await fs.writeJson(CONFIG_FILE, data, { spaces: 2 });
};

export const clearCredentials = async () => {
  // Removing the file logs the CLI out locally.
  if (fs.existsSync(CONFIG_FILE)) {
    await fs.remove(CONFIG_FILE);
  }
};
