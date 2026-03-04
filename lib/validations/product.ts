import { z } from "zod";

export const ProductSchema = z.object({
  internalCode: z
    .string()
    .min(1, "Internal code is required")
    .max(50)
    .regex(/^[A-Z0-9-]+$/, "Use uppercase letters, numbers, and hyphens only"),
  model: z.string().min(1, "Model name is required").max(200),
  disciplineId: z.coerce.number().int().positive("Select a discipline"),
  manufacturerId: z.coerce.number().int().positive("Select a manufacturer"),
  specs: z.record(z.string(), z.unknown()).nullish(),
  resetCodes: z.string().nullish(),
  engineerCodes: z.string().nullish(),
  defaultCodes: z.string().nullish(),
  walkTest: z.string().nullish(),
  commissioningQuirks: z.string().nullish(),
  commonFaults: z.string().nullish(),
  notes: z.string().nullish(),
  tagIds: z.array(z.number().int()).optional(),
  guideIds: z.array(z.string()).optional(),
});

export type ProductInput = z.infer<typeof ProductSchema>;
