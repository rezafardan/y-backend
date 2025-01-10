import { Request, Response, NextFunction, RequestHandler } from "express";

// MODELS
import { UserRole } from "@prisma/client";

export const authorizeRole = (roles: UserRole[]): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user as {
      id: string;
      username: string;
      role: UserRole;
      deletedAt: Date | null;
    };

    if (!user) {
      res
        .status(403)
        .json({ message: "Access denied. User not authenticated" });
      return;
    }

    if (user.deletedAt) {
      res.status(403).json({
        message: "User is inactive and cannot perform this action",
      });
      return;
    }

    if (!roles.includes(user.role)) {
      res.status(403).json({
        message: `You do not have permission to perform this action. Required role: ${roles.join(
          " or "
        )}`,
      });
      return;
    }

    next();
  };
};
