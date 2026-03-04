import { prisma } from "@/lib/prisma";
import { escapeFullTextQuery } from "@/lib/utils";

export interface SearchResult {
  type: "product" | "guide";
  id: string;
  title: string;
  subtitle?: string;
  discipline?: string;
  disciplineColor?: string;
  url: string;
  snippet?: string;
}

/**
 * Global search using MySQL FULLTEXT indexes.
 *
 * Products: searches model, resetCodes, engineerCodes, defaultCodes,
 *           walkTest, commissioningQuirks, commonFaults, notes
 * Guides:   searches title, content
 *
 * Falls back to LIKE search when the query is too short for FULLTEXT (< 3 chars).
 */
export async function globalSearch(
  query: string,
  limit = 20
): Promise<SearchResult[]> {
  const cleaned = query.trim();
  if (!cleaned) return [];

  // MySQL FULLTEXT requires ≥ 3 characters by default (innodb_ft_min_token_size)
  const useFullText = cleaned.length >= 3;

  const results: SearchResult[] = [];

  if (useFullText) {
    const escaped = escapeFullTextQuery(cleaned);

    // Product full-text search
    const products = await prisma.$queryRaw<
      Array<{
        id: string;
        internal_code: string;
        model: string;
        discipline_name: string;
        discipline_color: string;
        discipline_slug: string;
        manufacturer_name: string;
      }>
    >`
      SELECT
        p.id,
        p.internal_code,
        p.model,
        d.name  AS discipline_name,
        d.color AS discipline_color,
        d.slug  AS discipline_slug,
        m.name  AS manufacturer_name,
        MATCH(p.model, p.reset_codes, p.engineer_codes, p.default_codes,
              p.walk_test, p.commissioning_quirks, p.common_faults, p.notes)
        AGAINST (${escaped} IN BOOLEAN MODE) AS relevance
      FROM products p
      JOIN disciplines d  ON p.discipline_id  = d.id
      JOIN manufacturers m ON p.manufacturer_id = m.id
      WHERE p.is_archived = 0
        AND MATCH(p.model, p.reset_codes, p.engineer_codes, p.default_codes,
                  p.walk_test, p.commissioning_quirks, p.common_faults, p.notes)
            AGAINST (${escaped} IN BOOLEAN MODE)
      ORDER BY relevance DESC
      LIMIT ${Math.ceil(limit / 2)}
    `;

    for (const p of products) {
      results.push({
        type: "product",
        id: p.id,
        title: `${p.internal_code} — ${p.model}`,
        subtitle: `${p.manufacturer_name} · ${p.discipline_name}`,
        discipline: p.discipline_name,
        disciplineColor: p.discipline_color,
        url: `/products/${p.id}`,
      });
    }

    // Guide full-text search
    const guides = await prisma.$queryRaw<
      Array<{
        id: string;
        title: string;
        guide_type: string;
        discipline_name: string | null;
        discipline_color: string | null;
        content_snippet: string;
      }>
    >`
      SELECT
        g.id,
        g.slug,
        g.title,
        g.guide_type,
        d.name  AS discipline_name,
        d.color AS discipline_color,
        LEFT(g.content, 200) AS content_snippet,
        MATCH(g.title, g.content)
        AGAINST (${escaped} IN BOOLEAN MODE) AS relevance
      FROM guides g
      LEFT JOIN disciplines d ON g.discipline_id = d.id
      WHERE g.is_published = 1
        AND MATCH(g.title, g.content)
            AGAINST (${escaped} IN BOOLEAN MODE)
      ORDER BY relevance DESC
      LIMIT ${Math.ceil(limit / 2)}
    `;

    for (const g of guides) {
      results.push({
        type: "guide",
        id: g.id,
        title: g.title,
        subtitle: g.guide_type === "GENERAL" ? "General Guide" : "Product Guide",
        discipline: g.discipline_name ?? undefined,
        disciplineColor: g.discipline_color ?? undefined,
        url: `/guides/${g.id}`,
        snippet: g.content_snippet?.replace(/<[^>]*>/g, "").slice(0, 150),
      });
    }
  } else {
    // Short query — fall back to LIKE
    const like = `%${cleaned}%`;

    const products = await prisma.product.findMany({
      where: {
        isArchived: false,
        OR: [
          { model: { contains: cleaned } },
          { internalCode: { contains: cleaned } },
        ],
      },
      include: { discipline: true, manufacturer: true },
      take: Math.ceil(limit / 2),
    });

    for (const p of products) {
      results.push({
        type: "product",
        id: p.id,
        title: `${p.internalCode} — ${p.model}`,
        subtitle: `${p.manufacturer.name} · ${p.discipline.name}`,
        discipline: p.discipline.name,
        disciplineColor: p.discipline.color,
        url: `/products/${p.id}`,
      });
    }

    // Suppress unused variable warning — like is used only in the raw path above
    void like;

    const guides = await prisma.guide.findMany({
      where: {
        isPublished: true,
        title: { contains: cleaned },
      },
      include: { discipline: true },
      take: Math.ceil(limit / 2),
    });

    for (const g of guides) {
      results.push({
        type: "guide",
        id: g.id,
        title: g.title,
        subtitle: g.guideType === "GENERAL" ? "General Guide" : "Product Guide",
        discipline: g.discipline?.name,
        disciplineColor: g.discipline?.color,
        url: `/guides/${g.id}`,
      });
    }
  }

  return results;
}
