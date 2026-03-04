import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { globalSearch } from "@/lib/search";

// GET /api/search?q=query&limit=20
export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20", 10));

  if (!q) return NextResponse.json({ results: [], query: "" });

  const results = await globalSearch(q, limit);
  return NextResponse.json({ results, query: q });
}
