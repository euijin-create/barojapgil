import "server-only";

import type {
  AnalyzeImageInput,
  ImageAnalysisProvider,
} from "@/application/ports/image-analysis-provider";
import {
  parseImageAnalysisResult,
  type ImageAnalysisResult,
} from "@/contracts/analysis-v1";

export const MOCK_ANALYSIS_NOTICE =
  "현재 데모 분석 결과이며 실제 업로드 파일을 AI가 판독한 결과가 아닙니다.";

const MOCK_IMAGE_ANALYSIS_RESULT: ImageAnalysisResult = {
  analysisId: "demo-image-analysis-001",
  suspectedViolation: true,
  violationType: "SIGNAL_VIOLATION",
  confidence: 0.87,
  summary:
    "적색으로 보이는 신호 상태에서 대상 차량이 교차로 방향으로 진행한 장면으로 보입니다.",
  reasoningSummary:
    "적색으로 보이는 신호와 차량의 진행 위치가 함께 보입니다. 다만 정지선을 넘는 전체 과정은 이미지 한 장만으로 확인하기 어렵습니다.",
  plateNumberCandidate: "12가 34**",
  occurredAtCandidate: null,
  locationCandidate: null,
  evidenceItems: [
    {
      name: "차량 식별",
      status: "CLEAR",
      description:
        "대상 차량과 일부 번호판 문자가 보이지만 사용자 확인이 필요합니다.",
    },
    {
      name: "신호 상태",
      status: "CLEAR",
      description: "대상 차량 전방의 적색 신호가 보입니다.",
    },
    {
      name: "교차로 진입 장면",
      status: "UNCERTAIN",
      description:
        "정지선 전·후의 연속 장면이 없어 진입 시점은 추가 확인이 필요합니다.",
    },
    {
      name: "발생 장소",
      status: "MISSING",
      description: "이미지에서 장소를 확인할 정보가 보이지 않습니다.",
    },
  ],
  missingEvidence: [
    "정지선을 넘는 전·후 연속 장면",
    "발생 시각을 확인할 수 있는 정보",
    "발생 장소를 확인할 수 있는 정보",
  ],
  warnings: [
    MOCK_ANALYSIS_NOTICE,
    "AI 참고 분석이며 최종 위법 판단은 관계기관이 수행합니다.",
    "차량번호, 발생 시각, 장소 등 모든 추출 정보를 사용자가 최종 확인해야 합니다.",
  ],
};

export class MockImageAnalysisProvider implements ImageAnalysisProvider {
  readonly kind = "mock" as const;

  analyzeImage(input: AnalyzeImageInput): Promise<ImageAnalysisResult> {
    void input;
    // parse는 fixture도 실제 provider와 같은 런타임 계약을 통과하게 한다.
    return Promise.resolve(parseImageAnalysisResult(MOCK_IMAGE_ANALYSIS_RESULT));
  }
}
