import express from "express";
import userController from "../controllers/user";

const router = express.Router();

// CREATE
router.post("/", userController.createNewUser);
// READ
router.get("/", userController.getAllUsers);
// READ BY ID
router.get("/:id", userController.getUserById);
// UPDATE
router.patch("/:id", userController.updateUser);
// SOFT DELETE
router.patch("/softdelete/:id", userController.softDeleteUser);
// RESTORE USER SOFT DELETE
router.patch("/restore/:id", userController.restoreUserSoftDelete);
// PERMANENT DELETE
router.delete("/:id", userController.deleteUserPermanent);

export default router;
