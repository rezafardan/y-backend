import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";

const prisma = new PrismaClient();

const validationBlogAction =
  (action: string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // GET BODY
      const { userId } = req.body;

      // GET USER AND BLOG DATA
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user || user.deletedAt !== null) {
        res.status(403).json({ message: "User is inactive or does not exist" });
        return;
      }

      // ROLE BASED PERMISSION
      switch (action) {
        // ACTION PUBLISH WITH USER ROLE AND BLOG STATUS APPROVED
        case "publish":
          if (
            user?.role !== "EDITOR" &&
            user?.role !== "SUPERADMIN" &&
            user?.role !== "ADMIN"
          ) {
            res.status(403).json({
              message: "You do not have permission to publish this blog",
            });
            return;
          }
          break;

        // ACTION APPROVE WITH USER ROLE AND STATUS PENDING
        case "approve":
          if (
            user?.role !== "EDITOR" &&
            user?.role !== "SUPERADMIN" &&
            user?.role !== "ADMIN"
          ) {
            res.status(403).json({
              message: "You do not have permission to approve this blog",
            });
            return;
          }
          break;

        // INVALID ACTION
        default:
          res.status(400).json({ message: "Invalid action" });
          return;
      }

      next();
    } catch (error) {
      console.log(error);
      return;
    }
  };

export default validationBlogAction;
