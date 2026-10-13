import { Router } from "express";
import {
  createDocumentController,
  deleteDocumentController,
  downloadDocumentController,
  getDocumentController,
  listDocumentController,
  updateDocumentController,
} from "../controllers/document.controller";
import { requireAdmin } from "../middlewares/admin.middleware";
import { requireAuth } from "../middlewares/auth.middleware";
import { uploadDocument } from "../middlewares/upload.middleware";

const router = Router();

router.post(
  "/",
  requireAuth,
  uploadDocument.single("file"),
  createDocumentController,
);
router.get("/", requireAuth, listDocumentController);
router.get("/:id", requireAuth, getDocumentController);
router.patch("/:id", requireAuth, requireAdmin, updateDocumentController);
router.delete("/:id", requireAuth, requireAdmin, deleteDocumentController);
router.get("/:id/download", requireAuth, downloadDocumentController);

export default router;
