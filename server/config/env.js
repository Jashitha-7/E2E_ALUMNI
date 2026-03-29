import dotenv from "dotenv";

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  mongoUri: process.env.MONGO_URI || "",
  jwtSecret: process.env.JWT_SECRET || "",
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || "",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || "",
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  dialogflow: {
    projectId: process.env.DIALOGFLOW_PROJECT_ID || "",
    clientEmail: process.env.DIALOGFLOW_CLIENT_EMAIL || "",
    privateKey: (process.env.DIALOGFLOW_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
  },
};

export default env;
