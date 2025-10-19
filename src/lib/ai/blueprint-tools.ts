import { z } from "zod";
import type { Operation } from "@/lib/editor-api";

export const OperationSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('insert_at_cursor'), contentMd: z.string().min(1) }),
  z.object({ type: z.literal('replace_selection'), contentMd: z.string().min(1) }),
  z.object({ type: z.literal('append_section'), heading: z.string().min(1), contentMd: z.string().min(1) }),
  z.object({ type: z.literal('append_under_heading'), parent: z.string().min(1), heading: z.string().min(1), contentMd: z.string().min(1) }),
  z.object({ type: z.literal('replace_heading_section'), heading: z.string().min(1), contentMd: z.string().min(1) }),
  z.object({ type: z.literal('format_range'), style: z.enum(['bold','italic','list','h1','h2','h3']) }),
  z.object({ type: z.literal('noop'), reason: z.string().optional() })
]);

export const OperationsSchema = z.array(OperationSchema).max(20);

export type ValidOperations = z.infer<typeof OperationsSchema>;

export function parseOperations(jsonText: string): Operation[] | null {
  try {
    const parsed = JSON.parse(jsonText);
    const result = OperationsSchema.parse(parsed);
    return result as Operation[];
  } catch {
    return null;
  }
}


