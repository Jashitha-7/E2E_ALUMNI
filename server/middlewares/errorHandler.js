import logger from "../config/logger.js";

const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Not Found - ${req.originalUrl}`));
};

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  logger.error(err.message, { stack: err.stack, path: req.originalUrl });

  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? "🥷" : err.stack,
  });
};

export { notFound, errorHandler };
