import { errorResponse } from "../errors/errorHandler.js";

export const authorize = (role) => {
  return (req, res, next) => {

    // Step 1: make sure user exists (comes from authenticate)
    if (!req.user) {
      return errorResponse(res, 401, "Unauthorized");
    }

    // Step 2: check role
    if (req.user.role !== role) {
      return errorResponse(res, 403, "Forbidden");
    }

    // Step 3: allow request
    next();
  };
};