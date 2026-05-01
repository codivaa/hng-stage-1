export const requireApiVersion = (req, res, next) => {
  // Protected API routes require clients to state the API version they expect.
  const version = req.header("X-API-Version");

  // Missing version means the client did not follow the API contract.
  if (!version) {
    return res.status(400).json({
      status: "error",
      message: "API version header required"
    });
  }

  // Only version 1 is supported right now.
  if (version !== "1") {
    return res.status(400).json({
      status: "error",
      message: "Unsupported API version"
    });
  }

  // Version is supported, so continue to the controller.
  next();
};
