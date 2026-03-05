import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const MAX_SIZE = parseInt(process.env.MAX_UPLOAD_BYTES ?? "20971520", 10); // 20 MB
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

// POST /api/upload — upload a file and create an attachment record
export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role === "OFFICE_STAFF") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ message: "Invalid form data." }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const productId = formData.get("productId") as string | null;
  const guideId = formData.get("guideId") as string | null;

  if (!file) return NextResponse.json({ message: "No file provided." }, { status: 400 });
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ message: "File exceeds maximum size (20 MB)." }, { status: 413 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ message: "File type not permitted." }, { status: 415 });
  }
  if (!productId && !guideId) {
    return NextResponse.json(
      { message: "Provide either productId or guideId." },
      { status: 400 }
    );
  }

  const ext = path.extname(file.name);
  const safeFilename = `${crypto.randomUUID()}${ext}`;
  const uploadDir = path.join(process.cwd(), "uploads");
  const filePath = path.join(uploadDir, safeFilename);

  await mkdir(uploadDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  const attachment = await prisma.attachment.create({
    data: {
      filename: safeFilename,
      originalName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      storageKey: filePath,
      productId: productId ?? null,
      guideId: guideId ?? null,
    },
  });

  return NextResponse.json(attachment, { status: 201 });
}
