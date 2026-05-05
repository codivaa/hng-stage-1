import { Readable } from "stream";
import csv from "csv-parser";
import Profile from "../models/Profile.js";
import { invalidateCache } from "../utils/cache.js";

const VALID_GENDERS = ["male", "female"];
const CHUNK_SIZE = 1000;

const validateRow = (row) => {
  if (!row.name || !row.name.trim()) return "missing_fields";
  if (!row.gender || !VALID_GENDERS.includes(row.gender.toLowerCase().trim())) return "invalid_gender";
  if (row.age !== undefined && row.age !== "") {
    const age = Number(row.age);
    if (isNaN(age) || age < 0) return "invalid_age";
  }
  return null;
};

export const uploadCsv = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ status: "error", message: "No file uploaded" });
  }

  const stats = {
    total_rows: 0,
    inserted: 0,
    skipped: 0,
    reasons: {
      duplicate_name: 0,
      invalid_age: 0,
      invalid_gender: 0,
      missing_fields: 0,
      malformed: 0
    }
  };

  const validRows = [];

  const processChunk = async (chunk) => {
    if (chunk.length === 0) return;

    const names = chunk.map(r => r.name);
    const existing = await Profile.find({ name: { $in: names } }).select("name");
    const existingNames = new Set(existing.map(p => p.name));

    const toInsert = [];
    for (const row of chunk) {
      if (existingNames.has(row.name)) {
        stats.skipped++;
        stats.reasons.duplicate_name++;
      } else {
        toInsert.push(row);
      }
    }

    if (toInsert.length > 0) {
      try {
        await Profile.insertMany(toInsert, { ordered: false });
        stats.inserted += toInsert.length;
      } catch (err) {
        if (err.writeErrors) {
          stats.inserted += toInsert.length - err.writeErrors.length;
          stats.skipped += err.writeErrors.length;
          err.writeErrors.forEach(() => stats.reasons.duplicate_name++);
        }
      }
    }
  };

  const csvString = req.file.buffer
    .toString('utf8')
    .replace(/^\uFEFF/, '')
    .replace(/^\u00EF\u00BB\u00BF/, '')
    .replace(/^[\u200B\u200C\u200D\uFEFF]/, '');

  const stream = Readable.from(csvString);

  await new Promise((resolve, reject) => {
    stream
      .pipe(csv({
        mapHeaders: ({ header }) => header.trim().replace(/^[^a-zA-Z]+/, '')
      }))
      .on("data", (row) => {
        stats.total_rows++;

        const validationError = validateRow(row);
        if (validationError) {
          stats.skipped++;
          stats.reasons[validationError] = (stats.reasons[validationError] || 0) + 1;
          return;
        }

        validRows.push({
          name: row.name.trim(),
          gender: row.gender.toLowerCase().trim(),
          gender_probability: row.gender_probability ? Number(row.gender_probability) : null,
          age: row.age ? Number(row.age) : null,
          age_group: row.age_group ? row.age_group.toLowerCase().trim() : null,
          country_id: row.country_id ? row.country_id.toUpperCase().trim() : null,
          country_name: row.country_name ? row.country_name.trim() : null,
          country_probability: row.country_probability ? Number(row.country_probability) : null,
          created_at: new Date()
        });

        if (validRows.length >= CHUNK_SIZE) {
          const chunk = validRows.splice(0, CHUNK_SIZE);
          processChunk(chunk).catch(reject);
        }
      })
      .on("end", async () => {
        try {
          if (validRows.length > 0) {
            await processChunk(validRows.splice(0));
          }
          resolve();
        } catch (err) {
          reject(err);
        }
      })
      .on("error", (err) => {
        console.error("CSV parse error:", err);
        stats.skipped++;
        stats.reasons.malformed++;
        resolve();
      });
  });

  await invalidateCache("profiles:list:*");
  await invalidateCache("profiles:search:*");

  return res.json({
    status: "success",
    total_rows: stats.total_rows,
    inserted: stats.inserted,
    skipped: stats.skipped,
    reasons: stats.reasons
  });
};