import { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import { ZodError } from "zod";

export class AppError extends Error {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}

export function notFoundMiddleware(
  _req: Request,
  _res: Response,
  next: NextFunction,
) {
  next(new AppError(404, "Rota não encontrada"));
}

function isZodErrorLike(error: unknown): error is ZodError {
  return Boolean(
    error &&
    typeof error === "object" &&
    "issues" in error &&
    Array.isArray((error as { issues?: unknown[] }).issues),
  );
}

function isMulterErrorLike(error: unknown): error is MulterError {
  return Boolean(
    error &&
    typeof error === "object" &&
    "code" in error &&
    typeof (error as { code?: unknown }).code === "string",
  );
}

export function errorMiddleware(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (process.env.NODE_ENV !== "production") {
    if (error instanceof Error) {
      console.error(error.stack ?? error.message);
    } else {
      console.error(error);
    }
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      statusCode: error.statusCode,
    });
  }

  if (isZodErrorLike(error)) {
    const firstIssue = error.issues[0];
    const message = firstIssue?.message ?? "Dados inválidos";

    return res.status(400).json({
      success: false,
      message,
      statusCode: 400,
    });
  }

  if (isMulterErrorLike(error)) {
    const multerError = error as MulterError;
    const statusCode =
      multerError.code === "LIMIT_FILE_SIZE"
        ? 413
        : multerError.code === "LIMIT_UNEXPECTED_FILE"
          ? 415
          : 400;
    const message =
      multerError.code === "LIMIT_FILE_SIZE"
        ? "Arquivo excede o tamanho máximo permitido"
        : multerError.code === "LIMIT_UNEXPECTED_FILE"
          ? "Tipo de arquivo não permitido"
          : multerError.message;

    return res.status(statusCode).json({
      success: false,
      message,
      statusCode,
    });
  }

  if (error instanceof Error) {
    return res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
      statusCode: 500,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Erro interno do servidor",
    statusCode: 500,
  });
}
