import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const accessValidation = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token;

  if (!token) {
    res.status(403).json({ message: "Token not available" });
    return;
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      res.status(500).json({ message: "JWT secret is not set" });
      return;
    }
    const decode = jwt.verify(token, jwtSecret!) as {
      id: string;
      username: string;
    };
    req.user = { id: decode.id, username: decode.username };

    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid token" });
    return;
  }
};

export default accessValidation;
