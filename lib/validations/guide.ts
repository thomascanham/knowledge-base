import { z } from "zod";

export const GuideSchema = z.object({
  title: z.string().min(1, "Title is required").max(300),
  slug: z.string().optional(), // auto-generated if omitted
  guideType: z.enum(["PRODUCT_SPECIFIC", "GENERAL"]).default("GENERAL"),
  disciplineId: z.coerce.number().int().positive().optional().nullable(),
  difficulty: z
    .enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"])
    .optional()
    .nullable(),
  estimatedTime: z.string().max(50).optional(),
  content: z.string().min(1, "Guide content is required"),
  isPublished: z.boolean().default(true),
  productIds: z.array(z.string()).optional(),
});

export type GuideInput = z.infer<typeof GuideSchema>;
