import http from "http";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import swaggerUi from "swagger-ui-express";

import env from "./config/env.js";
import connectDb from "./config/db.js";
import logger from "./config/logger.js";
import swaggerSpec from "./config/swagger.js";
import { errorHandler, notFound } from "./middlewares/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import chatbotRoutes from "./routes/chatbotRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import alumniRoutes from "./routes/alumniRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import initSockets from "./sockets/index.js";
import { setSocketServer } from "./services/notificationService.js";

const app = express();
const apiBase = "/api/v1";
const httpServer = http.createServer(app);
const io = initSockets(httpServer);
setSocketServer(io);

app.use(helmet());
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
}));

const isLocalDevOrigin = (origin) => /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (no Origin header)
    if (!origin) {
      callback(null, true);
      return;
    }

    if (origin === env.clientOrigin) {
      callback(null, true);
      return;
    }

    // In development, allow localhost/127.0.0.1 on any port
    if (env.nodeEnv !== "production" && isLocalDevOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(xss());
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

app.get("/", (req, res) => {
  res.json({ message: "Alumni Association Platform API" });
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(`${apiBase}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(`${apiBase}/health`, healthRoutes);
app.use(`${apiBase}/auth`, authRoutes);
app.use(`${apiBase}/users`, userRoutes);
app.use(`${apiBase}/events`, eventRoutes);
app.use(`${apiBase}/jobs`, jobRoutes);
app.use(`${apiBase}/notifications`, notificationRoutes);
app.use(`${apiBase}/chatbot`, chatbotRoutes);
app.use(`${apiBase}/admin`, adminRoutes);
app.use(`${apiBase}/alumni`, alumniRoutes);
app.use(`${apiBase}/chats`, chatRoutes);

app.use(notFound);
app.use(errorHandler);

const start = async () => {
  try {
    await connectDb();
    httpServer.listen(env.port, () => {
      logger.info(`Server running on port ${env.port}`);
    });
  } catch (error) {
    logger.error("Server failed to start", error);
    process.exit(1);
  }
};

start();
