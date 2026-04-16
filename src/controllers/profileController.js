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
  country_probability: profile.country_probability,
  created_at: profile.created_at
});

// CREATE PROFILE
export const createProfile = async (req, res) => {
 try {
  const { name } = req.body;

  // 400 → Missing or empty
  if (!name || (typeof name === "string" && !name.trim())) {
    return errorResponse(res, 400, "Missing or empty name");
  }

  // 422 → Invalid type
  if (typeof name !== "string") {
    return errorResponse(res, 422, "Invalid type");
  }

  const normalizedName = name.trim().toLowerCase();

  // IDEMPOTENCY
  const existingProfile = await Profile.findOne({ name: normalizedName });

  if (existingProfile) {
    return res.status(200).json({
      status: "success",
      message: "Profile already exists",
      data: formatProfile(existingProfile)
    });
  }
  
    // CALL APIs
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


// GET ALL
export const getProfiles = async (req, res) => {
  try {
    const { gender, country_id, age_group } = req.query;

    const filter = {};

    if (gender) filter.gender = gender.toLowerCase();
    if (country_id) filter.country_id = country_id.toUpperCase();
    if (age_group) filter.age_group = age_group.toLowerCase();

    const profiles = await Profile.find(filter);

    return res.json({
      status: "success",
      count: profiles.length,
      data: profiles.map(profile => ({
      id: profile.id,
      name: profile.name,
      gender: profile.gender,
      age: profile.age,
      age_group: profile.age_group,
      country_id: profile.country_id
    }))
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