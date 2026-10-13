import { NextFunction, Request, Response } from "express";
import { AppError } from "./error.middleware";

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "ADMIN") {
    return next(new AppError(403, "Acesso restrito para administradores"));
  }

  return next();
}
