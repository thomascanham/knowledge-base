import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const UpdateSchema = z.object({
  name:          z.string().min(1).max(100).optional(),
  website:       z.string().url().optional().or(z.literal("")),
  phone:         z.string().max(30).optional().or(z.literal("")),
  supportPhone:  z.string().max(30).optional().or(z.literal("")),
  supportEmail:  z.string().email().optional().or(z.literal("")),
  address:       z.string().max(500).optional().or(z.literal("")),
  notes:         z.string().optional().or(z.literal("")),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const manufacturer = await prisma.manufacturer.findUnique({
    where: { id: parseInt(id) },
    include: {
      products: {
        where: { isArchived: false },
        orderBy: { model: "asc" },
        include: { discipline: true },
      },
    },
  });

  if (!manufacturer) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(manufacturer);
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await prisma.manufacturer.findUnique({ where: { id: parseInt(id) } });
  if (!existing) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validation error", errors: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const nullify = (v?: string) => (v === "" || v === undefined ? null : v);
  const { name, ...rest } = parsed.data;

  // Check name uniqueness if changing
  if (name && name !== existing.name) {
    const nameTaken = await prisma.manufacturer.findUnique({ where: { name } });
    if (nameTaken) {
      return NextResponse.json({ message: `"${name}" already exists.` }, { status: 409 });
    }
  }

  const updated = await prisma.manufacturer.update({
    where: { id: parseInt(id) },
    data: {
      ...(name ? { name } : {}),
      website:       nullify(rest.website),
      phone:         nullify(rest.phone),
      supportPhone:  nullify(rest.supportPhone),
      supportEmail:  nullify(rest.supportEmail),
      address:       nullify(rest.address),
      notes:         nullify(rest.notes),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  // Block deletion if products are linked
  const productCount = await prisma.product.count({
    where: { manufacturerId: parseInt(id), isArchived: false },
  });

  if (productCount > 0) {
    return NextResponse.json(
      { message: `Cannot delete — ${productCount} active product${productCount > 1 ? "s" : ""} linked to this manufacturer.` },
      { status: 409 }
    );
  }

  await prisma.manufacturer.delete({ where: { id: parseInt(id) } });
  return new NextResponse(null, { status: 204 });
}
