export type ViolationType = "signal" | "center" | "cutin" | "unknown";

export interface Candidate {
  id: string;
  start: string;
  end: string;
  type: ViolationType;
  confidence: number;
  plate: string;
  occurredAt: string;
  location: string;
  reasoning: string;
  evidence: {
    met: string[];
    unclear: string[];
    missing: string[];
  };
}

export const violationLabels: Record<ViolationType, string> = {
  signal: "신호위반",
  center: "중앙선 침범",
  cutin: "위험 끼어들기",
  unknown: "판단 불가",
};

export const MOCK_CANDIDATES: Candidate[] = [
  {
    id: "signal-01",
    start: "00:42",
    end: "00:49",
    type: "signal",
    confidence: 91,
    plate: "12가 34**",
    occurredAt: "2026-09-19T14:32",
    location: "서울시 안전구 교통로 교차로 부근 (예시)",
    reasoning:
      "차량이 교차로에 진입하는 장면과 적색으로 보이는 신호가 같은 구간에 포착되었습니다. 신호의 적용 방향과 정지선 위치는 사용자가 다시 확인해야 합니다.",
    evidence: {
      met: [
        "진입 전후 차량의 이동 장면이 연속해서 보입니다.",
        "교차로 신호등이 영상에 포함되어 있습니다.",
      ],
      unclear: [
        "신호등이 해당 차로에 적용되는지 각도를 다시 확인해야 합니다.",
      ],
      missing: [
        "번호판 일부 문자가 선명하지 않아 원본 영상 확인이 필요합니다.",
      ],
    },
  },
  {
    id: "center-02",
    start: "03:15",
    end: "03:22",
    type: "center",
    confidence: 84,
    plate: "34나 56**",
    occurredAt: "2026-09-19T14:35",
    location: "서울시 안전구 중앙로 일대 (예시)",
    reasoning:
      "차량이 도로 중앙의 선을 넘어 이동하는 모습으로 보입니다. 선의 종류와 일시적인 도로 상황은 추가 확인이 필요합니다.",
    evidence: {
      met: [
        "차량이 선을 넘는 전후 움직임이 보입니다.",
        "중앙선으로 보이는 도로 표시가 화면에 담겼습니다.",
      ],
      unclear: [
        "도로 표시의 색상과 연속성을 원본에서 확인해야 합니다.",
      ],
      missing: [
        "도로 공사 등 예외 상황을 확인할 수 있는 주변 장면이 부족합니다.",
      ],
    },
  },
  {
    id: "cutin-03",
    start: "07:31",
    end: "07:39",
    type: "cutin",
    confidence: 76,
    plate: "56다 78**",
    occurredAt: "2026-09-19T14:39",
    location: "서울시 안전구 순환로 합류 구간 (예시)",
    reasoning:
      "옆 차로 차량이 짧은 간격으로 진입하는 장면으로 보입니다. 실제 차간 거리와 주변 차량의 반응은 영상에서 다시 확인해야 합니다.",
    evidence: {
      met: [
        "차선 변경 전후의 차량 이동이 연속해서 보입니다.",
      ],
      unclear: [
        "차간 거리를 화면만으로 정확히 판단하기 어렵습니다.",
        "상대 차량의 방향지시등 상태가 뚜렷하지 않습니다.",
      ],
      missing: [
        "진입 직전의 충분한 전후 문맥이 필요합니다.",
      ],
    },
  },
];

export const PHOTO_CANDIDATE: Candidate = {
  id: "photo-01",
  start: "단일 사진",
  end: "",
  type: "unknown",
  confidence: 62,
  plate: "확인 필요",
  occurredAt: "2026-09-19T14:32",
  location: "장소 확인 필요",
  reasoning:
    "사진 한 장에서는 차량과 도로 상황을 일부 확인할 수 있지만, 움직임과 전후 맥락을 확인할 수 없어 예상 위반 유형을 단정하기 어렵습니다.",
  evidence: {
    met: ["차량과 주변 도로가 사진에 담겼습니다."],
    unclear: ["사진만으로 신호 상태와 주행 방향을 판단하기 어렵습니다."],
    missing: ["위반 전후 차량 움직임을 확인할 연속 영상이 없습니다."],
  },
};

export type ReportStatus =
  | "analyzing"
  | "ready"
  | "delayed"
  | "available"
  | "completed";

export interface MockReport {
  id: string;
  title: string;
  subtitle: string;
  status: ReportStatus;
  date: string;
  type: ViolationType;
}

export const MOCK_REPORTS: MockReport[] = [
  {
    id: "sample-01",
    title: "오후 주행 영상",
    subtitle: "AI 참고 분석 진행 중 · 체험용 내역",
    status: "analyzing",
    date: "09.19",
    type: "signal",
  },
  {
    id: "sample-02",
    title: "교차로 블랙박스 영상",
    subtitle: "신고 자료 검토를 기다리고 있어요 · 체험용 내역",
    status: "ready",
    date: "09.18",
    type: "signal",
  },
  {
    id: "sample-03",
    title: "도로 주행 사진",
    subtitle: "설정한 버튼 활성 시각을 기다리는 중 · 체험용 내역",
    status: "delayed",
    date: "09.17",
    type: "center",
  },
  {
    id: "sample-04",
    title: "합류 구간 영상",
    subtitle: "안전신문고 이동 버튼이 활성화된 예시 · 체험용 내역",
    status: "available",
    date: "09.16",
    type: "cutin",
  },
  {
    id: "sample-05",
    title: "지난 신고 기록",
    subtitle: "사용자가 완료로 표시한 예시 · 체험용 내역",
    status: "completed",
    date: "09.15",
    type: "signal",
  },
];

export interface RiskArea {
  id: string;
  name: string;
  region: string;
  type: Exclude<ViolationType, "unknown">;
  count: number;
  level: "높음" | "보통" | "낮음";
  x: number;
  y: number;
}

// 위치와 수치는 실제 신고 데이터가 아닌 화면 체험용 합성 예시다.
export const RISK_AREAS: RiskArea[] = [
  {
    id: "area-01",
    name: "북부 교차로 일대",
    region: "서울 · 예시 구역 A",
    type: "signal",
    count: 28,
    level: "높음",
    x: 30,
    y: 26,
  },
  {
    id: "area-02",
    name: "중앙로 굽은 구간",
    region: "서울 · 예시 구역 B",
    type: "center",
    count: 16,
    level: "보통",
    x: 63,
    y: 42,
  },
  {
    id: "area-03",
    name: "남부 합류 구간",
    region: "경기 · 예시 구역 C",
    type: "cutin",
    count: 22,
    level: "높음",
    x: 44,
    y: 72,
  },
  {
    id: "area-04",
    name: "동측 교차로 일대",
    region: "경기 · 예시 구역 D",
    type: "signal",
    count: 20,
    level: "낮음",
    x: 78,
    y: 77,
  },
];
