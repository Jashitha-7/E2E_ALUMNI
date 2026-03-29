import env from "../config/env.js";
import User from "../models/User.js";
import { verifyAccessToken } from "../services/tokenService.js";

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
      res.status(401);
      throw new Error("Not authorized, token missing");
    }

    if (!env.jwtAccessSecret) {
      res.status(500);
      throw new Error("JWT access secret is not configured");
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      res.status(401);
      throw new Error("Not authorized, user not found");
    }

    if (user.status === "banned") {
      res.status(403);
      throw new Error("User is banned");
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401);
    next(error);
  }
};

export default protect;
