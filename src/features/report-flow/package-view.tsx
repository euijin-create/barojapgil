"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PrimaryButton } from "@/components/ui";
import { useDemo } from "@/features/demo/demo-context";
import type { ViolationType } from "@/lib/demo-data";

type SupportedViolationType = Exclude<ViolationType, "unknown">;
type ViolationSelection = SupportedViolationType | "other" | "uncertain";

const violationOptions: Array<{
  value: ViolationSelection;
  label: string;
}> = [
  { value: "signal", label: "신호위반 의심" },
  { value: "center", label: "중앙선 침범 의심" },
  { value: "cutin", label: "위험 끼어들기 의심" },
  { value: "other", label: "기타 · 직접 입력" },
  { value: "uncertain", label: "판단하기 어려움" },
];

const assertiveStatementPatterns = [
  /위반(?:이|으로)?\s*(?:확정|확인되었습니다|확인됨)/,
  /위반(?:했(?:습니다|다)?|하였(?:습니다|다)?|한\s*(?:사실|차량)|입니다|으로\s*판단)/,
  /침범(?:했(?:습니다|다)?|하였(?:습니다|다)?|한\s*(?:사실|차량))/,
  /끼어들(?:었습니다|었다|었음)/,
  /(?:명백한|분명한)\s*(?:법규\s*)?위반/,
  /(?:불법|위법)\s*(?:차량|입니다)/,
  /위반\s*차량입니다/,
];

function isSupportedViolationType(
  value: ViolationSelection,
): value is SupportedViolationType {
  return value === "signal" || value === "center" || value === "cutin";
}

function containsAssertiveLanguage(value: string) {
  return assertiveStatementPatterns.some((pattern) => pattern.test(value));
}

function EditableField({
  id,
  label,
  value,
  suggested,
  placeholder,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  suggested: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  const sourceId = `${id}-source`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-extrabold text-[var(--navy)]">
          {label}
        </label>
        <span id={sourceId} className="text-[11px] font-semibold text-[#7690a8]">
          {value === suggested ? "AI 제안 · 수정 가능" : "사용자 수정값"}
        </span>
      </div>
      <input
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        aria-describedby={sourceId}
        className="form-input w-full"
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

export default function PackageView() {
  const router = useRouter();
  const {
    selectedCandidate,
    draft,
    updateDraft,
    regenerateStatement,
    analysisIsDemo,
    markSubmissionReady,
  } = useDemo();

  const violationSelection: ViolationSelection =
    draft.violationReviewMode === "other"
      ? "other"
      : draft.violationReviewMode === "uncertain" ||
          draft.violationType === "unknown"
        ? "uncertain"
        : draft.violationType;
  const typeMatchesSuggestion =
    (draft.violationReviewMode === "supported" &&
      draft.violationType === selectedCandidate.type) ||
    (draft.violationReviewMode === "uncertain" &&
      selectedCandidate.type === "unknown");
  const statementNeedsSoftening = containsAssertiveLanguage(draft.statement);
  const missingFields = [
    !draft.plate.trim() && "차량번호",
    !draft.occurredAt.trim() && "발생 시각",
    !draft.location.trim() && "장소",
    !draft.statement.trim() && "신고 내용",
    draft.violationReviewMode === "other" &&
      !draft.violationTypeDetail.trim() &&
      "기타 위반 유형",
  ].filter((item): item is string => Boolean(item));
  const canContinue = missingFields.length === 0 && !statementNeedsSoftening;

  function changeViolation(nextSelection: ViolationSelection) {
    if (isSupportedViolationType(nextSelection)) {
      updateDraft({
        violationType: nextSelection,
        violationReviewMode: "supported",
        violationTypeDetail: "",
      });
      return;
    }

    if (nextSelection === "other") {
      updateDraft({
        violationType: "unknown",
        violationReviewMode: "other",
      });
      return;
    }

    updateDraft({
      violationType: "unknown",
      violationReviewMode: "uncertain",
      violationTypeDetail: "",
    });
  }

  function confirmRegenerateStatement() {
    const message = draft.statement.trim()
      ? "현재 수정한 신고 내용은 안전한 AI 참고 초안으로 교체됩니다. 다시 작성할까요?"
      : "현재 확인한 정보로 AI 참고 초안을 만들까요?";

    if (window.confirm(message)) {
      regenerateStatement();
    }
  }

  function submitPackage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canContinue) return;
    markSubmissionReady();
    router.push("/submission-ready");
  }

  return (
    <div className="page-container space-y-6 pb-10 pt-4">
      <section className="overflow-hidden rounded-2xl border border-[#d5e9ff] bg-[#edf6ff] px-6 py-7 sm:px-8 sm:py-9">
        <p className="text-xs font-extrabold tracking-[0.08em] text-[var(--primary)]">
          ✦ AI AUTO-FILL
        </p>
        <h1 className="mt-4 whitespace-pre-line text-[30px] font-extrabold leading-[1.25] tracking-[-0.055em] text-[var(--navy)] sm:text-[34px]">
          {"신고서를\n자동으로 작성했어요."}
        </h1>
        <p className="mt-3 text-[15px] font-semibold text-[#66839e]">
          제출 전 내용을 확인해주세요.
        </p>
        <p className="mt-5 rounded-xl border border-[#cfe4f8] bg-white/65 px-4 py-3 text-xs leading-5 text-[#54718b]">
          {analysisIsDemo === false
            ? "AI 참고 분석과 사용자가 확인한 내용을 바탕으로 만든 초안이에요. 위법 여부를 확정하지 않으며 모든 항목을 직접 수정할 수 있어요."
            : "체험용 분석과 사용자가 확인한 내용을 바탕으로 만든 예시 초안이에요. 실제 자료와 대조해 직접 수정해주세요."}
        </p>
      </section>

      <form className="space-y-6" onSubmit={submitPackage} noValidate>
        <section className="surface-card space-y-6 p-5 sm:p-7" aria-labelledby="report-form-title">
          <div className="flex items-start justify-between gap-3 border-b border-[#e4edf5] pb-4">
            <div>
              <p className="text-xs font-extrabold tracking-[0.07em] text-[var(--primary)]">
                수정 가능한 신고서
              </p>
              <h2 id="report-form-title" className="mt-1 text-xl font-extrabold text-[var(--navy)]">
                신고 내용 확인
              </h2>
            </div>
            <span className="shrink-0 rounded-full bg-[#e8f3ff] px-3 py-1.5 text-[11px] font-extrabold text-[var(--primary)]">
              직접 수정 가능
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="package-type" className="text-sm font-extrabold text-[var(--navy)]">
                위반 유형
              </label>
              <span id="package-type-source" className="text-[11px] font-semibold text-[#7690a8]">
                {typeMatchesSuggestion ? "AI 제안 · 수정 가능" : "사용자 수정값"}
              </span>
            </div>
            <select
              id="package-type"
              value={violationSelection}
              aria-describedby="package-type-source"
              className="form-input w-full"
              onChange={(event) =>
                changeViolation(event.target.value as ViolationSelection)
              }
            >
              {violationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {draft.violationReviewMode === "other" ? (
              <div className="pt-2">
                <label htmlFor="package-type-detail" className="mb-2 block text-xs font-bold text-[#607b94]">
                  기타 위반 유형 또는 상황
                </label>
                <input
                  id="package-type-detail"
                  type="text"
                  value={draft.violationTypeDetail}
                  maxLength={80}
                  placeholder="관찰한 상황을 확정적 표현 없이 입력해주세요."
                  className="form-input w-full"
                  onChange={(event) =>
                    updateDraft({ violationTypeDetail: event.target.value })
                  }
                />
                <p className="mt-2 text-xs leading-5 text-[var(--ink-muted)]">
                  지원 유형 밖의 사용자 입력이며 AI 판단 결과로 표시되지 않아요.
                </p>
              </div>
            ) : null}
            {draft.violationReviewMode === "uncertain" ? (
              <p className="text-xs leading-5 text-[var(--ink-muted)]">
                유형을 판단하기 어려운 상태로 신고서를 준비해요. 최종 판단은 관계기관이 수행합니다.
              </p>
            ) : null}
          </div>

          <EditableField
            id="package-plate"
            label="차량번호"
            value={draft.plate}
            suggested={selectedCandidate.plate}
            placeholder="차량번호를 확인해주세요."
            onChange={(plate) => updateDraft({ plate })}
          />
          <EditableField
            id="package-time"
            label="발생 시각"
            value={draft.occurredAt}
            suggested={selectedCandidate.occurredAt}
            placeholder="발생 날짜와 시각을 입력해주세요."
            onChange={(occurredAt) => updateDraft({ occurredAt })}
          />
          <EditableField
            id="package-location"
            label="장소"
            value={draft.location}
            suggested={selectedCandidate.location}
            placeholder="발생 장소를 입력해주세요."
            onChange={(location) => updateDraft({ location })}
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="package-statement" className="text-sm font-extrabold text-[var(--navy)]">
                신고 내용
              </label>
              <span className="text-[11px] font-semibold text-[#7690a8]">
                AI 참고 초안 · 수정 가능
              </span>
            </div>
            <textarea
              id="package-statement"
              value={draft.statement}
              rows={8}
              placeholder="예: 영상에서 위반이 의심되는 장면으로 보여 확인을 요청드립니다."
              aria-describedby="package-statement-help"
              className="form-input w-full resize-y leading-7"
              onChange={(event) => updateDraft({ statement: event.target.value })}
            />
            <div id="package-statement-help" className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--ink-muted)]">
              <span>{draft.statement.length}자 · 확정되지 않은 사실은 적지 마세요.</span>
              <button
                type="button"
                className="font-extrabold text-[var(--primary)] underline decoration-[#a9ccee] underline-offset-4"
                onClick={confirmRegenerateStatement}
              >
                AI 참고 초안 다시 만들기
              </button>
            </div>
            {statementNeedsSoftening ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950" role="alert">
                위법 여부를 확정하는 것처럼 들리는 표현이 있어요. “위반이 의심되는 장면으로 보여 확인을 요청드립니다”처럼 고치거나 AI 참고 초안을 다시 만들어주세요.
              </div>
            ) : null}
          </div>
        </section>

        {missingFields.length > 0 ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950" role="status">
            확인이 필요한 항목: {missingFields.join(", ")}
          </p>
        ) : null}

        <div className="space-y-3">
          <PrimaryButton
            type="submit"
            fullWidth
            disabled={!canContinue}
            trailingIcon={<span aria-hidden="true">→</span>}
          >
            신고 준비 완료하기
          </PrimaryButton>
          <p className="text-center text-xs leading-5 text-[var(--ink-muted)]">
            신고 준비 화면에서도 안전신문고에 자동으로 신고하거나 자료를
            전송하지 않아요.
          </p>
          <Link
            href="/diagnosis?step=review"
            className="block min-h-11 rounded-xl px-4 py-3 text-center text-sm font-extrabold text-[#607b94] underline decoration-[#c7d6e3] underline-offset-4"
          >
            사용자 검토로 돌아가기
          </Link>
        </div>
      </form>
    </div>
  );
}
