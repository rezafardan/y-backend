import express from "express";
import { authorizeRole } from "../middleware/roleAuthorization";
import userController from "../controllers/user.controller";

const router = express.Router();

// CREATE
router.post("/", authorizeRole(["SUPERADMIN"]), userController.createNewUser);

// READ
router.get(
  "/",
  authorizeRole(["SUPERADMIN", "ADMIN"]),
  userController.getAllUsers
);

// READ BY ID
router.get(
  "/:id",
  authorizeRole(["SUPERADMIN", "ADMIN"]),
  userController.getUserById
);

// UPDATE
router.patch("/:id", authorizeRole(["SUPERADMIN"]), userController.updateUser);

// SOFT DELETE
router.patch(
  "/softdelete/:id",
  authorizeRole(["SUPERADMIN"]),
  userController.softDeleteUser
);

// RESTORE USER SOFT DELETE
router.patch(
  "/restore/:id",
  authorizeRole(["SUPERADMIN"]),
  userController.restoreUserSoftDelete
);

// PERMANENT DELETE
router.delete(
  "/:id",
  authorizeRole(["SUPERADMIN"]),
  userController.deleteUserPermanent
);

// CHECK USERNAME
router.post(
  "/check-username",
  authorizeRole(["SUPERADMIN"]),
  userController.checkUsername
);

export default router;
