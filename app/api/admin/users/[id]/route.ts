import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UpdateUserSchema } from "@/lib/validations/user";
import bcrypt from "bcryptjs";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  // Prevent admins from deactivating themselves
  if (id === session.user.id) {
    return NextResponse.json(
      { message: "You cannot modify your own account via the admin panel." },
      { status: 400 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = UpdateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Validation error", errors: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { password, ...data } = parsed.data;

  const updateData: Record<string, unknown> = { ...data };
  if (password) {
    updateData.passwordHash = await bcrypt.hash(password, 12);
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return NextResponse.json(user);
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  if (id === session.user.id) {
    return NextResponse.json({ message: "Cannot delete your own account." }, { status: 400 });
  }

  // Soft delete — deactivate rather than hard delete
  await prisma.user.update({ where: { id }, data: { isActive: false } });
  return new NextResponse(null, { status: 204 });
}
