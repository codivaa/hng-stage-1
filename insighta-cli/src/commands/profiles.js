import fs from "fs";
import path from "path";
import ora from "ora";
import api from "../services/api.js";

const cleanParams = (params) => {
  // Remove empty CLI options so the API only receives filters the user actually passed.
  Object.keys(params).forEach((key) => {
    if (params[key] === undefined) delete params[key];
  });

  return params;
};

const printError = (message, err) => {
  // Prefer backend error messages when available; fall back to the raw error.
  console.error(message);
  console.error(err.response?.data?.message || err.response?.data || err.message);
};

export default (program) => {
  const profiles = program
    .command("profiles")
    .description("Profile operations");

  profiles
    .command("list")
    // These options map directly to /api/profiles query parameters.
    .option("--gender <gender>")
    .option("--country <country>")
    .option("--age-group <ageGroup>")
    .option("--min-age <minAge>")
    .option("--max-age <maxAge>")
    .option("--sort-by <sortBy>")
    .option("--order <order>")
    .option("--page <page>")
    .option("--limit <limit>")
    .action(async (options) => {
      // Loader gives feedback while the authenticated API request is running.
      const spinner = ora("Fetching profiles...").start();

      try {
        const params = cleanParams({
          gender: options.gender,
          country: options.country,
          age_group: options.ageGroup,
          min_age: options.minAge,
          max_age: options.maxAge,
          sort_by: options.sortBy,
          order: options.order,
          page: options.page,
          limit: options.limit
        });

        const res = await api.get("/profiles", { params });
        const { page, total, total_pages, data } = res.data;

        // console.table makes profile output easier to scan in the terminal.
        spinner.succeed("Profiles loaded");
        console.log(`Page: ${page}`);
        console.log(`Total: ${total}`);
        console.log(`Total Pages: ${total_pages}`);
        console.table(data);
      } catch (err) {
        spinner.fail("Failed to fetch profiles");
        printError("Error:", err);
      }
    });

  profiles
    .command("get <id>")
    .action(async (id) => {
      // Fetch one profile by UUID/custom id and display it as a one-row table.
      const spinner = ora("Fetching profile...").start();

      try {
        const res = await api.get(`/profiles/${id}`);
        spinner.succeed("Profile loaded");
        console.table([res.data.data]);
      } catch (err) {
        spinner.fail("Failed to fetch profile");
        printError("Error:", err);
      }
    });

  profiles
    .command("search <query>")
    .action(async (query) => {
      // Search accepts plain text like "young males from nigeria".
      const spinner = ora("Searching profiles...").start();

      try {
        const res = await api.get("/profiles/search", {
          params: { q: query }
        });

        spinner.succeed("Search complete");
        console.table(res.data.data);
      } catch (err) {
        spinner.fail("Search failed");
        printError("Error:", err);
      }
    });

  profiles
    .command("create")
    .requiredOption("--name <name>")
    .action(async ({ name }) => {
      // Create is admin-only on the backend, so non-admin users will receive an error.
      const spinner = ora("Creating profile...").start();

      try {
        const res = await api.post("/profiles", { name });
        spinner.succeed("Profile created");
        console.table([res.data.data]);
      } catch (err) {
        spinner.fail("Failed to create profile");
        printError("Error:", err);
      }
    });

  profiles
    .command("export")
    .option("--format <format>", "Export format", "csv")
    .option("--gender <gender>")
    .option("--country <country>")
    .option("--min-age <minAge>")
    .option("--max-age <maxAge>")
    .action(async (options) => {
      // Export streams CSV from the backend and saves it in the current directory.
      const spinner = ora("Exporting profiles...").start();

      try {
        const params = cleanParams({
          format: options.format,
          gender: options.gender,
          country: options.country,
          min_age: options.minAge,
          max_age: options.maxAge
        });

        const res = await api.get("/profiles/export", {
          params,
          responseType: "stream"
        });

        const file = path.join(process.cwd(), `profiles_${Date.now()}.csv`);
        const writer = fs.createWriteStream(file);

        // Pipe the API response stream straight into a local CSV file.
        res.data.pipe(writer);

        await new Promise((resolve, reject) => {
          writer.on("finish", resolve);
          writer.on("error", reject);
          res.data.on("error", reject);
        });

        spinner.succeed(`CSV saved to ${file}`);
      } catch (err) {
        spinner.fail("Export failed");
        printError("Error:", err);
      }
    });
};
