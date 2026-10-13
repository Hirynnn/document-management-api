import { AuditAction } from "@prisma/client";
import { prisma } from "../lib/prisma";

export async function createAuditEntry(
  action: AuditAction,
  userId: string,
  documentId?: string,
) {
  return prisma.auditLog.create({
    data: {
      action,
      userId,
      documentId,
    },
  });
}
