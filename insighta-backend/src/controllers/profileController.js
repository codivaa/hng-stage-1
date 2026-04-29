import { uuidv7 } from "uuidv7";
import Profile from "../models/Profile.js";
import { errorResponse } from "../errors/errorHandler.js";

// ==========================
// 🔹 HELPER
// ==========================
const formatProfile = (profile) => ({
id: profile._id,
  name: profile.name,
  gender: profile.gender,
  gender_probability: profile.gender_probability,
  age: profile.age,
  age_group: profile.age_group,
  country_id: profile.country_id,
  country_name: profile.country_name,
  country_probability: profile.country_probability,
  created_at: profile.created_at
});

// ==========================
// 🔹 GET ALL PROFILES
// ==========================
export const getProfiles = async (req, res) => {
  try {
    const {
      gender,
      age_group,
      country_id,
      country,
      min_age,
      max_age,
      sort_by,
      order,
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};

    if (gender) filter.gender = gender.toLowerCase();
    if (age_group) filter.age_group = age_group.toLowerCase();

    // ✅ Fix country handling
    if (country || country_id) {
      filter.country_id = (country || country_id).toUpperCase();
    }

    // ✅ Age range
    if (min_age || max_age) {
      filter.age = {};
      if (min_age) filter.age.$gte = Number(min_age);
      if (max_age) filter.age.$lte = Number(max_age);
    }

    // ✅ Pagination
    const safePage = Math.max(1, Number(page));
    const safeLimit = Math.min(50, Number(limit) || 10);
    const skip = (safePage - 1) * safeLimit;

    // ✅ Sorting (safe)
    let sort = {};
    const allowedSortFields = ["age", "created_at", "name"];

    if (sort_by && allowedSortFields.includes(sort_by)) {
      sort[sort_by] = order === "desc" ? -1 : 1;
    }

    const total = await Profile.countDocuments(filter);

    const data = await Profile.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(safeLimit);

    const totalPages = Math.ceil(total / safeLimit);

    return res.json({
      status: "success",
      page: safePage,
      limit: safeLimit,
      total,
      total_pages: totalPages,
      links: {
        self: `/api/v1/profiles?page=${safePage}&limit=${safeLimit}`,
        next:
          safePage * safeLimit < total
            ? `/api/v1/profiles?page=${safePage + 1}&limit=${safeLimit}`
            : null,
        prev:
          safePage > 1
            ? `/api/v1/profiles?page=${safePage - 1}&limit=${safeLimit}`
            : null
      },
      data: data.map(formatProfile)
    });

  } catch (err) {
    console.error(err);
    return errorResponse(res, 500, "Internal server error");
  }
};

// ==========================
// 🔹 CREATE PROFILE (ADMIN)
// ==========================
export const createProfile = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        status: "error",
        message: "Name is required"
      });
    }

    // 🚀 Replace with real API later (for now mock works)
    const profileData = {
      id: uuidv7(), // ✅ THIS FIXES YOUR ERROR
      name,
      gender: "female",
      gender_probability: 0.95,
      age: Math.floor(Math.random() * 40) + 20,
      age_group: "adult",
      country_id: "US",
      country_name: "United States",
      country_probability: 0.9
    };

    const profile = await Profile.create(profileData);

    return res.status(201).json({
      status: "success",
      data: formatProfile(profile)
    });

  } catch (err) {
    console.error(err);
    return errorResponse(res, 500, "Internal server error");
  }
};

// ==========================
// 🔹 GET SINGLE PROFILE
// ==========================
export const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({
        status: "error",
        message: "Profile not found"
      });
    }

    return res.json({
      status: "success",
      data: formatProfile(profile)
    });

  } catch (err) {
    return errorResponse(res, 500, "Internal server error");
  }
};

// ==========================
// 🔹 SEARCH PROFILES
// ==========================
export const searchProfiles = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        status: "error",
        message: "Search query required"
      });
    }

    const query = q.toLowerCase();

    const filter = {};

    // 🔥 Interpret keywords

    // Gender
    if (query.includes("male")) filter.gender = "male";
    if (query.includes("female")) filter.gender = "female";

    // Country
    if (query.includes("nigeria")) filter.country_id = "NG";
    if (query.includes("china")) filter.country_id = "CN";

    // Age group
    if (query.includes("young")) {
      filter.age = { $lte: 35 };
    }

    if (query.includes("old") || query.includes("senior")) {
      filter.age = { $gte: 60 };
    }

    // Pagination
    const safePage = Math.max(1, Number(page));
    const safeLimit = Math.min(50, Number(limit) || 10);
    const skip = (safePage - 1) * safeLimit;

    const total = await Profile.countDocuments(filter);

    const data = await Profile.find(filter)
      .skip(skip)
      .limit(safeLimit);

    return res.json({
      status: "success",
      page: safePage,
      limit: safeLimit,
      total,
      total_pages: Math.ceil(total / safeLimit),
      data: data.map(formatProfile)
    });

  } catch (err) {
    console.error(err);
    return errorResponse(res, 500, "Internal server error");
  }
};

// ==========================
// 🔹 DELETE PROFILE (ADMIN)
// ==========================
export const deleteProfile = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);

    if (!profile) {
      return res.status(404).json({
        status: "error",
        message: "Profile not found"
      });
    }

    await profile.deleteOne();

    return res.json({
      status: "success",
      message: "Profile deleted"
    });

  } catch (err) {
    return errorResponse(res, 500, "Internal server error");
  }
};

export const exportProfiles = async (req, res) => {
  try {
    const { gender, country, format = "csv" } = req.query;

    const filter = {};

    if (gender) filter.gender = gender.toLowerCase();
    if (country) filter.country_id = country.toUpperCase();

    const profiles = await Profile.find(filter);

    // ❌ If no data
    if (!profiles.length) {
      return res.status(404).json({
        status: "error",
        message: "No profiles found"
      });
    }

    // ✅ Convert to CSV
    const csvHeader = "id,name,gender,age,country\n";

    const csvRows = profiles.map(p =>
      `${p._id},${p.name},${p.gender},${p.age},${p.country_id}`
    );

    const csv = csvHeader + csvRows.join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=profiles.csv");

    return res.send(csv);

  } catch (err) {
    console.error("EXPORT ERROR:", err);
    return res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
};