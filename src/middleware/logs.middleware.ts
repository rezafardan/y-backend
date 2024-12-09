import { Request, Response, NextFunction } from "express";
import prisma from "../prisma/prisma";

const logRequest = (req: Request, res: Response, next: NextFunction) => {
  console.log(`Log request terjadi di PATH: ${req.path}`);

  next();
};

export default logRequest;
