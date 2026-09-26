import { z } from "zod";

export const VIOLATION_TYPES = [
  "SIGNAL_VIOLATION",
  "CENTER_LINE_VIOLATION",
  "DANGEROUS_MERGE",
  "UNKNOWN",
] as const;

export const EVIDENCE_ITEM_STATUSES = [
  "CLEAR",
  "UNCERTAIN",
  "MISSING",
] as const;

export const violationTypeSchema = z.enum(VIOLATION_TYPES);
export const evidenceItemStatusSchema = z.enum(EVIDENCE_ITEM_STATUSES);

export const evidenceItemSchema = z.strictObject({
  name: z.string().min(1).max(100),
  status: evidenceItemStatusSchema,
  description: z.string().min(1).max(500),
});

/**
 * OpenAI Structured Outputs과 mock provider가 공통으로 준수하는 계약이다.
 * nullable 필드는 이미지에서 확인하지 못한 값을 추측하지 않도록 표현한다.
 */
export const imageAnalysisResultSchema = z.strictObject({
  analysisId: z.string().min(1).max(128),
  suspectedViolation: z.boolean(),
  violationType: violationTypeSchema,
  confidence: z.number().min(0).max(1),
  summary: z.string().min(1).max(800),
  reasoningSummary: z.string().min(1).max(1_200),
  plateNumberCandidate: z.string().min(1).max(30).nullable(),
  occurredAtCandidate: z.string().min(1).max(100).nullable(),
  locationCandidate: z.string().min(1).max(300).nullable(),
  evidenceItems: z.array(evidenceItemSchema).max(20),
  missingEvidence: z.array(z.string().min(1).max(300)).max(20),
  warnings: z.array(z.string().min(1).max(500)).max(20),
});

export type ViolationType = z.infer<typeof violationTypeSchema>;
export type EvidenceItemStatus = z.infer<typeof evidenceItemStatusSchema>;
export type EvidenceItem = z.infer<typeof evidenceItemSchema>;
export type ImageAnalysisResult = z.infer<typeof imageAnalysisResultSchema>;

export function parseImageAnalysisResult(value: unknown): ImageAnalysisResult {
  return imageAnalysisResultSchema.parse(value);
}

export function safeParseImageAnalysisResult(value: unknown) {
  return imageAnalysisResultSchema.safeParse(value);
}
