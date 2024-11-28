import express from "express";
import { authorizeRole } from "../middleware/roleAuthorization.middleware";
import userController from "../controllers/user.controller";
import { uploadProfile } from "../middleware/upload.middleware";

const router = express.Router();

// CREATE
router.post(
  "/",
  authorizeRole(["ADMINISTRATOR"]),
  uploadProfile.single("profileImage"),
  userController.createNewUser
);

// READ
router.get("/", authorizeRole(["ADMINISTRATOR"]), userController.getAllUsers);

// READ BY ID
router.get(
  "/:id",
  authorizeRole(["ADMINISTRATOR"]),
  userController.getUserById
);

// UPDATE
router.patch(
  "/:id",
  authorizeRole(["ADMINISTRATOR"]),
  userController.updateUser
);

// SOFT DELETE
router.patch(
  "/softdelete/:id",
  authorizeRole(["ADMINISTRATOR"]),
  userController.softDeleteUser
);

// RESTORE USER SOFT DELETE
router.patch(
  "/restore/:id",
  authorizeRole(["ADMINISTRATOR"]),
  userController.restoreUserSoftDelete
);

// PERMANENT DELETE
router.delete(
  "/:id",
  authorizeRole(["ADMINISTRATOR"]),
  userController.deleteUserPermanent
);

// CHECK USERNAME
router.post(
  "/check-username",
  authorizeRole(["ADMINISTRATOR"]),
  userController.checkUsername
);

export default router;
