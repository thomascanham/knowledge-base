import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { slugify } from "@/lib/utils";

const ManufacturerSchema = z.object({
  name:          z.string().min(1, "Name is required").max(100),
  website:       z.string().url("Must be a valid URL").optional().or(z.literal("")),
  phone:         z.string().max(30).optional().or(z.literal("")),
  supportPhone:  z.string().max(30).optional().or(z.literal("")),
  supportEmail:  z.string().email("Must be a valid email").optional().or(z.literal("")),
  address:       z.string().max(500).optional().or(z.literal("")),
  notes:         z.string().optional().or(z.literal("")),
});

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const manufacturers = await prisma.manufacturer.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return NextResponse.json(manufacturers);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (session.user.role === "OFFICE_STAFF") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = ManufacturerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validation error", errors: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { name, ...rest } = parsed.data;

  const existing = await prisma.manufacturer.findUnique({ where: { name } });
  if (existing) {
    return NextResponse.json({ message: `"${name}" already exists.` }, { status: 409 });
  }

  // Ensure unique slug
  let slug = slugify(name);
  const slugExists = await prisma.manufacturer.findUnique({ where: { slug } });
  if (slugExists) slug = `${slug}-${Date.now()}`;

  const nullify = (v?: string) => (v === "" || v === undefined ? null : v);

  const manufacturer = await prisma.manufacturer.create({
    data: {
      name,
      slug,
      website:       nullify(rest.website),
      phone:         nullify(rest.phone),
      supportPhone:  nullify(rest.supportPhone),
      supportEmail:  nullify(rest.supportEmail),
      address:       nullify(rest.address),
      notes:         nullify(rest.notes),
    },
  });

  return NextResponse.json(manufacturer, { status: 201 });
}
