import { Request, Response, NextFunction } from "express";

// LOGGER WINSTON
import logger from "../logs/logger";

const logRequest = (req: Request, res: Response, next: NextFunction) => {
  logger.info(`Request: ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
};

export default logRequest;
