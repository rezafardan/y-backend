import express from "express";

// CONTROLLER
import userController from "../controllers/user.controller";

// MIDDLEWARE
import { authorizeRole } from "../middlewares/authorizeRole.middleware";
import { uploadProfile } from "../middlewares/upload.middleware";
import compressImage from "../middlewares/imageCompression.middleware";

// THIS FILE CONFIGURE ROUTES FOR USER SERVICE ENDPOINT
const router = express.Router();

// CHECK USER DATA BUT ONLY DATA USER LOGGED IN
//   http://hostname/api/user/me
router.get("/me", userController.getLoggedInUser);

// UPDATE USER DATA BUT ONLY DATA USER LOGGED IN
//   http://hostname/api/user/me
router.patch(
  "/me",
  uploadProfile.single("profileImage"),
  compressImage("profile-image"),
  userController.updateLoggedInUser
);

// CREATE A NEW USER
//   POST MULTIPART/FORM-DATA
//   http://hostname/api/user
router.post(
  "/",
  authorizeRole(["ADMINISTRATOR"]),
  uploadProfile.single("profileImage"),
  compressImage("profile-image"),
  userController.createNewUser
);

// READ ALL USER DATA
//   http://hostname/api/user
router.get("/", authorizeRole(["ADMINISTRATOR"]), userController.getAllUsers);

// READ USER DATA BY ID
//   http://hostname/api/user/ID?
router.get(
  "/:id",
  authorizeRole(["ADMINISTRATOR"]),
  userController.getUserById
);

// UPDATE USER DATA BY ID
//   http://hostname/api/user/ID?
router.patch(
  "/:id",
  authorizeRole(["ADMINISTRATOR"]),
  uploadProfile.single("profileImage"),
  userController.updateUser
);

// SOFT DELETE USER DATA BY ID
//   http://hostname/api/user/ID?
router.patch(
  "/softdelete/:id",
  authorizeRole(["ADMINISTRATOR"]),
  userController.softDeleteUser
);

// RESTORE USER SOFT DELETE BY ID
//   http://hostname/api/user/ID?
router.patch(
  "/restore/:id",
  authorizeRole(["ADMINISTRATOR"]),
  userController.restoreUserSoftDelete
);

// PERMANENT DELETE USER DATA BY ID
//   http://hostname/api/user/ID?
router.delete(
  "/:id",
  authorizeRole(["ADMINISTRATOR"]),
  userController.deleteUserPermanent
);

// CHECK USERNAME FOR CREATE A NEW USER DATA
//   http://hostname/api/user/check-username
router.post(
  "/check-username",
  authorizeRole(["ADMINISTRATOR"]),
  userController.checkUsername
);

export default router;
