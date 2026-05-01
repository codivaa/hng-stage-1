import jwt from "jsonwebtoken";

export const generateAccessToken = (user) => {
  // Access token is short-lived and carries the user id and role for authorization.
  return jwt.sign(
    {
      id: user.id,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "3m" }
  );
};

export const generateRefreshToken = (user) => {
  // Refresh token is also short-lived and is stored server-side for rotation checks.
  return jwt.sign(
    {
      id: user.id
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "5m" }
  );
};
