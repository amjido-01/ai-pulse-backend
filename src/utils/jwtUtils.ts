import jwt from "jsonwebtoken";

export const generateAccessToken = (user: { id: string; email: string }) => {
    return jwt.sign(user, process.env.JWT_SECRET!, { expiresIn: "1h" });
  };
  
  export const generateRefreshToken = (user: { id: string; email: string }) => {
    return jwt.sign(user, process.env.JWT_SECRET!, { expiresIn: "7d" });
  };