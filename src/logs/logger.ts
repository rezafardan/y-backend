import { createLogger, format, transports } from "winston";

// WINSTON LOGGER TO LOG ALL REQUEST
const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new transports.Console(),
    // ONLY DISABLE ON VERCEL PRODUCTION
    // new transports.File({ filename: "logs/error.log", level: "error" }),
    // new transports.File({ filename: "logs/all-log.log" }),
  ],
});

export default logger;
