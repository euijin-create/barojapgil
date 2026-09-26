import "server-only";

import {
  isSupportedImageMimeType,
  type ImageMimeType,
} from "@/contracts/image-upload";

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] as const;

function startsWith(bytes: Uint8Array, signature: readonly number[]) {
  return signature.every((value, index) => bytes[index] === value);
}

export function detectImageMimeType(bytes: Uint8Array): ImageMimeType | null {
  if (bytes.length >= 3 && startsWith(bytes, [0xff, 0xd8, 0xff])) {
    return "image/jpeg";
  }

  if (bytes.length >= PNG_SIGNATURE.length && startsWith(bytes, PNG_SIGNATURE)) {
    return "image/png";
  }

  if (
    bytes.length >= 12 &&
    startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }

  return null;
}

export function validateImageSignature(
  bytes: Uint8Array,
  declaredMimeType: string,
): ImageMimeType | null {
  if (!isSupportedImageMimeType(declaredMimeType)) return null;

  const detectedMimeType = detectImageMimeType(bytes);
  return detectedMimeType === declaredMimeType ? detectedMimeType : null;
}
