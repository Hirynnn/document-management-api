import { NextFunction, Request, Response } from "express";
import { loginSchema, registerSchema } from "../schemas/auth.schema";
import {
  getAuthenticatedUser,
  loginUser,
  registerUser,
} from "../services/auth.service";

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = registerSchema.parse(req.body);
    const user = await registerUser(data);

    return res.status(201).json({
      success: true,
      message: "Usuário cadastrado com sucesso",
      user,
    });
  } catch (error) {
    return next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const data = loginSchema.parse(req.body);
    const result = await loginUser(data);

    return res.status(200).json({
      success: true,
      message: "Login realizado com sucesso",
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    return next(error);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await getAuthenticatedUser(req.user!.id);

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return next(error);
  }
}
