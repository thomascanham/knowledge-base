import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProductSchema } from "@/lib/validations/product";
import { recordAudit, diffObjects } from "@/lib/audit";

type Params = { params: Promise<{ id: string }> };

// GET /api/products/:id
export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id, isArchived: false },
    include: {
      discipline: true,
      manufacturer: true,
      tags: { include: { tag: true } },
      attachments: true,
      guides: { include: { guide: { include: { discipline: true } } } },
    },
  });

  if (!product) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

// PATCH /api/products/:id — update (admin + engineer)
export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (session.user.role === "OFFICE_STAFF") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = ProductSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validation error", errors: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { tagIds, guideIds, ...updateData } = parsed.data;

  const updated = await prisma.$transaction(async (tx) => {
    // Replace tags if provided
    if (tagIds !== undefined) {
      await tx.productTag.deleteMany({ where: { productId: id } });
      if (tagIds.length > 0) {
        await tx.productTag.createMany({
          data: tagIds.map((tagId) => ({ productId: id, tagId })),
        });
      }
    }

    // Replace guides if provided
    if (guideIds !== undefined) {
      await tx.productGuide.deleteMany({ where: { productId: id } });
      if (guideIds.length > 0) {
        await tx.productGuide.createMany({
          data: guideIds.map((guideId) => ({ productId: id, guideId })),
        });
      }
    }

    return tx.product.update({
      where: { id },
      data: updateData,
    });
  });

  await recordAudit({
    userId: session.user.id,
    action: "UPDATE",
    entityType: "product",
    entityId: id,
    changes: diffObjects(
      existing as unknown as Record<string, unknown>,
      updated as unknown as Record<string, unknown>
    ),
    ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
  });

  return NextResponse.json(updated);
}

// DELETE /api/products/:id — soft delete (admin + engineer)
export async function DELETE(req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (session.user.role === "OFFICE_STAFF") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ message: "Not found" }, { status: 404 });

  await prisma.product.update({ where: { id }, data: { isArchived: true } });

  await recordAudit({
    userId: session.user.id,
    action: "DELETE",
    entityType: "product",
    entityId: id,
    ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
  });

  return new NextResponse(null, { status: 204 });
}
