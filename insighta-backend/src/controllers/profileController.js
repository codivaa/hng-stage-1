import { errorResponse } from "../errors/errorHandler.js";
import {
  createProfileRecord,
  deleteProfileById,
  exportProfilesAsCsv,
  getProfileById,
  listProfiles,
  searchProfilesByQuery
} from "../services/profileService.js";

const handleControllerError = (res, err) => {
  if (err.status) {
    return res.status(err.status).json({
      status: "error",
      message: err.message
    });
  }

  console.error(err);
  return errorResponse(res, 500, "Internal server error");
};

export const getProfiles = async (req, res) => {
  try {
    const result = await listProfiles(req.query);
    return res.json(result);
  } catch (err) {
    return handleControllerError(res, err);
  }
};

export const createProfile = async (req, res) => {
  try {
    const data = await createProfileRecord(req.body);

    return res.status(201).json({
      status: "success",
      data
    });
  } catch (err) {
    return handleControllerError(res, err);
  }
};

export const getProfile = async (req, res) => {
  try {
    const data = await getProfileById(req.params.id);

    return res.json({
      status: "success",
      data
    });
  } catch (err) {
    return handleControllerError(res, err);
  }
};

export const searchProfiles = async (req, res) => {
  try {
    const result = await searchProfilesByQuery(req.query);
    return res.json(result);
  } catch (err) {
    return handleControllerError(res, err);
  }
};

export const deleteProfile = async (req, res) => {
  try {
    await deleteProfileById(req.params.id);

    return res.json({
      status: "success",
      message: "Profile deleted"
    });
  } catch (err) {
    return handleControllerError(res, err);
  }
};

export const exportProfiles = async (req, res) => {
  try {
    const csv = await exportProfilesAsCsv(req.query);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="profiles_${Date.now()}.csv"`
    );

    return res.send(csv);
  } catch (err) {
    return handleControllerError(res, err);
  }
};
