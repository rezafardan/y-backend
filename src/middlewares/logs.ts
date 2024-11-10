import { Request, Response, NextFunction } from "express";

const logRequest = (req: Request, res: Response, next: NextFunction) => {
  console.log(`Log request terjadi di PATH: ${req.path}`);
  console.log(req.user);
  next();
};

export default logRequest;
