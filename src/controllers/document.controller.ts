import path from "node:path";
import { NextFunction, Request, Response } from "express";
import { AppError } from "../middlewares/error.middleware";
import { allowedExtensions } from "../middlewares/upload.middleware";
import { idParamSchema } from "../schemas/common.schema";
import {
  documentCreateSchema,
  documentSearchQuerySchema,
  documentUpdateSchema,
} from "../schemas/document.schema";
import {
  createDocument,
  deleteDocumentById,
  downloadDocument,
  getDocumentById,
  listDocuments,
  updateDocumentById,
} from "../services/document.service";

export async function createDocumentController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.file) {
      throw new AppError(400, "Arquivo obrigatório");
    }

    const extension = path.extname(req.file.originalname).toLowerCase();

    if (!allowedExtensions.has(extension)) {
      throw new AppError(415, "Tipo de arquivo não permitido");
    }

    const data = documentCreateSchema.parse({
      name: req.body.name,
      description: req.body.description,
    });

    const document = await createDocument(data, req.file, req.user!.id);

    return res.status(201).json({
      success: true,
      message: "Documento cadastrado com sucesso",
      document,
    });
  } catch (error) {
    return next(error);
  }
}

export async function listDocumentController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const query = documentSearchQuerySchema.parse(req.query);
    const result = await listDocuments(query);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getDocumentController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const document = await getDocumentById(id);

    return res.status(200).json({
      success: true,
      document,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateDocumentController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const data = documentUpdateSchema.parse(req.body);
    const document = await updateDocumentById(id, req.user!.id, data);

    return res.status(200).json({
      success: true,
      message: "Documento atualizado com sucesso",
      document,
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteDocumentController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const result = await deleteDocumentById(id, req.user!.id);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return next(error);
  }
}

export async function downloadDocumentController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const data = await downloadDocument(id, req.user!.id);

    return res.download(data.filePath, data.originalFileName);
  } catch (error) {
    return next(error);
  }
}
