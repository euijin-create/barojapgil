import type { ImageAnalysisResult } from "@/contracts/analysis-v1";
import type { ImageMimeType } from "@/contracts/image-upload";

export type AnalysisProviderName = "mock" | "openai";

export interface AnalyzeImageInput {
  bytes: Uint8Array;
  mimeType: ImageMimeType;
}

export interface ImageAnalysisProvider {
  readonly kind: AnalysisProviderName;
  analyzeImage(input: AnalyzeImageInput): Promise<ImageAnalysisResult>;
}

export type ImageAnalysisProviderErrorCode =
  | "PROVIDER_NOT_CONFIGURED"
  | "INVALID_PROVIDER_CONFIGURATION"
  | "INVALID_ANALYSIS_RESULT"
  | "PROVIDER_REQUEST_FAILED"
  | "PROVIDER_CONFIGURATION_ERROR"
  | "ANALYSIS_UNAVAILABLE";

/**
 * `message`는 서버 진단용이고 `userMessage`만 API 응답에 사용한다.
 * provider 원본 오류나 민감한 입력은 사용자 메시지에 포함하지 않는다.
 */
export abstract class AnalysisProviderError extends Error {
  constructor(
    readonly code: ImageAnalysisProviderErrorCode,
    message: string,
    readonly userMessage: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = new.target.name;
  }
}

export class ProviderConfigurationError extends AnalysisProviderError {
  constructor(
    message: string,
    options?: ErrorOptions & {
      code?:
        | "PROVIDER_NOT_CONFIGURED"
        | "INVALID_PROVIDER_CONFIGURATION"
        | "PROVIDER_CONFIGURATION_ERROR";
    },
  ) {
    super(
      options?.code ?? "INVALID_PROVIDER_CONFIGURATION",
      message,
      "AI 분석 서비스 설정을 확인할 수 없습니다. 관리자에게 문의해 주세요.",
      options,
    );
  }
}

export class AnalysisUnavailableError extends AnalysisProviderError {
  constructor(
    message: string,
    options?: ErrorOptions & {
      code?:
        | "INVALID_ANALYSIS_RESULT"
        | "PROVIDER_REQUEST_FAILED"
        | "ANALYSIS_UNAVAILABLE";
    },
  ) {
    super(
      options?.code ?? "PROVIDER_REQUEST_FAILED",
      message,
      "AI 분석 결과를 받을 수 없습니다. 잠시 후 다시 시도해 주세요.",
      options,
    );
  }
}

export { AnalysisProviderError as ImageAnalysisProviderError };
