import "server-only";

import { randomUUID } from "node:crypto";

import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";

import {
  AnalysisUnavailableError,
  ProviderConfigurationError,
  type AnalyzeImageInput,
  type ImageAnalysisProvider,
} from "@/application/ports/image-analysis-provider";
import {
  imageAnalysisResultSchema,
  parseImageAnalysisResult,
  type ImageAnalysisResult,
} from "@/contracts/analysis-v1";
import {
  getAnalysisSystemInstructions,
  getAnalysisUserInstructions,
} from "@/infrastructure/ai/analysis-instructions";

export const DEFAULT_OPENAI_MODEL = "gpt-6-astra";

export const IMAGE_ANALYSIS_SYSTEM_INSTRUCTIONS =
  getAnalysisSystemInstructions("IMAGE");
export const VIDEO_ANALYSIS_SYSTEM_INSTRUCTIONS =
  getAnalysisSystemInstructions("VIDEO");

export interface OpenAIImageAnalysisProviderOptions {
  apiKey: string | undefined;
  model?: string | undefined;
}

export class OpenAIImageAnalysisProvider implements ImageAnalysisProvider {
  readonly kind = "openai" as const;

  private readonly client: OpenAI;
  private readonly model: string;

  constructor(options: OpenAIImageAnalysisProviderOptions) {
    const apiKey = options.apiKey?.trim();

    if (!apiKey) {
      throw new ProviderConfigurationError(
        "OPENAI_API_KEY is required when ANALYSIS_PROVIDER=openai.",
        { code: "PROVIDER_NOT_CONFIGURED" },
      );
    }

    this.model = options.model?.trim() || DEFAULT_OPENAI_MODEL;
    this.client = new OpenAI({ apiKey });
  }

  async analyzeImage(input: AnalyzeImageInput): Promise<ImageAnalysisResult> {
    const analysisId = randomUUID();
    const imageDataUrl = `data:${input.mimeType};base64,${Buffer.from(input.bytes).toString("base64")}`;

    try {
      const response = await this.client.responses.parse({
        model: this.model,
        reasoning: { effort: "medium" },
        store: false,
        instructions: getAnalysisSystemInstructions(input.mediaType),
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `${getAnalysisUserInstructions(input.mediaType)}\nanalysisId에는 반드시 "${analysisId}"를 사용하고 mediaType에는 "${input.mediaType}"을 사용하세요.`,
              },
              {
                type: "input_image",
                image_url: imageDataUrl,
                detail: "high",
              },
            ],
          },
        ],
        text: {
          format: zodTextFormat(
            imageAnalysisResultSchema,
            "barojapgil_image_analysis",
            {
              description:
                "교통법규 위반 의심 이미지의 법적 결론이 아닌 참고 분석 결과",
            },
          ),
        },
      });

      if (!response.output_parsed) {
        throw new AnalysisUnavailableError(
          "OpenAI returned no parseable structured image analysis result.",
          { code: "INVALID_ANALYSIS_RESULT" },
        );
      }

      // API의 식별자 출력을 신뢰하지 않고 서버가 생성한 값으로 교체한다.
      return parseImageAnalysisResult({
        ...response.output_parsed,
        analysisId,
        mediaType: input.mediaType,
      });
    } catch (error) {
      if (error instanceof AnalysisUnavailableError) {
        throw error;
      }

      throw new AnalysisUnavailableError(
        "OpenAI Responses API image analysis failed.",
        { cause: error },
      );
    }
  }
}
