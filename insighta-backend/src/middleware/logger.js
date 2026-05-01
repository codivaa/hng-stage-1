export const logger = (req, res, next) => {
  // Capture request start time so I can log how long the request took.
  const start = Date.now();

  res.on("finish", () => {
    // This runs after the response is sent, so statusCode and duration are final.
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });

  next();
};
