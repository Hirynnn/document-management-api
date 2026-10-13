import fs from "node:fs/promises";
import path from "node:path";
import { prisma } from "../lib/prisma";
import { AppError } from "../middlewares/error.middleware";
import { createAuditEntry } from "./audit.service";

export type DocumentListItem = {
  id: string;
  name: string;
  description: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  uploadedBy: {
    id: string;
    name: string;
  };
  createdAt: Date;
};

function mapDocument(document: {
  id: string;
  name: string;
  description: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  createdAt: Date;
  uploadedBy?: {
    id: string;
    name: string;
  } | null;
}): DocumentListItem {
  return {
    id: document.id,
    name: document.name,
    description: document.description,
    originalFileName: document.originalFileName,
    mimeType: document.mimeType,
    fileSize: document.fileSize,
    uploadedBy: document.uploadedBy ?? { id: "", name: "Desconhecido" },
    createdAt: document.createdAt,
  };
}

export async function createDocument(
  input: { name: string; description: string },
  file: Express.Multer.File | undefined,
  userId: string,
) {
  if (!file) {
    throw new AppError(400, "Arquivo obrigatório");
  }

  const document = await prisma.document.create({
    data: {
      name: input.name.trim(),
      description: input.description.trim(),
      originalFileName: file.originalname,
      storedFileName: file.filename,
      filePath: path.relative(process.cwd(), file.path).replace(/\\/g, "/"),
      mimeType: file.mimetype || "application/octet-stream",
      fileSize: file.size,
      uploadedById: userId,
    },
    include: {
      uploadedBy: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  await createAuditEntry("UPLOAD", userId, document.id);

  return mapDocument(document);
}

export async function listDocuments(input: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  const search = input.search?.trim();
  const page = input.page ?? 1;
  const limit = input.limit ?? 10;

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [documents, total] = await prisma.$transaction([
    prisma.document.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    prisma.document.count({ where }),
  ]);

  return {
    documents: documents.map(mapDocument),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getDocumentById(documentId: string) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      uploadedBy: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!document) {
    throw new AppError(404, "Documento não encontrado");
  }

  return {
    id: document.id,
    name: document.name,
    description: document.description,
    originalFileName: document.originalFileName,
    storedFileName: document.storedFileName,
    mimeType: document.mimeType,
    fileSize: document.fileSize,
    uploadedBy: document.uploadedBy,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

export async function updateDocumentById(
  documentId: string,
  userId: string,
  input: { name?: string; description?: string },
) {
  const existingDocument = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!existingDocument) {
    throw new AppError(404, "Documento não encontrado");
  }

  const updatedDocument = await prisma.document.update({
    where: { id: documentId },
    data: {
      ...(input.name ? { name: input.name.trim() } : {}),
      ...(input.description ? { description: input.description.trim() } : {}),
    },
    include: {
      uploadedBy: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  await createAuditEntry("UPDATE", userId, updatedDocument.id);

  return mapDocument(updatedDocument);
}

export async function deleteDocumentById(documentId: string, userId: string) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!document) {
    throw new AppError(404, "Documento não encontrado");
  }

  await createAuditEntry("DELETE", userId, document.id);

  await prisma.document.delete({ where: { id: documentId } });

  const filePath = path.resolve(process.cwd(), document.filePath);

  try {
    await fs.unlink(filePath);
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code !== "ENOENT") {
      throw error;
    }
  }

  return { message: "Documento excluído com sucesso" };
}

export async function downloadDocument(documentId: string, userId: string) {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });

  if (!document) {
    throw new AppError(404, "Documento não encontrado");
  }

  await createAuditEntry("DOWNLOAD", userId, document.id);

  return {
    filePath: path.resolve(process.cwd(), document.filePath),
    originalFileName: document.originalFileName,
  };
}
