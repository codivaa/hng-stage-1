import fs from "fs";
import path from "path";
import ora from "ora";
import api from "../services/api.js";

const cleanParams = (params) => {
  Object.keys(params).forEach((key) => {
    if (params[key] === undefined) delete params[key];
  });

  return params;
};

const printError = (message, err) => {
  console.error(message);
  console.error(err.response?.data?.message || err.response?.data || err.message);
};

export default (program) => {
  const profiles = program
    .command("profiles")
    .description("Profile operations");

  profiles
    .command("list")
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
