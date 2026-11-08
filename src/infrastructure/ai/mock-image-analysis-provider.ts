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

const BASE_WARNINGS = [
  MOCK_ANALYSIS_NOTICE,
  "AI 참고 분석이며 최종 위법 판단은 관계기관이 수행합니다.",
  "차량번호, 발생 시각, 장소, 예상 위반 유형 등 모든 추출 정보를 사용자가 최종 확인해야 합니다.",
] as const;

/**
 * 이미지 판단 원칙의 대표 시나리오다. 각 fixture는 모듈 로딩 시 공통
 * Structured Output 계약으로 검증되어 mock과 OpenAI provider의 형태가 어긋나지 않는다.
 */
export const MOCK_IMAGE_ANALYSIS_SCENARIOS = {
  noTrafficContext: parseImageAnalysisResult({
    analysisId: "demo-image-no-traffic-001",
    mediaType: "IMAGE",
    suspectedViolation: false,
    violationType: "UNKNOWN",
    confidence: 0.08,
    summary:
      "차량이나 교통법규 위반 후보를 식별할 수 있는 도로 요소가 충분히 보이지 않습니다.",
    reasoningSummary:
      "화면에서 차량, 차선, 신호, 표지를 명확히 확인할 수 없어 합리적인 예상 유형을 제시하기 어렵습니다.",
    plateNumberCandidate: null,
    occurredAtCandidate: null,
    locationCandidate: null,
    evidenceItems: [
      {
        name: "대상 차량",
        status: "MISSING",
        description: "분석할 대상 차량이 화면에서 확인되지 않습니다.",
      },
      {
        name: "도로·교통시설",
        status: "UNCERTAIN",
        description: "차선, 신호, 표지 등 상황을 구분할 요소가 불명확합니다.",
      },
    ],
    missingEvidence: [
      "대상 차량이 포함된 선명한 장면",
      "차선·신호·표지와 주변 도로 상황이 보이는 장면",
    ],
    warnings: [...BASE_WARNINGS],
    needsTemporalEvidence: false,
  }),
  stopLineOrCrosswalk: parseImageAnalysisResult({
    analysisId: "demo-image-stop-line-001",
    mediaType: "IMAGE",
    suspectedViolation: true,
    violationType: "STOP_LINE_OR_CROSSWALK",
    confidence: 0.78,
    summary:
      "대상 차량이 정지선과 횡단보도 일부를 넘어 위치한 것으로 보여 정지선·횡단보도 침범이 의심됩니다.",
    reasoningSummary:
      "차량 앞부분과 정지선·횡단보도의 상대 위치는 사진에서 확인됩니다. 다만 차량의 통과 과정과 보행자 통행 방해 여부는 사진 한 장으로 확인할 수 없습니다.",
    plateNumberCandidate: "12가3456",
    occurredAtCandidate: null,
    locationCandidate: null,
    evidenceItems: [
      {
        name: "차량 위치",
        status: "CLEAR",
        description: "차량 앞부분이 횡단보도 영역 위에 위치한 모습이 보입니다.",
      },
      {
        name: "정지선 위치",
        status: "CLEAR",
        description: "차량 뒤쪽에 정지선으로 보이는 굵은 흰색 선이 보입니다.",
      },
      {
        name: "횡단보도 위치",
        status: "CLEAR",
        description: "차량 아래와 전방에 횡단보도 표시가 보입니다.",
      },
      {
        name: "보행자 통행 방해 여부",
        status: "UNCERTAIN",
        description: "보행자의 이동 전후 상황이 없어 통행 방해 여부는 확인하기 어렵습니다.",
      },
      {
        name: "차량 식별",
        status: "CLEAR",
        description: "번호판 문자가 보이지만 사용자가 원본과 대조해야 합니다.",
      },
      {
        name: "촬영 시각",
        status: "MISSING",
        description: "사진에서 촬영 시각을 확인할 정보가 보이지 않습니다.",
      },
      {
        name: "발생 장소",
        status: "MISSING",
        description: "사진에서 장소를 확인할 표지나 위치 정보가 보이지 않습니다.",
      },
    ],
    missingEvidence: [
      "차량이 정지선에 접근하고 멈추거나 통과하는 전후 영상",
      "보행자 통행 방해 여부를 확인할 전후 장면",
      "발생 시각과 장소를 확인할 정보",
    ],
    warnings: [
      ...BASE_WARNINGS,
      "사진만으로 차량의 이동 과정을 확인할 수 없어 영상 확인이 필요합니다.",
    ],
    needsTemporalEvidence: true,
  }),
  signalWithUnknownMovement: parseImageAnalysisResult({
    analysisId: "demo-image-signal-001",
    mediaType: "IMAGE",
    suspectedViolation: true,
    violationType: "SIGNAL_VIOLATION",
    confidence: 0.64,
    summary:
      "적색으로 보이는 신호와 교차로 부근 차량이 함께 보여 신호위반 가능성을 추가로 확인할 필요가 있습니다.",
    reasoningSummary:
      "사진에는 신호 상태와 차량 위치가 함께 보이지만, 차량이 적색 신호 중 실제로 정지선을 넘어 진입했는지는 확인할 수 없습니다.",
    plateNumberCandidate: null,
    occurredAtCandidate: null,
    locationCandidate: null,
    evidenceItems: [
      {
        name: "차량 식별",
        status: "UNCERTAIN",
        description: "대상 차량은 보이지만 번호판 문자는 명확하게 읽히지 않습니다.",
      },
      {
        name: "신호 상태",
        status: "CLEAR",
        description: "적색으로 보이는 신호등이 화면에 포함되어 있습니다.",
      },
      {
        name: "차량 진입 시점",
        status: "MISSING",
        description: "단일 사진이어서 차량의 교차로 진입 시점을 확인할 수 없습니다.",
      },
      {
        name: "정지선·교차로 위치",
        status: "UNCERTAIN",
        description: "차량과 교차로는 보이지만 해당 차로의 정지선 위치가 일부 가려져 있습니다.",
      },
      {
        name: "전후 상황",
        status: "MISSING",
        description: "신호 변화와 차량 이동을 확인할 전후 장면이 없습니다.",
      },
      {
        name: "촬영 시각",
        status: "MISSING",
        description: "사진에서 촬영 시각을 확인할 수 없습니다.",
      },
      {
        name: "발생 장소",
        status: "MISSING",
        description: "사진에서 장소를 확인할 수 없습니다.",
      },
    ],
    missingEvidence: [
      "신호 변화와 차량 진입 시점을 함께 확인할 전후 영상",
      "해당 차로의 정지선과 신호 적용 방향이 선명한 장면",
      "선명한 번호판 장면",
    ],
    warnings: [
      ...BASE_WARNINGS,
      "신호위반 가능성은 참고 후보이며 실제 진입 시점은 영상에서 확인해야 합니다.",
    ],
    needsTemporalEvidence: true,
  }),
  blurredPlate: parseImageAnalysisResult({
    analysisId: "demo-image-blurred-plate-001",
    mediaType: "IMAGE",
    suspectedViolation: true,
    violationType: "ILLEGAL_PARKING",
    confidence: 0.58,
    summary:
      "차량이 횡단보도와 가까운 도로 가장자리에 정차한 것으로 보여 불법 주정차 가능성을 확인할 필요가 있습니다.",
    reasoningSummary:
      "차량의 정적 위치와 주변 횡단보도는 보이지만 정차 지속 시간과 예외 상황은 확인할 수 없습니다. 번호판은 흐려 후보를 반환하지 않습니다.",
    plateNumberCandidate: null,
    occurredAtCandidate: null,
    locationCandidate: null,
    evidenceItems: [
      {
        name: "차량 위치",
        status: "CLEAR",
        description: "차량이 도로 가장자리와 횡단보도 가까이에 위치해 있습니다.",
      },
      {
        name: "주정차 금지 표지·노면 표시",
        status: "UNCERTAIN",
        description: "일부 노면 표시가 보이지만 금지 구역 여부를 확정하기 어렵습니다.",
      },
      {
        name: "정차 지속 여부",
        status: "MISSING",
        description: "사진 한 장으로 정차가 지속되었는지 확인할 수 없습니다.",
      },
      {
        name: "차량 식별",
        status: "UNCERTAIN",
        description: "번호판이 흐려 문자를 신뢰할 수 있게 판독할 수 없습니다.",
      },
      {
        name: "촬영 시각·장소",
        status: "MISSING",
        description: "사진에서 시각과 장소를 확인할 수 없습니다.",
      },
    ],
    missingEvidence: [
      "정차 지속 여부를 확인할 시간 순서가 있는 장면",
      "주정차 금지 표지와 노면 표시가 선명한 장면",
      "번호판을 명확히 확인할 수 있는 원본 장면",
    ],
    warnings: [
      ...BASE_WARNINGS,
      "번호판이 흐려 임의의 차량번호 후보를 만들지 않았습니다.",
    ],
    needsTemporalEvidence: true,
  }),
} as const;

const MOCK_IMAGE_ANALYSIS_RESULT: ImageAnalysisResult =
  MOCK_IMAGE_ANALYSIS_SCENARIOS.stopLineOrCrosswalk;

export class MockImageAnalysisProvider implements ImageAnalysisProvider {
  readonly kind = "mock" as const;

  analyzeImage(input: AnalyzeImageInput): Promise<ImageAnalysisResult> {
    void input;
    return Promise.resolve(MOCK_IMAGE_ANALYSIS_RESULT);
  }
}
