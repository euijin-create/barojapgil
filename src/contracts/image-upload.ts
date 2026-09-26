/** 사진 1장 분석 요청의 브라우저·서버 공통 제한. */
export const MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024;

export const SUPPORTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type ImageMimeType = (typeof SUPPORTED_IMAGE_MIME_TYPES)[number];

export function isSupportedImageMimeType(value: string): value is ImageMimeType {
  return SUPPORTED_IMAGE_MIME_TYPES.some((type) => type === value);
}
