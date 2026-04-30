import { uuidv7 } from "uuidv7";
import Profile from "../models/Profile.js";
import { errorResponse } from "../errors/errorHandler.js";

const formatProfile = (profile) => ({
  id: profile.id || profile._id,
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

const buildFilter = ({ gender, age_group, country_id, country, min_age, max_age }) => {
  const filter = {};

  if (gender) filter.gender = gender.toLowerCase();
  if (age_group) filter.age_group = age_group.toLowerCase();

  const normalizedCountry = country || country_id;
  if (normalizedCountry) filter.country_id = normalizedCountry.toUpperCase();

  if (min_age || max_age) {
    filter.age = {};
    if (min_age !== undefined) filter.age.$gte = Number(min_age);
    if (max_age !== undefined) filter.age.$lte = Number(max_age);
  }

  return filter;
};

const buildSort = (sort_by, order) => {
  const allowedSortFields = ["age", "created_at", "name"];
  if (!sort_by || !allowedSortFields.includes(sort_by)) return {};
  return { [sort_by]: order === "desc" ? -1 : 1 };
};

const buildPagination = (page, limit) => {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(50, Number(limit) || 10);
  const skip = (safePage - 1) * safeLimit;
  return { safePage, safeLimit, skip };
};

const buildPageLink = (basePath, query, page, limit) => {
  const params = new URLSearchParams();

  Object.entries(query || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (key === "page" || key === "limit") return;
    params.set(key, String(value));
  });

  params.set("page", String(page));
  params.set("limit", String(limit));

  return `${basePath}?${params.toString()}`;
};

export const getProfiles = async (req, res) => {
  try {
    const { page, limit, sort_by, order } = req.query;

    const filter = buildFilter(req.query);
    const sort = buildSort(sort_by, order);
    const { safePage, safeLimit, skip } = buildPagination(page, limit);

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
        self: buildPageLink("/api/v1/profiles", req.query, safePage, safeLimit),
        next:
          safePage * safeLimit < total
            ? buildPageLink("/api/v1/profiles", req.query, safePage + 1, safeLimit)
            : null,
        prev:
          safePage > 1
            ? buildPageLink("/api/v1/profiles", req.query, safePage - 1, safeLimit)
            : null
      },
      data: data.map(formatProfile)
    });
  } catch (err) {
    console.error(err);
    return errorResponse(res, 500, "Internal server error");
  }
};

export const createProfile = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        status: "error",
        message: "Name is required"
      });
    }

    const profileData = {
      id: uuidv7(),
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

export const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ id: req.params.id }) || await Profile.findById(req.params.id);

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

export const searchProfiles = async (req, res) => {
  try {
    const { q, page, limit, sort_by, order } = req.query;

    if (!q) {
      return res.status(400).json({
        status: "error",
        message: "Search query required"
      });
    }

    const query = q.toLowerCase();
    const filter = {};

    if (query.includes("male")) filter.gender = "male";
    if (query.includes("female")) filter.gender = "female";
    if (query.includes("adult")) filter.age_group = "adult";
    if (query.includes("young")) filter.age = { $lte: 35 };
    if (query.includes("old") || query.includes("senior")) filter.age = { $gte: 60 };
    if (query.includes("nigeria")) filter.country_id = "NG";
    if (query.includes("china")) filter.country_id = "CN";

    const sort = buildSort(sort_by, order);
    const { safePage, safeLimit, skip } = buildPagination(page, limit);

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
        self: buildPageLink("/api/v1/profiles/search", req.query, safePage, safeLimit),
        next:
          safePage * safeLimit < total
            ? buildPageLink("/api/v1/profiles/search", req.query, safePage + 1, safeLimit)
            : null,
        prev:
          safePage > 1
            ? buildPageLink("/api/v1/profiles/search", req.query, safePage - 1, safeLimit)
            : null
      },
      data: data.map(formatProfile)
    });
  } catch (err) {
    console.error(err);
    return errorResponse(res, 500, "Internal server error");
  }
};

export const deleteProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ id: req.params.id }) || await Profile.findById(req.params.id);

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
    const { gender, age_group, country, country_id, min_age, max_age, sort_by, order, format = "csv" } = req.query;

    if (format !== "csv") {
      return res.status(400).json({
        status: "error",
        message: "Only csv export is supported"
      });
    }

    const filter = buildFilter({ gender, age_group, country, country_id, min_age, max_age });
    const sort = buildSort(sort_by, order);

    const profiles = await Profile.find(filter).sort(sort);
    const csvHeader = "id,name,gender,gender_probability,age,age_group,country_id,country_name,country_probability,created_at";
    const csvRows = profiles.map((p) =>
      [
        p.id || p._id,
        p.name,
        p.gender,
        p.gender_probability,
        p.age,
        p.age_group,
        p.country_id,
        p.country_name,
        p.country_probability,
        p.created_at?.toISOString()
      ]
        .map((value) => (value === undefined || value === null ? "" : String(value).replace(/"/g, '""')))
        .map((value) => (value.includes(",") || value.includes("\n") ? `"${value}"` : value))
        .join(",")
    );

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="profiles_${Date.now()}.csv"`
    );

    return res.send([csvHeader, ...csvRows].join("\n"));
  } catch (err) {
    console.error("EXPORT ERROR:", err);
    return res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
};