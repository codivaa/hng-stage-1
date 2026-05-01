import { errorResponse } from "../errors/errorHandler.js";

export const authorize = (role) => {
  return (req, res, next) => {

    // req.user comes from protect middleware after JWT verification.
    if (!req.user) {
      return errorResponse(res, 401, "Unauthorized");
    }

    // Only allow users whose role matches the required role, such as "admin".
    if (req.user.role !== role) {
      return errorResponse(res, 403, "Forbidden");
    }

    // Role is valid, so the request can continue to the controller.
    next();
  };
};
