import { Router } from "express";
import {
  createUserController,
  deleteUserController,
  disableUserController,
  enableUserController,
  getUser,
  getUsers,
  updateUserController,
} from "../controllers/user.controller";
import { requireAdmin } from "../middlewares/admin.middleware";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", requireAuth, requireAdmin, getUsers);
router.post("/", requireAuth, requireAdmin, createUserController);
router.get("/:id", requireAuth, requireAdmin, getUser);
router.patch("/:id", requireAuth, requireAdmin, updateUserController);
router.patch("/:id/disable", requireAuth, requireAdmin, disableUserController);
router.patch("/:id/enable", requireAuth, requireAdmin, enableUserController);
router.delete("/:id", requireAuth, requireAdmin, deleteUserController);

export default router;
