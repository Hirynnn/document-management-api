import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import { AppError } from "../middlewares/error.middleware";

export type UserRole = "USER" | "ADMIN";

export type SanitizedUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

function sanitizeUser(user: {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}): SanitizedUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    active: user.active,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function listUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return users;
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new AppError(404, "Usuário não encontrado");
  }

  return user;
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  active?: boolean;
}) {
  const email = input.email.trim().toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw new AppError(409, "E-mail já cadastrado");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email,
      password: passwordHash,
      role: input.role ?? "USER",
      active: input.active ?? true,
    },
  });

  return sanitizeUser(user);
}

export async function updateUser(
  userId: string,
  input: {
    name?: string;
    email?: string;
    password?: string;
    role?: UserRole;
    active?: boolean;
  },
) {
  const existingUser = await prisma.user.findUnique({ where: { id: userId } });

  if (!existingUser) {
    throw new AppError(404, "Usuário não encontrado");
  }

  if (input.email) {
    const email = input.email.trim().toLowerCase();
    const userWithSameEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (userWithSameEmail && userWithSameEmail.id !== userId) {
      throw new AppError(409, "E-mail já cadastrado");
    }
  }

  const data: {
    name?: string;
    email?: string;
    password?: string;
    role?: UserRole;
    active?: boolean;
  } = {};

  if (input.name) data.name = input.name.trim();
  if (input.email) data.email = input.email.trim().toLowerCase();
  if (input.password) data.password = await bcrypt.hash(input.password, 10);
  if (input.role) data.role = input.role;
  if (typeof input.active === "boolean") data.active = input.active;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data,
  });

  return sanitizeUser(updatedUser);
}

export async function disableUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError(404, "Usuário não encontrado");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { active: false },
  });

  return sanitizeUser(updatedUser);
}

export async function enableUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError(404, "Usuário não encontrado");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { active: true },
  });

  return sanitizeUser(updatedUser);
}

export async function deleteUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError(404, "Usuário não encontrado");
  }

  await prisma.user.delete({ where: { id: userId } });

  return { message: "Usuário removido com sucesso" };
}
