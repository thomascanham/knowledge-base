import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ProductSchema } from "@/lib/validations/product";
import { recordAudit } from "@/lib/audit";
import { slugify } from "@/lib/utils";

// GET /api/products — list with optional filters
export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const discipline = searchParams.get("discipline");
  const manufacturer = searchParams.get("manufacturer");
  const q = searchParams.get("q");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "24", 10));

  const where = {
    isArchived: false,
    ...(discipline && { discipline: { slug: discipline } }),
    ...(manufacturer && { manufacturer: { slug: manufacturer } }),
    ...(q && {
      OR: [
        { model: { contains: q } },
        { internalCode: { contains: q } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: [{ discipline: { name: "asc" } }, { model: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        discipline: true,
        manufacturer: true,
        tags: { include: { tag: true } },
        _count: { select: { guides: true, attachments: true } },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({ data, total, page, limit });
}

// POST /api/products — create (admin only)
export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = ProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validation error", errors: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { tagIds, guideIds, ...productData } = parsed.data;

  // Check uniqueness
  const existing = await prisma.product.findUnique({
    where: { internalCode: productData.internalCode },
  });
  if (existing) {
    return NextResponse.json(
      { message: `Internal code "${productData.internalCode}" is already in use.` },
      { status: 409 }
    );
  }

  const product = await prisma.product.create({
    data: {
      ...productData,
      tags: tagIds?.length
        ? { create: tagIds.map((id) => ({ tagId: id })) }
        : undefined,
      guides: guideIds?.length
        ? { create: guideIds.map((id) => ({ guideId: id })) }
        : undefined,
    },
  });

  await recordAudit({
    userId: session.user.id,
    action: "CREATE",
    entityType: "product",
    entityId: product.id,
    ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
    userAgent: req.headers.get("user-agent") ?? undefined,
  });

  return NextResponse.json(product, { status: 201 });
}
