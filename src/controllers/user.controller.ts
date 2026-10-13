import { NextFunction, Request, Response } from "express";
import { createUserSchema, updateUserSchema } from "../schemas/user.schema";
import { idParamSchema } from "../schemas/common.schema";
import {
  createUser,
  deleteUser,
  disableUser,
  enableUser,
  getUserById,
  listUsers,
  updateUser,
} from "../services/user.service";

export async function getUsers(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const users = await listUsers();

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const user = await getUserById(id);

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return next(error);
  }
}

export async function createUserController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const data = createUserSchema.parse(req.body);
    const user = await createUser(data);

    return res.status(201).json({
      success: true,
      message: "Usuário criado com sucesso",
      user,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateUserController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const data = updateUserSchema.parse(req.body);
    const user = await updateUser(id, data);

    return res.status(200).json({
      success: true,
      message: "Usuário atualizado com sucesso",
      user,
    });
  } catch (error) {
    return next(error);
  }
}

export async function disableUserController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const user = await disableUser(id);

    return res.status(200).json({
      success: true,
      message: "Usuário desabilitado com sucesso",
      user,
    });
  } catch (error) {
    return next(error);
  }
}

export async function enableUserController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const user = await enableUser(id);

    return res.status(200).json({
      success: true,
      message: "Usuário habilitado com sucesso",
      user,
    });
  } catch (error) {
    return next(error);
  }
}

export async function deleteUserController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const result = await deleteUser(id);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return next(error);
  }
}
