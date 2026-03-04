import { prisma } from "@/lib/prisma";
import type { AuditAction } from "@prisma/client";

interface AuditParams {
  userId: string;
  action: AuditAction;
  entityType: "product" | "guide" | "user";
  entityId: string;
  changes?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Record an audit log entry.
 * Call this from API routes after successful mutations.
 * Does not throw — failures are logged but don't break the request.
 */
export async function recordAudit(params: AuditParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        changes: params.changes ?? undefined,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    });
  } catch (err) {
    console.error("[audit] Failed to record audit log:", err);
  }
}

/**
 * Compute a JSON diff between old and new objects.
 * Returns an object with only the changed fields, showing { from, to } pairs.
 */
export function diffObjects(
  oldObj: Record<string, unknown>,
  newObj: Record<string, unknown>
): Record<string, { from: unknown; to: unknown }> {
  const diff: Record<string, { from: unknown; to: unknown }> = {};
  const keys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);

  for (const key of keys) {
    if (JSON.stringify(oldObj[key]) !== JSON.stringify(newObj[key])) {
      diff[key] = { from: oldObj[key], to: newObj[key] };
    }
  }
  return diff;
}
