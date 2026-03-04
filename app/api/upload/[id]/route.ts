import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { readFile } from "fs/promises";

type Params = { params: Promise<{ id: string }> };

// GET /api/upload/:id — serve a stored file
export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const attachment = await prisma.attachment.findUnique({ where: { id } });
  if (!attachment) return NextResponse.json({ message: "Not found" }, { status: 404 });

  try {
    const buffer = await readFile(attachment.storageKey);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": attachment.mimeType,
        "Content-Disposition": `attachment; filename="${attachment.originalName}"`,
        "Content-Length": String(attachment.sizeBytes),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ message: "File not found on disk." }, { status: 404 });
  }
}
