import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { GuideSchema } from "@/lib/validations/guide";
import { recordAudit } from "@/lib/audit";
import { slugify } from "@/lib/utils";

// GET /api/guides
export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const discipline = searchParams.get("discipline");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(100, parseInt(searchParams.get("limit") ?? "20", 10));

  const where = {
    isPublished: true,
    ...(type && { guideType: type as "GENERAL" | "PRODUCT_SPECIFIC" }),
    ...(discipline && { discipline: { slug: discipline } }),
  };

  const [data, total] = await Promise.all([
    prisma.guide.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        discipline: true,
        _count: { select: { products: true } },
      },
    }),
    prisma.guide.count({ where }),
  ]);

  return NextResponse.json({ data, total, page, limit });
}

// POST /api/guides — create (admin only)
export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = GuideSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validation error", errors: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { productIds, slug: rawSlug, ...guideData } = parsed.data;

  // Generate unique slug
  let slug = rawSlug ?? slugify(guideData.title);
  const existing = await prisma.guide.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now()}`;

  const guide = await prisma.guide.create({
    data: {
      ...guideData,
      slug,
      products: productIds?.length
        ? { create: productIds.map((productId) => ({ productId })) }
        : undefined,
    },
  });

  await recordAudit({
    userId: session.user.id,
    action: "CREATE",
    entityType: "guide",
    entityId: guide.id,
    ipAddress: req.headers.get("x-forwarded-for") ?? undefined,
  });

  return NextResponse.json(guide, { status: 201 });
}
