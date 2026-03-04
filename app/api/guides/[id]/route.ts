import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { GuideSchema } from "@/lib/validations/guide";
import { recordAudit, diffObjects } from "@/lib/audit";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const guide = await prisma.guide.findUnique({
    where: { id, isPublished: true },
    include: {
      discipline: true,
      attachments: true,
      products: { include: { product: { include: { discipline: true } } } },
      versions: { orderBy: { version: "desc" }, take: 10 },
    },
  });

  if (!guide) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(guide);
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await prisma.guide.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = GuideSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validation error", errors: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { productIds, slug, ...updateData } = parsed.data;

  const updated = await prisma.$transaction(async (tx) => {
    // Save current content as a version before updating
    if (updateData.content && updateData.content !== existing.content) {
      await tx.guideVersion.create({
        data: {
          guideId: id,
          content: existing.content,
          title: existing.title,
          version: existing.version,
          createdBy: session.user.id,
        },
      });
    }

    // Replace linked products if provided
    if (productIds !== undefined) {
      await tx.productGuide.deleteMany({ where: { guideId: id } });
      if (productIds.length > 0) {
        await tx.productGuide.createMany({
          data: productIds.map((productId) => ({ guideId: id, productId })),
        });
      }
    }

    return tx.guide.update({
      where: { id },
      data: {
        ...updateData,
        // Bump version only if content changed
        ...(updateData.content && updateData.content !== existing.content
          ? { version: existing.version + 1 }
          : {}),
      },
    });
  });

  await recordAudit({
    userId: session.user.id,
    action: "UPDATE",
    entityType: "guide",
    entityId: id,
    changes: diffObjects(
      existing as unknown as Record<string, unknown>,
      updated as unknown as Record<string, unknown>
    ),
    ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await prisma.guide.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ message: "Not found" }, { status: 404 });

  // Soft-delete by unpublishing
  await prisma.guide.update({ where: { id }, data: { isPublished: false } });

  await recordAudit({
    userId: session.user.id,
    action: "DELETE",
    entityType: "guide",
    entityId: id,
    ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
  });

  return new NextResponse(null, { status: 204 });
}
