export const errorResponse = (res, statusCode, message) => {
  // Shared JSON error shape used by controllers/middleware.
  return res.status(statusCode).json({
    status: "error",
    message
  });
};
