import { Request, Response, NextFunction } from "express";
import logger from "../logs/logger";

const logError = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(
    `Error: ${err.message} | Path: ${req.method} ${req.path} | IP: ${req.ip}`
  );
  res.status(500).json({ error: "Internal Server Error" });
};

export default logError;
