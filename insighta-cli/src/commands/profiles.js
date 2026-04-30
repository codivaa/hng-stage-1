import api from "../services/api.js";
import fs from "fs";

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
      try {
        const params = {
          gender: options.gender,
          country: options.country,
          age_group: options.ageGroup,
          min_age: options.minAge,
          max_age: options.maxAge,
          sort_by: options.sortBy,
          order: options.order,
          page: options.page,
          limit: options.limit
        };

        Object.keys(params).forEach(
          (key) => params[key] === undefined && delete params[key]
        );

        const res = await api.get("/profiles", { params });
        const { page, total, total_pages, data } = res.data;

        console.log(`\n📄 Page: ${page}`);
        console.log(`📊 Total: ${total}`);
        console.log(`📚 Total Pages: ${total_pages}\n`);

        console.table(data);

      } catch (err) {
        console.error("❌ Failed to fetch profiles:");
        console.error(err.response?.data || err.message);
      }
    });

  profiles
    .command("get <id>")
    .action(async (id) => {
      try {
        const res = await api.get(`/profiles/${id}`);
        console.log(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch profile:");
        console.error(err.response?.data || err.message);
      }
    });

  profiles
    .command("search <query>")
    .action(async (query) => {
      try {
        const res = await api.get("/profiles/search", {
          params: { q: query }
        });
        console.table(res.data.data);
      } catch (err) {
        console.error("❌ Search failed:");
        console.error(err.response?.data || err.message);
      }
    });

  profiles
    .command("create")
    .requiredOption("--name <name>")
    .action(async ({ name }) => {
      try {
        const res = await api.post("/profiles", { name });
        console.log("✅ Created:", res.data.data);
      } catch (err) {
        console.error("❌ Failed to create profile:");
        console.error(err.response?.data || err.message);
      }
    });

  profiles
    .command("export")
    .option("--format <format>", "csv")
    .option("--gender <gender>")
    .option("--country <country>")
    .option("--min-age <minAge>")
    .option("--max-age <maxAge>")
    .action(async (options) => {
      try {
        const params = {
          format: options.format,
          gender: options.gender,
          country: options.country,
          min_age: options.minAge,
          max_age: options.maxAge
        };

        Object.keys(params).forEach(
          (key) => params[key] === undefined && delete params[key]
        );

        const res = await api.get("/profiles/export", {
          params,
          responseType: "stream"
        });

        const file = `profiles_${Date.now()}.csv`;
        const writer = fs.createWriteStream(file);
        res.data.pipe(writer);

        writer.on("finish", () => {
          console.log(`✅ CSV saved as: ${file}`);
        });

      } catch (err) {
        console.error("❌ Export failed:");
        console.error(err.response?.data || err.message);
      }
    });

};