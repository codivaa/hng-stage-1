import axios from "axios";
import { uuidv7 } from "uuidv7";
import Profile from "../models/Profile.js";
import { classifyAge } from "../utils/classifyAge.js";
import { errorResponse } from "../errors/errorHandler.js";

// helper to remove MongoDB fields
const formatProfile = (profile) => ({
  id: profile.id,
  name: profile.name,
  gender: profile.gender,
  gender_probability: profile.gender_probability,
  sample_size: profile.sample_size,
  age: profile.age,
  age_group: profile.age_group,
  country_id: profile.country_id,
  country_name: profile.country_name,
  country_probability: profile.country_probability,
  created_at: profile.created_at
});

// CREATE PROFILE
export const createProfile = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || (typeof name === "string" && !name.trim())) {
      return errorResponse(res, 400, "Missing or empty name");
    }

    if (typeof name !== "string") {
      return errorResponse(res, 422, "Invalid type");
    }

    const normalizedName = name.trim().toLowerCase();

    const existingProfile = await Profile.findOne({ name: normalizedName });

    if (existingProfile) {
      return res.status(200).json({
        status: "success",
        message: "Profile already exists",
        data: formatProfile(existingProfile)
      });
    }

    let genderRes, ageRes, countryRes;

    try {
      genderRes = await axios.get(`https://api.genderize.io?name=${normalizedName}`);
    } catch {
      return errorResponse(res, 502, "Genderize returned an invalid response");
    }

    try {
      ageRes = await axios.get(`https://api.agify.io?name=${normalizedName}`);
    } catch {
      return errorResponse(res, 502, "Agify returned an invalid response");
    }

    try {
      countryRes = await axios.get(`https://api.nationalize.io?name=${normalizedName}`);
    } catch {
      return errorResponse(res, 502, "Nationalize returned an invalid response");
    }

    const genderData = genderRes.data;
    const ageData = ageRes.data;
    const countryData = countryRes.data;

    if (!genderData.gender || genderData.count === 0) {
      return errorResponse(res, 502, "Genderize returned an invalid response");
    }

    if (ageData.age === null) {
      return errorResponse(res, 502, "Agify returned an invalid response");
    }

    if (!countryData.country || countryData.country.length === 0) {
      return errorResponse(res, 502, "Nationalize returned an invalid response");
    }

    const topCountry = countryData.country.reduce((prev, curr) =>
      curr.probability > prev.probability ? curr : prev
    );

    const profile = await Profile.create({
      id: uuidv7(),
      name: normalizedName,
      gender: genderData.gender.toLowerCase(),
      gender_probability: genderData.probability,
      sample_size: genderData.count,
      age: ageData.age,
      age_group: classifyAge(ageData.age),
      country_id: topCountry.country_id,
      country_name: topCountry.country_id,      
      country_probability: topCountry.probability,
      created_at: new Date().toISOString()
    });

    return res.status(201).json({
      status: "success",
      data: formatProfile(profile)
    });

  } catch (err) {
    return errorResponse(res, 500, "Internal server error");
  }
};



export const getProfiles = async (req, res) => {
  try {
    const {
      gender,
      age_group,
      country_id,
      min_age,
      max_age,
      min_gender_probability,
      min_country_probability,
      sort_by = "created_at",
      order = "desc",
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};

    if (gender) filter.gender = gender.toLowerCase();
    if (age_group) filter.age_group = age_group.toLowerCase();
    if (country_id) filter.country_id = country_id.toUpperCase();

    if (min_age || max_age) {
      filter.age = {};
      if (min_age) filter.age.$gte = Number(min_age);
      if (max_age) filter.age.$lte = Number(max_age);
    }

    if (min_gender_probability) {
      filter.gender_probability = { $gte: Number(min_gender_probability) };
    }

    if (min_country_probability) {
      filter.country_probability = { $gte: Number(min_country_probability) };
    }

    const sort = {
      [sort_by]: order === "asc" ? 1 : -1
    };

    const safePage = Math.max(1, Number(page));
    const safeLimit = Math.min(50, Number(limit)); 
    const skip = (safePage - 1) * safeLimit;

    const total = await Profile.countDocuments(filter);

    const data = await Profile.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(safeLimit);

    return res.json({
      status: "success",
      page: safePage,
      limit: safeLimit,
      total,
      data: data.map(formatProfile) 

     });

  } catch (err) {
    return errorResponse(res, 500, "Internal server error");
  }
};


// GET ONE
export const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ id: req.params.id });

    if (!profile) return errorResponse(res, 404, "Profile not found");

    return res.json({
      status: "success",
      data: formatProfile(profile)
      
    });

  } catch (err) {
    return errorResponse(res, 500, "Internal server error");
  }
};


// SEARCH
export const searchProfiles = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q || typeof q !== "string" || !q.trim()) {
      return errorResponse(res, 400, "Missing or empty parameter");
    }

    const query = q.toLowerCase();

    const filter = {};

    // GENDER
    if (query.includes("female")) {
      filter.gender = "female";
    } else if (query.includes("male")) {
      filter.gender = "male";
    }

    // AGE GROUP
    if (query.includes("child")) filter.age_group = "child";
    if (query.includes("teen")) filter.age_group = "teenager";
    if (query.includes("adult")) filter.age_group = "adult";
    if (query.includes("senior")) filter.age_group = "senior";

    // "young" → special rule
    if (query.includes("young")) {
      filter.age = { $gte: 16, $lte: 24 };
    }

    // ABOVE / BELOW AGE
    const ageMatch = query.match(/above (\d+)/);
    if (ageMatch) {
      filter.age = { ...(filter.age || {}), $gte: Number(ageMatch[1]) };
    }

    const belowMatch = query.match(/below (\d+)/);
    if (belowMatch) {
      filter.age = { ...(filter.age || {}), $lte: Number(belowMatch[1]) };
    }

    // COUNTRY (basic mapping)
    const countryMap = {
      nigeria: "NG",
      kenya: "KE",
      angola: "AO",
      ghana: "GH",
      uganda: "UG"
    };

    for (const country in countryMap) {
      if (query.includes(country)) {
        filter.country_id = countryMap[country];
      }
    }

    // If nothing detected → error
    if (Object.keys(filter).length === 0) {
      return errorResponse(res, 400, "Unable to interpret query");
    }

    // PAGINATION
    const safePage = Math.max(1, Number(page));
    const safeLimit = Math.min(50, Number(limit));
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
      data: data.map(formatProfile)
    });

  } catch (err) {
    return errorResponse(res, 500, "Internal server error");
  }
};


// DELETE
export const deleteProfile = async (req, res) => {
  try {
    const deleted = await Profile.findOneAndDelete({ id: req.params.id });

    if (!deleted) return errorResponse(res, 404, "Profile not found");

    return res.status(204).send();

  } catch (err) {
    return errorResponse(res, 500, "Internal server error");
  }
};