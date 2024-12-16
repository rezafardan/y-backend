import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { UserRole } from "@prisma/client";

// MIDDLEWARE TO AUTHENTICATION ACCESS VALIDATION BY TOKEN
// IF USER CREATE A REQUEST WITHOUT TOKEN, REQUEST CAN BE DROP OR REJECT
const accessValidation = (req: Request, res: Response, next: NextFunction) => {
  // GET HTTP COOKIES
  const accessToken = req.cookies?.accessToken;

  if (!accessToken) {
    res.status(403).json({ message: "Authentication token is missing" });
    return;
  }

  try {
    const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
    if (!ACCESS_TOKEN_SECRET) {
      res.status(500).json({ message: "JWT secret is not set" });
      return;
    }

    // DECODE JWT TOKEN
    const decode = jwt.verify(accessToken, ACCESS_TOKEN_SECRET!) as {
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
