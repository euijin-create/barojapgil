"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  MOCK_CANDIDATES,
  PHOTO_CANDIDATE,
  violationLabels,
  type Candidate,
  type ViolationType,
} from "@/lib/demo-data";
import {
  imageAnalysisResultSchema,
  type ImageAnalysisResult,
  type ViolationTypeCode,
} from "@/contracts/analysis-v1";

export interface ReportDraft {
  plate: string;
  occurredAt: string;
  location: string;
  violationType: ViolationType;
  statement: string;
}

export type DelayHours = 0 | 6 | 12 | 24;

export type AnalysisRequestStatus = "idle" | "loading" | "success" | "error";

export interface AnalysisRequestError {
  code: string;
  message: string;
}

interface DemoContextValue {
  selectedFiles: File[];
  selectedFile: File | null;
  previewUrl: string | null;
  mediaKind: "image" | "video" | null;
  setMediaFiles: (files: File[]) => void;
  setMediaFile: (file: File | null) => void;
  candidates: Candidate[];
  selectedCandidateId: string;
  selectedCandidate: Candidate;
  selectCandidate: (id: string) => void;
  analysisStarted: boolean;
  analysisStartedAt: number | null;
  setAnalysisStarted: (value: boolean) => void;
  analysisStatus: AnalysisRequestStatus;
  analysisError: AnalysisRequestError | null;
  imageAnalysisResult: ImageAnalysisResult | null;
  analysisProvider: "mock" | "openai" | null;
  analysisIsDemo: boolean | null;
  analyzeSelectedImage: () => Promise<void>;
  cancelAnalysis: () => void;
  draft: ReportDraft;
  updateDraft: (patch: Partial<ReportDraft>) => void;
  regenerateStatement: () => void;
  delayHours: DelayHours | null;
  scheduledAt: number | null;
  scheduleDelay: (hours: DelayHours) => void;
  reportComplete: boolean;
  markReportComplete: () => void;
  riskConsent: boolean;
  setRiskConsent: (value: boolean) => void;
}

const VIOLATION_TYPE_MAP: Record<ViolationTypeCode, ViolationType> = {
  SIGNAL_VIOLATION: "signal",
  CENTER_LINE_VIOLATION: "center",
  DANGEROUS_MERGE: "cutin",
  UNKNOWN: "unknown",
};

function unique(items: string[]): string[] {
  return [...new Set(items.filter((item) => item.trim().length > 0))];
}

function toCandidate(result: ImageAnalysisResult): Candidate {
  const evidence = {
    met: result.evidenceItems
      .filter((item) => item.status === "CLEAR")
      .map((item) => `${item.name}: ${item.description}`),
    unclear: result.evidenceItems
      .filter((item) => item.status === "UNCERTAIN")
      .map((item) => `${item.name}: ${item.description}`),
    missing: result.evidenceItems
      .filter((item) => item.status === "MISSING")
      .map((item) => `${item.name}: ${item.description}`),
  };

  return {
    id: result.analysisId,
    start: "단일 사진",
    end: "",
    type: result.suspectedViolation
      ? VIOLATION_TYPE_MAP[result.violationType]
      : "unknown",
    confidence: Math.round(Math.max(0, Math.min(1, result.confidence)) * 100),
    plate: result.plateNumberCandidate?.trim() || "확인 필요",
    occurredAt: result.occurredAtCandidate?.trim() || "",
    location: result.locationCandidate?.trim() || "장소 확인 필요",
    reasoning: unique([
      result.summary.trim(),
      result.reasoningSummary.trim(),
    ]).join(" "),
    evidence: {
      met: unique(evidence.met),
      unclear: unique(evidence.unclear),
      missing: unique([
        ...evidence.missing,
        ...result.missingEvidence,
      ]),
    },
  };
}

function readErrorCode(payload: unknown): string | null {
  if (!payload || typeof payload !== "object" || !("error" in payload)) return null;
  const error = payload.error;
  if (!error || typeof error !== "object" || !("code" in error)) return null;
  return typeof error.code === "string" ? error.code : null;
}

function friendlyAnalysisError(code: string, status?: number): AnalysisRequestError {
  const normalizedCode = code.toUpperCase();

  if (normalizedCode.includes("UNSUPPORTED") || normalizedCode.includes("MEDIA_TYPE")) {
    return {
      code,
      message: "지원하지 않는 사진 형식입니다. JPG, PNG 또는 WEBP 파일을 선택해 주세요.",
    };
  }
  if (normalizedCode.includes("TOO_LARGE") || status === 413) {
    return {
      code,
      message: "사진 용량이 너무 큽니다. 10 MB 이하 파일을 선택해 주세요.",
    };
  }
  if (
    normalizedCode.includes("EMPTY") ||
    normalizedCode.includes("INVALID_FILE") ||
    normalizedCode.includes("INVALID_IMAGE") ||
    normalizedCode === "IMAGE_REQUIRED" ||
    normalizedCode === "TOO_MANY_FILES" ||
    normalizedCode === "INVALID_REQUEST"
  ) {
    return {
      code,
      message: "사진 파일을 확인할 수 없습니다. 다른 파일을 선택해 주세요.",
    };
  }
  if (normalizedCode.includes("RATE") || status === 429) {
    return {
      code,
      message: "분석 요청이 많습니다. 잠시 후 다시 시도해 주세요.",
    };
  }
  if (
    normalizedCode.includes("CONFIG") ||
    normalizedCode === "PROVIDER_NOT_CONFIGURED" ||
    normalizedCode === "INVALID_PROVIDER_CONFIGURATION"
  ) {
    return {
      code,
      message: "AI 분석 설정 오류가 발생했습니다. 관리자에게 설정 확인을 요청해 주세요.",
    };
  }
  if (
    normalizedCode.includes("RESULT") ||
    normalizedCode.includes("RESPONSE") ||
    normalizedCode.includes("SCHEMA")
  ) {
    return {
      code,
      message: "분석 결과를 안전하게 확인하지 못했습니다. 다시 분석해 주세요.",
    };
  }
  if (
    normalizedCode.includes("PROVIDER") ||
    normalizedCode.includes("UPSTREAM") ||
    normalizedCode === "ANALYSIS_UNAVAILABLE"
  ) {
    return {
      code,
      message: "AI 분석 결과를 받을 수 없습니다. 잠시 후 다시 시도해 주세요.",
    };
  }
  if (normalizedCode === "INTERNAL_SERVER_ERROR" || status === 500) {
    return {
      code,
      message: "서버 오류로 사진을 분석하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    };
  }

  return {
    code,
    message: "사진을 분석하지 못했습니다. 잠시 후 다시 시도해 주세요.",
  };
}

function createStatement(
  candidate: Candidate,
  values?: ReportDraft,
  isDemo = true,
): string {
  const time = (values?.occurredAt ?? candidate.occurredAt).replace("T", " ") || "[발생 시각 확인 필요]";
  const location = values
    ? values.location.trim() || "[장소 확인 필요]"
    : candidate.location || "[장소 확인 필요]";
  const suggestedPlate = values ? values.plate.trim() : candidate.plate;
  const plate =
    suggestedPlate && suggestedPlate !== "확인 필요"
      ? suggestedPlate
      : "[차량번호 확인 필요]";
  const vehicle =
    plate === "[차량번호 확인 필요]"
      ? "차량번호를 확인할 수 없는 차량"
      : "차량번호 " + plate + "로 보이는 차량";
  const type = values?.violationType ?? candidate.type;
  const medium = candidate.start === "단일 사진" ? "사진" : "영상";
  const observedScene =
    type === "unknown"
      ? "위반 유형과 주변 상황을 원본 자료에서 확인해 주시기 바랍니다."
      : violationLabels[type] + "이 의심되는 장면으로 보이는 부분을 확인해 주시기 바랍니다.";
  return (
    (isDemo
      ? "※ 체험용 문장 예시입니다. 실제 자료와 대조해 수정해 주세요.\n"
      : "※ AI 참고 분석을 바탕으로 작성한 초안입니다. 원본 자료와 대조해 수정해 주세요.\n") +
    time +
    "경 " +
    location +
    "에서 촬영한 자료입니다. " +
    medium +
    "에 " +
    vehicle +
    "이 담겼습니다. " +
    observedScene
  );
}

function createDraft(candidate: Candidate, isDemo = true): ReportDraft {
  return {
    plate: candidate.plate,
    occurredAt: candidate.occurredAt,
    location: candidate.location,
    violationType: candidate.type,
    statement: createStatement(candidate, undefined, isDemo),
  };
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const [mediaKind, setMediaKind] = useState<"image" | "video" | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState(MOCK_CANDIDATES[0].id);
  const [analysisStarted, setAnalysisStartedValue] = useState(false);
  const [analysisStartedAt, setAnalysisStartedAt] = useState<number | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisRequestStatus>("idle");
  const [analysisError, setAnalysisError] = useState<AnalysisRequestError | null>(null);
  const [imageAnalysisResult, setImageAnalysisResult] = useState<ImageAnalysisResult | null>(null);
  const [analysisProvider, setAnalysisProvider] = useState<"mock" | "openai" | null>(null);
  const [analysisIsDemo, setAnalysisIsDemo] = useState<boolean | null>(null);
  const analysisAbortRef = useRef<AbortController | null>(null);
  const [draft, setDraft] = useState<ReportDraft>(() => createDraft(MOCK_CANDIDATES[0]));
  const statementEditedRef = useRef(false);
  const [delayHours, setDelayHours] = useState<DelayHours | null>(null);
  const [scheduledAt, setScheduledAt] = useState<number | null>(null);
  const [reportComplete, setReportComplete] = useState(false);
  const [riskConsent, setRiskConsent] = useState(false);

  const imageCandidate = useMemo(
    () => (imageAnalysisResult ? toCandidate(imageAnalysisResult) : PHOTO_CANDIDATE),
    [imageAnalysisResult],
  );
  const candidates = useMemo(
    () => (mediaKind === "image" ? [imageCandidate] : MOCK_CANDIDATES),
    [imageCandidate, mediaKind],
  );
  const selectedCandidate =
    candidates.find((candidate) => candidate.id === selectedCandidateId) ?? candidates[0];

  const setAnalysisStarted = useCallback((value: boolean) => {
    setAnalysisStartedValue(value);
    setAnalysisStartedAt(value ? Date.now() : null);
  }, []);

  const cancelAnalysis = useCallback(() => {
    analysisAbortRef.current?.abort();
    analysisAbortRef.current = null;
    setAnalysisStatus("idle");
    setAnalysisError(null);
    setAnalysisStartedValue(false);
    setAnalysisStartedAt(null);
  }, []);

  const analyzeSelectedImage = useCallback(async () => {
    if (!selectedFile || mediaKind !== "image") {
      setAnalysisStatus("error");
      setAnalysisError({
        code: "IMAGE_REQUIRED",
        message: "분석할 사진이 없습니다. 사진을 다시 선택해 주세요.",
      });
      return;
    }

    analysisAbortRef.current?.abort();
    const controller = new AbortController();
    analysisAbortRef.current = controller;
    setAnalysisStartedValue(true);
    setAnalysisStartedAt(Date.now());
    setAnalysisStatus("loading");
    setAnalysisError(null);
    setImageAnalysisResult(null);
    setAnalysisProvider(null);
    setAnalysisIsDemo(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      const response = await fetch("/api/analyze-image", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      let payload: unknown = null;
      try {
        payload = await response.json();
      } catch {
        // HTML 또는 provider 원문을 화면에 노출하지 않고 안전한 오류로 처리합니다.
      }

      if (!response.ok) {
        const code = readErrorCode(payload) ?? `HTTP_${response.status}`;
        setAnalysisError(friendlyAnalysisError(code, response.status));
        setAnalysisStatus("error");
        return;
      }

      if (!payload || typeof payload !== "object") {
        setAnalysisError(friendlyAnalysisError("INVALID_RESULT"));
        setAnalysisStatus("error");
        return;
      }

      const provider = "provider" in payload ? payload.provider : null;
      const isDemo = "isDemo" in payload ? payload.isDemo : null;
      const rawResult = "result" in payload ? payload.result : null;
      const parsedResult = imageAnalysisResultSchema.safeParse(rawResult);

      if (
        !parsedResult.success ||
        (provider !== "mock" && provider !== "openai") ||
        typeof isDemo !== "boolean"
      ) {
        setAnalysisError(friendlyAnalysisError("INVALID_RESULT"));
        setAnalysisStatus("error");
        return;
      }

      const candidate = toCandidate(parsedResult.data);
      setImageAnalysisResult(parsedResult.data);
      setAnalysisProvider(provider);
      setAnalysisIsDemo(isDemo);
      setSelectedCandidateId(candidate.id);
      setDraft(createDraft(candidate, isDemo));
      statementEditedRef.current = false;
      setAnalysisStatus("success");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setAnalysisError({
        code: "NETWORK_ERROR",
        message: "분석 서버에 연결하지 못했습니다. 네트워크를 확인한 뒤 다시 시도해 주세요.",
      });
      setAnalysisStatus("error");
    } finally {
      if (analysisAbortRef.current === controller) analysisAbortRef.current = null;
    }
  }, [mediaKind, selectedFile]);

  const setMediaFiles = useCallback((files: File[]) => {
    const file = files[0] ?? null;
    analysisAbortRef.current?.abort();
    analysisAbortRef.current = null;
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    const nextUrl = file ? URL.createObjectURL(file) : null;
    previewUrlRef.current = nextUrl;
    setPreviewUrl(nextUrl);
    setSelectedFiles([...files]);
    setSelectedFile(file);

    const nextKind = file?.type.startsWith("image/")
      ? "image"
      : file?.type.startsWith("video/")
        ? "video"
        : null;
    setMediaKind(nextKind);

    const firstCandidate = nextKind === "image" ? PHOTO_CANDIDATE : MOCK_CANDIDATES[0];
    setSelectedCandidateId(firstCandidate.id);
    setDraft(createDraft(firstCandidate));
    statementEditedRef.current = false;
    setAnalysisStarted(false);
    setAnalysisStatus("idle");
    setAnalysisError(null);
    setImageAnalysisResult(null);
    setAnalysisProvider(null);
    setAnalysisIsDemo(null);
    setDelayHours(null);
    setScheduledAt(null);
    setReportComplete(false);
  }, [setAnalysisStarted]);

  const setMediaFile = useCallback(
    (file: File | null) => setMediaFiles(file ? [file] : []),
    [setMediaFiles],
  );

  useEffect(() => {
    return () => {
      analysisAbortRef.current?.abort();
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const selectCandidate = useCallback(
    (id: string) => {
      const candidate = candidates.find((item) => item.id === id);
      if (!candidate) return;
      setSelectedCandidateId(id);
      setDraft(createDraft(candidate, analysisIsDemo ?? true));
      statementEditedRef.current = false;
      setDelayHours(null);
      setScheduledAt(null);
      setReportComplete(false);
    },
    [analysisIsDemo, candidates],
  );

  const updateDraft = useCallback(
    (patch: Partial<ReportDraft>) => {
      if (patch.statement !== undefined) statementEditedRef.current = true;
      setDraft((current) => {
        const next = { ...current, ...patch };
        if (
          patch.statement === undefined &&
          !statementEditedRef.current &&
          (patch.plate !== undefined ||
            patch.occurredAt !== undefined ||
            patch.location !== undefined ||
            patch.violationType !== undefined)
        ) {
          next.statement = createStatement(
            selectedCandidate,
            next,
            analysisIsDemo ?? true,
          );
        }
        return next;
      });
    },
    [analysisIsDemo, selectedCandidate],
  );

  const regenerateStatement = useCallback(() => {
    statementEditedRef.current = false;
    setDraft((current) => ({
      ...current,
      statement: createStatement(
        selectedCandidate,
        current,
        analysisIsDemo ?? true,
      ),
    }));
  }, [analysisIsDemo, selectedCandidate]);

  const scheduleDelay = useCallback((hours: DelayHours) => {
    setDelayHours(hours);
    setScheduledAt(Date.now() + hours * 60 * 60 * 1000);
    setReportComplete(false);
  }, []);

  const markReportComplete = useCallback(() => {
    setReportComplete(true);
  }, []);

  const value = useMemo<DemoContextValue>(
    () => ({
      selectedFiles,
      selectedFile,
      previewUrl,
      mediaKind,
      setMediaFiles,
      setMediaFile,
      candidates,
      selectedCandidateId,
      selectedCandidate,
      selectCandidate,
      analysisStarted,
      analysisStartedAt,
      setAnalysisStarted,
      analysisStatus,
      analysisError,
      imageAnalysisResult,
      analysisProvider,
      analysisIsDemo,
      analyzeSelectedImage,
      cancelAnalysis,
      draft,
      updateDraft,
      regenerateStatement,
      delayHours,
      scheduledAt,
      scheduleDelay,
      reportComplete,
      markReportComplete,
      riskConsent,
      setRiskConsent,
    }),
    [
      selectedFiles,
      selectedFile,
      previewUrl,
      mediaKind,
      setMediaFiles,
      setMediaFile,
      candidates,
      selectedCandidateId,
      selectedCandidate,
      selectCandidate,
      analysisStarted,
      analysisStartedAt,
      setAnalysisStarted,
      analysisStatus,
      analysisError,
      imageAnalysisResult,
      analysisProvider,
      analysisIsDemo,
      analyzeSelectedImage,
      cancelAnalysis,
      draft,
      updateDraft,
      regenerateStatement,
      delayHours,
      scheduledAt,
      scheduleDelay,
      reportComplete,
      markReportComplete,
      riskConsent,
    ],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo(): DemoContextValue {
  const value = useContext(DemoContext);
  if (!value) throw new Error("DemoProvider가 필요합니다.");
  return value;
}
