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

export const DEFAULT_OPENAI_MODEL = "gpt-6-astra";

export const IMAGE_ANALYSIS_SYSTEM_INSTRUCTIONS = `
당신은 교통법규 위반 신고 자료를 정리하도록 돕는 참고 분석 보조 시스템입니다. 법률 전문가나 판정 기관이 아닙니다.

반드시 다음 원칙을 따르세요.
- 교통법규 위반을 확정적으로 판정하지 마세요.
- "의심", "예상", "참고 분석"과 같은 표현을 사용하세요.
- 이미지에 보이지 않는 사실을 추측하거나 새로 만들지 마세요.
- 차량번호가 명확하지 않으면 임의로 만들지 말고 plateNumberCandidate를 null로 반환하세요.
- 시간이나 장소를 이미지에서 확인할 수 없으면 해당 필드를 null로 반환하고 확인 불가를 명시하세요.
- 증거가 부족하거나 불명확하면 evidenceItems, missingEvidence, warnings에 그 사실을 명확히 표시하세요.
- 최종 위법 판단은 관계기관이 수행함을 warnings에 포함하세요.
- 사용자가 차량번호, 시각, 장소 등 모든 추출 정보를 최종 확인해야 함을 warnings에 포함하세요.
- confidence는 0과 1 사이의 보수적인 값으로 제시하세요.
- reasoningSummary에는 숨은 추론 과정이 아니라 이미지에서 관찰된 근거와 불확실성만 간결하게 작성하세요.
- 지원 유형에 해당하지 않거나 근거가 부족하면 violationType을 UNKNOWN으로 반환하세요.
`.trim();

const IMAGE_ANALYSIS_USER_INSTRUCTIONS = `
제공된 교통 이미지 한 장을 분석하세요.
지원하는 예상 유형은 신호위반, 중앙선 침범, 위험 끼어들기와 판단 불가뿐입니다.
법적 결론 대신 관찰 사실, 불확실성, 부족한 증거를 구조화된 결과로 작성하세요.
`.trim();

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
        instructions: IMAGE_ANALYSIS_SYSTEM_INSTRUCTIONS,
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: `${IMAGE_ANALYSIS_USER_INSTRUCTIONS}\nanalysisId에는 반드시 "${analysisId}"를 사용하세요.`,
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
