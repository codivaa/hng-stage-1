import { uuidv7 } from "uuidv7";
import Profile from "../models/Profile.js";

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
  // Convert query parameters into a MongoDB filter object.
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
  // Only allow sorting by fields I expect, so random query fields are ignored.
  const allowedSortFields = ["age", "created_at", "name"];
  if (!sort_by || !allowedSortFields.includes(sort_by)) return {};
  return { [sort_by]: order === "desc" ? -1 : 1 };
};

const buildPagination = (page, limit) => {
  // Normalize pagination values and cap the limit to avoid huge responses.
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

const buildSearchFilter = (searchTerm) => {
  // Convert simple natural-language search text into profile filters.
  const query = searchTerm.toLowerCase();
  const filter = {};

  if (query.includes("male")) filter.gender = "male";
  if (query.includes("female")) filter.gender = "female";
  if (query.includes("adult")) filter.age_group = "adult";
  if (query.includes("young")) filter.age = { $lte: 35 };
  if (query.includes("old") || query.includes("senior")) filter.age = { $gte: 60 };
  if (query.includes("nigeria")) filter.country_id = "NG";
  if (query.includes("china")) filter.country_id = "CN";

  return filter;
};

const getPaginatedProfiles = async ({ query, filter, basePath }) => {
  // Shared pagination logic for both list and search endpoints.
  const { page, limit, sort_by, order } = query;
  const sort = buildSort(sort_by, order);
  const { safePage, safeLimit, skip } = buildPagination(page, limit);

  const total = await Profile.countDocuments(filter);
  const data = await Profile.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(safeLimit);

  const totalPages = Math.ceil(total / safeLimit);

  return {
    status: "success",
    page: safePage,
    limit: safeLimit,
    total,
    total_pages: totalPages,
    links: {
      self: buildPageLink(basePath, query, safePage, safeLimit),
      next:
        safePage * safeLimit < total
          ? buildPageLink(basePath, query, safePage + 1, safeLimit)
          : null,
      prev:
        safePage > 1
          ? buildPageLink(basePath, query, safePage - 1, safeLimit)
          : null
    },
    data: data.map(formatProfile)
  };
};

export const listProfiles = async (query) => {
  return getPaginatedProfiles({
    query,
    filter: buildFilter(query),
    basePath: "/api/profiles"
  });
};

export const searchProfilesByQuery = async (query) => {
  if (!query.q) {
    const error = new Error("Search query required");
    error.status = 400;
    throw error;
  }

  return getPaginatedProfiles({
    query,
    filter: buildSearchFilter(query.q),
    basePath: "/api/profiles/search"
  });
};

export const createProfileRecord = async ({ name }) => {
  // Profile creation currently generates the analytics fields automatically.
  if (!name) {
    const error = new Error("Name is required");
    error.status = 400;
    throw error;
  }

  const profile = await Profile.create({
    id: uuidv7(),
    name,
    gender: "female",
    gender_probability: 0.95,
    age: Math.floor(Math.random() * 40) + 20,
    age_group: "adult",
    country_id: "US",
    country_name: "United States",
    country_probability: 0.9
  });

  return formatProfile(profile);
};

export const findProfileById = async (id) => {
  // Support both the custom UUID field and MongoDB's _id.
  const profile = await Profile.findOne({ id }) || await Profile.findById(id);

  if (!profile) {
    const error = new Error("Profile not found");
    error.status = 404;
    throw error;
  }

  return profile;
};

export const getProfileById = async (id) => {
  const profile = await findProfileById(id);
  return formatProfile(profile);
};

export const deleteProfileById = async (id) => {
  const profile = await findProfileById(id);
  await profile.deleteOne();
};

export const exportProfilesAsCsv = async (query) => {
  // Export uses the same filter/sort logic as listing, then formats rows as CSV.
  const { gender, age_group, country, country_id, min_age, max_age, sort_by, order, format = "csv" } = query;

  if (format !== "csv") {
    const error = new Error("Only csv export is supported");
    error.status = 400;
    throw error;
  }

  const filter = buildFilter({ gender, age_group, country, country_id, min_age, max_age });
  const sort = buildSort(sort_by, order);
  const profiles = await Profile.find(filter).sort(sort);
  const csvHeader = "id,name,gender,gender_probability,age,age_group,country_id,country_name,country_probability,created_at";
  const csvRows = profiles.map((profile) =>
    [
      profile.id || profile._id,
      profile.name,
      profile.gender,
      profile.gender_probability,
      profile.age,
      profile.age_group,
      profile.country_id,
      profile.country_name,
      profile.country_probability,
      profile.created_at?.toISOString()
    ]
      .map((value) => (value === undefined || value === null ? "" : String(value).replace(/"/g, '""')))
      .map((value) => (value.includes(",") || value.includes("\n") ? `"${value}"` : value))
      .join(",")
  );

  return [csvHeader, ...csvRows].join("\n");
};
