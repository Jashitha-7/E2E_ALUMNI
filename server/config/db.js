import mongoose from "mongoose";
import env from "./env.js";
import logger from "./logger.js";

const connectDb = async () => {
  if (!env.mongoUri) {
    throw new Error("MONGO_URI is not set.");
  }

  try {
    const connection = await mongoose.connect(env.mongoUri, {
      autoIndex: env.nodeEnv !== "production",
    });

    logger.info(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    logger.error("MongoDB connection failed", error);
    throw error;
  }
};

export default connectDb;
