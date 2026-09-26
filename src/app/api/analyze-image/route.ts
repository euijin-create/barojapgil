import { MAX_IMAGE_FILE_SIZE, isSupportedImageMimeType } from "@/contracts/image-upload";
import { AnalysisProviderError } from "@/application/ports/image-analysis-provider";
import { getImageAnalysisProvider } from "@/server/ai/provider-factory";
import { validateImageSignature } from "@/server/media/validate-image-upload";
import { consumeImageAnalysisRateLimit } from "@/server/security/image-analysis-rate-limit";

export const runtime = "nodejs";

const PRIVATE_RESPONSE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  Pragma: "no-cache",
};

const MULTIPART_OVERHEAD_ALLOWANCE = 1024 * 1024;

type PublicErrorCode =
  | "INVALID_REQUEST"
  | "IMAGE_REQUIRED"
  | "TOO_MANY_FILES"
  | "EMPTY_FILE"
  | "UNSUPPORTED_FILE_TYPE"
  | "FILE_TOO_LARGE"
  | "INVALID_IMAGE_FILE"
  | "PROVIDER_CONFIGURATION_ERROR"
  | "INVALID_ANALYSIS_RESULT"
  | "ANALYSIS_UNAVAILABLE"
  | "RATE_LIMITED"
  | "INTERNAL_SERVER_ERROR";

function jsonResponse(body: unknown, status = 200, headers?: HeadersInit) {
  return Response.json(body, {
    status,
    headers: { ...PRIVATE_RESPONSE_HEADERS, ...headers },
  });
}

function errorResponse(
  code: PublicErrorCode,
  message: string,
  status: number,
  headers?: HeadersInit,
) {
  return jsonResponse({ error: { code, message } }, status, headers);
}

function mapProviderError(error: AnalysisProviderError) {
  if (
    error.code === "PROVIDER_NOT_CONFIGURED" ||
    error.code === "INVALID_PROVIDER_CONFIGURATION" ||
    error.code === "PROVIDER_CONFIGURATION_ERROR"
  ) {
    return errorResponse(
      "PROVIDER_CONFIGURATION_ERROR",
      "AI 분석 설정을 확인할 수 없습니다. 관리자에게 문의해 주세요.",
      503,
    );
  }

  if (error.code === "INVALID_ANALYSIS_RESULT") {
    return errorResponse(
      "INVALID_ANALYSIS_RESULT",
      "분석 결과를 받을 수 없습니다. 잠시 후 다시 시도해 주세요.",
      502,
    );
  }

  return errorResponse(
    "ANALYSIS_UNAVAILABLE",
    "AI 분석을 완료하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    502,
  );
}

function logServerError(requestId: string, error: unknown) {
  if (error instanceof AnalysisProviderError) {
    console.error("[analyze-image] provider error", {
      requestId,
      code: error.code,
      errorType: error.name,
      detail: error.message,
      causeType: error.cause instanceof Error ? error.cause.name : undefined,
    });
    return;
  }

  console.error("[analyze-image] unexpected error", {
    requestId,
    errorType: error instanceof Error ? error.name : "UnknownError",
  });
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  const rateLimit = consumeImageAnalysisRateLimit(request);
  if (!rateLimit.allowed) {
    return errorResponse(
      "RATE_LIMITED",
      "분석 요청이 많습니다. 잠시 후 다시 시도해 주세요.",
      429,
      { "Retry-After": String(rateLimit.retryAfterSeconds) },
    );
  }

  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";

  if (!contentType.startsWith("multipart/form-data;")) {
    return errorResponse(
      "INVALID_REQUEST",
      "사진 파일을 multipart/form-data 형식으로 보내 주세요.",
      415,
    );
  }

  const contentLength = Number(request.headers.get("content-length"));
  if (
    Number.isFinite(contentLength) &&
    contentLength > MAX_IMAGE_FILE_SIZE + MULTIPART_OVERHEAD_ALLOWANCE
  ) {
    return errorResponse(
      "FILE_TOO_LARGE",
      "사진은 10 MB 이하 파일만 분석할 수 있습니다.",
      413,
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse(
      "INVALID_REQUEST",
      "사진 요청을 읽을 수 없습니다. 파일을 다시 선택해 주세요.",
      400,
    );
  }

  const images = formData.getAll("image");
  const uploadedFiles = [...formData.values()].filter((value) => value instanceof File);

  if (images.length === 0 || !(images[0] instanceof File)) {
    return errorResponse("IMAGE_REQUIRED", "분석할 사진 1장을 선택해 주세요.", 400);
  }

  if (images.length !== 1 || uploadedFiles.length !== 1) {
    return errorResponse("TOO_MANY_FILES", "사진은 한 번에 1장만 분석할 수 있습니다.", 400);
  }

  const image = images[0];

  if (image.size === 0) {
    return errorResponse("EMPTY_FILE", "비어 있는 파일은 분석할 수 없습니다.", 400);
  }

  if (image.size > MAX_IMAGE_FILE_SIZE) {
    return errorResponse(
      "FILE_TOO_LARGE",
      "사진은 10 MB 이하 파일만 분석할 수 있습니다.",
      413,
    );
  }

  if (!isSupportedImageMimeType(image.type)) {
    return errorResponse(
      "UNSUPPORTED_FILE_TYPE",
      "JPEG, PNG, WEBP 형식의 사진만 분석할 수 있습니다.",
      415,
    );
  }

  const bytes = new Uint8Array(await image.arrayBuffer());
  const verifiedMimeType = validateImageSignature(bytes, image.type);
  if (!verifiedMimeType) {
    return errorResponse(
      "INVALID_IMAGE_FILE",
      "사진 형식을 확인할 수 없습니다. 원본 JPEG, PNG 또는 WEBP 파일을 선택해 주세요.",
      415,
    );
  }

  try {
    const { provider, name, isDemo } = getImageAnalysisProvider();
    const result = await provider.analyzeImage({
      bytes,
      mimeType: verifiedMimeType,
    });

    return jsonResponse({ result, provider: name, isDemo });
  } catch (error) {
    logServerError(requestId, error);
    if (error instanceof AnalysisProviderError) return mapProviderError(error);

    return errorResponse(
      "INTERNAL_SERVER_ERROR",
      "서버에서 분석 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      500,
    );
  }
}
