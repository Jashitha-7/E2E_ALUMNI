import jwt from "jsonwebtoken";
import env from "../config/env.js";

const signAccessToken = (userId) =>
  jwt.sign({ id: userId }, env.jwtAccessSecret, { expiresIn: env.jwtAccessExpiresIn });

const signRefreshToken = (userId) =>
  jwt.sign({ id: userId }, env.jwtRefreshSecret, { expiresIn: env.jwtRefreshExpiresIn });

const verifyAccessToken = (token) => jwt.verify(token, env.jwtAccessSecret);

const verifyRefreshToken = (token) => jwt.verify(token, env.jwtRefreshSecret);

export { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken };
