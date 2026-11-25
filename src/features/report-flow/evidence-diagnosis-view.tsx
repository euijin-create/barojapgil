"use client";

import { PrimaryButton, StatusBadge } from "@/components/ui";
import { useDemo } from "@/features/demo/demo-context";
import { violationLabels, type ViolationType } from "@/lib/demo-data";

const AI_DIAGNOSIS_NOTICE =
  "AI 참고 진단이며 최종 판단은 관계기관이 합니다.";
const MOCK_ANALYSIS_NOTICE =
  "현재 데모 분석 결과이며 실제 업로드 파일을 AI가 판독한 결과가 아닙니다.";

type DiagnosisStatus = "clear" | "uncertain" | "missing";

interface DiagnosisItem {
  id: string;
  title: string;
  description: string;
  status: DiagnosisStatus;
}

interface TypeEvidenceGuide {
  guidance: string;
  checklist: readonly string[];
}

const TYPE_EVIDENCE_GUIDES: Record<ViolationType, TypeEvidenceGuide> = {
  signal: {
    guidance:
      "적용 신호와 차량이 정지선 또는 교차로에 진입한 시점이 같은 흐름에서 확인되는지 살펴보세요.",
    checklist: [
      "차량 식별",
      "신호 상태",
      "차량 진입 시점",
      "정지선·교차로 위치",
      "위반 전후 상황",
      "촬영 시각",
      "발생 장소",
    ],
  },
  center: {
    guidance:
      "중앙선의 종류와 차량 위치, 반대 차로로 이동한 전후 과정 및 예외적인 도로 상황을 확인하세요.",
    checklist: [
      "중앙선 가시성",
      "차량 위치",
      "반대 차로 진입 여부",
      "이동 전후 장면",
      "차량 식별",
    ],
  },
  cutin: {
    guidance:
      "차선 변경 전후 흐름과 주변 차량 간격, 방향지시등 및 다른 차량의 반응을 함께 확인하세요.",
    checklist: [
      "차선 가시성",
      "차선 변경 과정",
      "주변 차량과 거리",
      "방향지시등 여부",
      "전후 영상",
    ],
  },
  stopLineCrosswalk: {
    guidance:
      "차량과 정지선·횡단보도의 상대 위치 및 보행자 통행에 영향을 주는 상황인지 확인하세요.",
    checklist: [
      "차량 위치",
      "정지선 위치",
      "횡단보도 위치",
      "보행자 통행 방해 여부",
      "차량 식별",
      "촬영 시각",
      "발생 장소",
    ],
  },
  illegalUTurn: {
    guidance:
      "유턴 전후 진행 방향과 도로 표지·노면 표시, 해당 위치에서의 허용 여부를 함께 확인하세요.",
    checklist: [
      "유턴 표지·노면 표시",
      "방향 전환 과정",
      "유턴 전후 진행 방향",
      "주변 차량과 보행자 상황",
      "차량 식별",
      "촬영 시각",
      "발생 장소",
    ],
  },
  intersection: {
    guidance:
      "교차로 진입·통과 과정과 지정 차로, 신호·노면 표시 및 주변 교통 흐름을 확인하세요.",
    checklist: [
      "교차로와 차로 가시성",
      "신호·노면 표시",
      "진입·통과 과정",
      "차량 진행 방향",
      "주변 교통 흐름",
      "차량 식별",
      "촬영 시각·장소",
    ],
  },
  illegalParking: {
    guidance:
      "차량의 정차 위치와 주정차 금지 표지·노면 표시, 머문 시간 및 통행 방해 상황을 확인하세요.",
    checklist: [
      "차량 정차 위치",
      "주정차 금지 표지·노면 표시",
      "정차 지속 여부",
      "차량·보행자 통행 방해 여부",
      "예외 상황 여부",
      "차량 식별",
      "촬영 시각·장소",
    ],
  },
  other: {
    guidance:
      "직접 확인한 교통 상황을 중심으로 관련 표지·차선과 차량 행동, 영향을 받은 도로 이용자를 살펴보세요.",
    checklist: [
      "관찰 가능한 상황",
      "관련 교통표지·차선",
      "차량 행동",
      "주변 도로 이용자 영향",
      "차량 식별",
      "촬영 시각",
      "발생 장소",
    ],
  },
  unknown: {
    guidance:
      "합리적인 위반 후보를 정하기 어려운 상태입니다. 보이는 도로 요소와 차량 위치, 전후 맥락을 다시 확인하세요.",
    checklist: [
      "차량·도로 요소 가시성",
      "교통표지·차선 가시성",
      "차량 식별 가능 여부",
      "이동 전후 맥락",
      "촬영 시각",
      "발생 장소",
    ],
  },
};

const STATUS_META: Record<
  DiagnosisStatus,
  {
    label: string;
    tone: "mint" | "orange" | "neutral";
    cardClassName: string;
    markClassName: string;
  }
> = {
  clear: {
    label: "✓ 충족",
    tone: "mint",
    cardClassName: "border-[#ccecdf] bg-[#f5fcf9]",
    markClassName: "bg-[var(--mint-soft)] text-[var(--mint-dark)]",
  },
  uncertain: {
    label: "△ 불명확",
    tone: "orange",
    cardClassName: "border-[#f3dfbd] bg-[#fffbf4]",
    markClassName: "bg-[var(--orange-soft)] text-[#a45e09]",
  },
  missing: {
    label: "× 부족",
    tone: "neutral",
    cardClassName: "border-[#f2ccd3] bg-[#fff8f9]",
    markClassName: "bg-[#fdecef] text-[#b43f58]",
  },
};

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("ko-KR");
}

function providerDiagnosisItems(
  result: NonNullable<ReturnType<typeof useDemo>["imageAnalysisResult"]>,
): DiagnosisItem[] {
  const items = result.evidenceItems.map((item, index) => ({
    id: `provider-${index}-${item.status}`,
    title: item.name,
    description: item.description,
    status:
      item.status === "CLEAR"
        ? ("clear" as const)
        : item.status === "UNCERTAIN"
          ? ("uncertain" as const)
          : ("missing" as const),
  }));
  const describedMissingEvidence = new Set(
    items
      .filter((item) => item.status === "missing")
      .map((item) => normalizeText(item.description)),
  );

  result.missingEvidence.forEach((description, index) => {
    if (describedMissingEvidence.has(normalizeText(description))) return;
    items.push({
      id: `provider-extra-missing-${index}`,
      title: `추가로 필요한 증거 ${index + 1}`,
      description,
      status: "missing",
    });
  });

  return items;
}

function demoDiagnosisItems(
  evidence: ReturnType<typeof useDemo>["selectedCandidate"]["evidence"],
): DiagnosisItem[] {
  return [
    ...evidence.met.map((description, index) => ({
      id: `demo-clear-${index}`,
      title: `확인된 예시 장면 ${index + 1}`,
      description,
      status: "clear" as const,
    })),
    ...evidence.unclear.map((description, index) => ({
      id: `demo-uncertain-${index}`,
      title: `추가 확인이 필요한 예시 장면 ${index + 1}`,
      description,
      status: "uncertain" as const,
    })),
    ...evidence.missing.map((description, index) => ({
      id: `demo-missing-${index}`,
      title: `부족한 예시 장면 ${index + 1}`,
      description,
      status: "missing" as const,
    })),
  ];
}

function matchesItem(item: DiagnosisItem, pattern: RegExp) {
  return pattern.test(`${item.title} ${item.description}`);
}

function prioritizeDiagnosisItems(items: DiagnosisItem[]) {
  const selected: DiagnosisItem[] = [];
  const selectedIds = new Set<string>();

  const pickFirst = (predicate: (item: DiagnosisItem) => boolean) => {
    const item = items.find(
      (candidate) => !selectedIds.has(candidate.id) && predicate(candidate),
    );
    if (!item) return;
    selected.push(item);
    selectedIds.add(item.id);
  };

  const isVehicle = (item: DiagnosisItem) =>
    matchesItem(item, /차량 식별|번호판|대상 차량/);
  const isTime = (item: DiagnosisItem) =>
    matchesItem(item, /발생 시각|촬영 시각|시간 정보|타임스탬프/);
  const isLocation = (item: DiagnosisItem) =>
    matchesItem(item, /발생 장소|장소 정보|도로명|주소/);
  const isTemporal = (item: DiagnosisItem) =>
    matchesItem(
      item,
      /전후|진입 시점|이동 과정|변경 과정|통과 과정|정차 지속|진행 방향/,
    );
  const isCoreSituation = (item: DiagnosisItem) =>
    !isVehicle(item) &&
    !isTime(item) &&
    !isLocation(item) &&
    !isTemporal(item) &&
    !item.title.startsWith("추가로 필요한 증거");

  pickFirst(isVehicle);
  pickFirst(isCoreSituation);
  pickFirst(isTime);
  pickFirst(isLocation);
  pickFirst(isTemporal);

  for (const item of items) {
    if (selected.length >= 5) break;
    if (selectedIds.has(item.id)) continue;
    selected.push(item);
    selectedIds.add(item.id);
  }

  return {
    primaryItems: selected,
    additionalItems: items.filter((item) => !selectedIds.has(item.id)),
  };
}

function compactDescription(item: DiagnosisItem) {
  const subject = item.title.replace(/^추가로 필요한 증거 \d+$/, "추가 증거");

  if (matchesItem(item, /차량 식별|번호판|대상 차량/)) {
    if (item.status === "clear") return "차량과 번호판 확인 가능";
    if (item.status === "uncertain") return "번호판 추가 확인 필요";
    return "차량 식별 정보 없음";
  }

  if (matchesItem(item, /발생 시각|촬영 시각|시간 정보|타임스탬프/)) {
    if (item.status === "clear") return "시각 정보 확인 가능";
    if (item.status === "uncertain") return "시각 정보 확인 필요";
    return "시각 정보 없음";
  }

  if (matchesItem(item, /발생 장소|장소 정보|도로명|주소/)) {
    if (item.status === "clear") return "장소 정보 확인 가능";
    if (item.status === "uncertain") return "장소 정보 확인 필요";
    return "장소 정보 없음";
  }

  if (
    matchesItem(
      item,
      /전후|진입 시점|이동 과정|변경 과정|통과 과정|정차 지속|진행 방향/,
    )
  ) {
    if (item.status === "clear") return "전후 흐름 확인 가능";
    if (item.status === "uncertain") return "전후 장면 추가 필요";
    return "전후 장면 없음";
  }

  if (item.status === "clear") return `${subject} 확인 가능`;
  if (item.status === "uncertain") return `${subject} 추가 확인 필요`;
  return `${subject} 정보 없음`;
}

function EvidenceItemCard({ item }: { item: DiagnosisItem }) {
  const meta = STATUS_META[item.status];

  return (
    <li
      className={`rounded-2xl border p-4 ${meta.cardClassName}`}
      aria-label={`${meta.label}: ${item.title}`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-base font-extrabold ${meta.markClassName}`}
          aria-hidden="true"
        >
          {item.status === "clear" ? "✓" : item.status === "uncertain" ? "△" : "×"}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-extrabold leading-6 text-[var(--navy)]">
              {item.title}
            </h3>
            <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
          </div>
          <p className="mt-1 line-clamp-2 text-sm leading-5 text-[#617b94]">
            {compactDescription(item)}
          </p>
        </div>
      </div>
    </li>
  );
}

export function EvidenceDiagnosisView() {
  const {
    selectedCandidate,
    imageAnalysisResult,
    analysisIsDemo,
    mediaKind,
    draft,
  } = useDemo();
  const usesProviderResult =
    mediaKind === "image" && imageAnalysisResult !== null;
  const items = usesProviderResult
    ? providerDiagnosisItems(imageAnalysisResult)
    : demoDiagnosisItems(selectedCandidate.evidence);
  const { primaryItems, additionalItems } = prioritizeDiagnosisItems(items);
  const counts = {
    clear: items.filter((item) => item.status === "clear").length,
    uncertain: items.filter((item) => item.status === "uncertain").length,
    missing: items.filter((item) => item.status === "missing").length,
  };
  const totalCount = items.length;
  const score = totalCount > 0
    ? Math.floor((counts.clear / totalCount) * 100)
    : 0;
  const isDemoSource = analysisIsDemo !== false;
  const reviewType = draft.violationType;
  const typeEvidenceGuide = TYPE_EVIDENCE_GUIDES[reviewType];
  const changedType = reviewType !== selectedCandidate.type;
  const needsTemporalEvidence =
    usesProviderResult && imageAnalysisResult.needsTemporalEvidence;

  return (
    <div className="page-container space-y-5 pb-10 pt-4">
      <section className="overflow-hidden rounded-2xl bg-[var(--navy)] p-6 text-white">
        <div className="flex items-end justify-between gap-4">
          <h1 className="text-[27px] font-extrabold leading-tight tracking-[-0.05em]">
            신고 증거 충족도
          </h1>
          <strong className="shrink-0 text-4xl font-extrabold tabular-nums">
            {score}
            <span className="ml-1 text-base text-[#bcd0e0]">/ 100</span>
          </strong>
        </div>

        <div
          className="mt-5 h-2 overflow-hidden rounded-full bg-white/15"
          role="meter"
          aria-label="신고 증거 충족도 참고 점수"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-[#68d4b8] transition-[width] duration-500"
            style={{ width: `${score}%` }}
          />
        </div>

        <dl className="mt-5 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-white/10 px-2 py-3 text-center">
            <dt className="text-xs font-bold text-[#bce9dc]">충족</dt>
            <dd className="mt-1 text-2xl font-extrabold">{counts.clear}</dd>
          </div>
          <div className="rounded-xl bg-white/10 px-2 py-3 text-center">
            <dt className="text-xs font-bold text-[#ffd99e]">불명확</dt>
            <dd className="mt-1 text-2xl font-extrabold">{counts.uncertain}</dd>
          </div>
          <div className="rounded-xl bg-white/10 px-2 py-3 text-center">
            <dt className="text-xs font-bold text-[#e6c9d3]">부족</dt>
            <dd className="mt-1 text-2xl font-extrabold">{counts.missing}</dd>
          </div>
        </dl>
      </section>

      {isDemoSource ? (
        <p
          className="rounded-xl bg-[var(--orange-soft)] px-4 py-3 text-xs font-semibold leading-5 text-[#76501d]"
          role="note"
        >
          {MOCK_ANALYSIS_NOTICE}
        </p>
      ) : null}

      {changedType || needsTemporalEvidence ? (
        <div className="space-y-2" role="note">
          {changedType ? (
            <p className="rounded-xl bg-[var(--orange-soft)] px-4 py-3 text-sm font-semibold text-[#76501d]">
              유형 변경됨 · 기존 AI 증거는 재분석되지 않았어요.
            </p>
          ) : null}
          {needsTemporalEvidence ? (
            <p className="rounded-xl bg-[var(--orange-soft)] px-4 py-3 text-sm font-semibold text-[#76501d]">
              전후 장면 확인이 필요해요.
            </p>
          ) : null}
        </div>
      ) : null}

      <section aria-labelledby="evidence-detail-title">
        <div className="flex items-end justify-between gap-3">
          <h2
            id="evidence-detail-title"
            className="text-lg font-extrabold text-[var(--navy)]"
          >
            핵심 증거
          </h2>
          <span className="text-xs font-bold text-[var(--ink-muted)]">
            {primaryItems.length}개
          </span>
        </div>

        {primaryItems.length > 0 ? (
          <ul className="mt-3 space-y-2.5">
            {primaryItems.map((item) => (
              <EvidenceItemCard key={item.id} item={item} />
            ))}
          </ul>
        ) : (
          <p className="mt-3 rounded-xl bg-[var(--orange-soft)] px-4 py-3 text-sm font-semibold text-[#76501d]">
            확인된 증거 항목이 없어요.
          </p>
        )}
      </section>

      {additionalItems.length > 0 ? (
        <details className="surface-card group p-5">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 font-extrabold text-[var(--navy)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]">
            <span>추가 확인 항목 보기</span>
            <span className="text-sm text-[var(--ink-muted)]">
              {additionalItems.length}개 <span aria-hidden="true">⌄</span>
            </span>
          </summary>
          <ul className="mt-3 space-y-2.5 border-t border-[#e1eaf2] pt-4">
            {additionalItems.map((item) => (
              <EvidenceItemCard key={item.id} item={item} />
            ))}
          </ul>
        </details>
      ) : null}

      <details className="surface-card p-5">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 font-extrabold text-[var(--navy)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]">
          <span>자세히 보기</span>
          <span className="text-sm text-[var(--ink-muted)]" aria-hidden="true">
            ⌄
          </span>
        </summary>
        <div className="mt-3 space-y-5 border-t border-[#e1eaf2] pt-4 text-sm leading-6 text-[#5d7489]">
          <div>
            <h3 className="font-extrabold text-[var(--navy)]">
              {violationLabels[reviewType]} 참고 항목
            </h3>
            <p className="mt-1">{typeEvidenceGuide.guidance}</p>
            <ul className="mt-2 grid gap-1 text-xs font-semibold">
              {typeEvidenceGuide.checklist.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>

          {items.length > 0 ? (
            <div>
              <h3 className="font-extrabold text-[var(--navy)]">
                AI 상세 설명
              </h3>
              <ul className="mt-2 space-y-3">
                {items.map((item) => (
                  <li key={`detail-${item.id}`}>
                    <p className="font-bold text-[var(--navy)]">{item.title}</p>
                    <p>{item.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </details>

      <p className="text-center text-xs font-semibold leading-5 text-[#667f96]">
        {AI_DIAGNOSIS_NOTICE}
      </p>

      <PrimaryButton
        href="/package"
        fullWidth
      >
        AI 신고서 만들기
      </PrimaryButton>
    </div>
  );
}

export default EvidenceDiagnosisView;
