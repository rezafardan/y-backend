import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { UserRole } from "@prisma/client";

// MIDDLEWARE TO AUTHENTICATION ACCESS VALIDATION BY TOKEN
// IF USER CREATE A REQUEST WITHOUT TOKEN, REQUEST CAN BE DROP OR REJECT
const accessValidation = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.token;

  if (!token) {
    res.status(403).json({ message: "Authentication token is missing" });
    return;
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      res.status(500).json({ message: "JWT secret is not set" });
      return;
    }

    // DECODE JWT TOKEN
    const decode = jwt.verify(token, jwtSecret!) as {
      id: string;
      username: string;
      role: UserRole;
    };
    req.user = { id: decode.id, username: decode.username, role: decode.role };

    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid token" });
    return;
  }
};

export default accessValidation;
