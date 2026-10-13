import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "./error.middleware";

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError(401, "Token de acesso não fornecido"));
  }

  const token = authHeader.replace("Bearer ", "").trim();
  const secret = process.env.JWT_SECRET ?? "[REDACTED]";

  try {
    const payload = jwt.verify(token, secret) as {
      sub: string;
      email: string;
      role: "USER" | "ADMIN";
    };

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    return next();
  } catch {
    return next(new AppError(401, "Token inválido ou expirado"));
  }
}
