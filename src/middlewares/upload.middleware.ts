import fs from "node:fs";
import path from "node:path";
import multer, { FileFilterCallback } from "multer";

const uploadDirectory = process.env.UPLOAD_DIR ?? "uploads";
const maxFileSize = Number(process.env.MAX_FILE_SIZE ?? 5 * 1024 * 1024);
export const allowedExtensions = new Set([
  ".pdf",
  ".xls",
  ".xlsx",
  ".doc",
  ".docx",
  ".csv",
  ".txt",
  ".md",
]);

const destination = path.resolve(process.cwd(), uploadDirectory);
fs.mkdirSync(destination, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, destination);
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const uniqueIdentifier = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    callback(null, `${uniqueIdentifier}${extension}`);
  },
});

const fileFilter = (
  _req: Express.Request,
  _file: Express.Multer.File,
  callback: FileFilterCallback,
) => {
  return callback(null, true);
};

export const uploadDocument = multer({
  storage,
  limits: {
    fileSize: maxFileSize,
    files: 1,
  },
  fileFilter,
});
