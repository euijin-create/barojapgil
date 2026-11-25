"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PrimaryButton } from "@/components/ui";
import { useDemo } from "@/features/demo/demo-context";
import {
  combineOccurredAt,
  splitOccurredAt,
} from "@/features/report-flow/occurred-at";
import {
  violationTypeOptions,
  type ViolationType,
} from "@/lib/demo-data";

type ViolationSelection = ViolationType;

const assertiveStatementPatterns = [
  /위반(?:이|으로)?\s*(?:확정|확인되었습니다|확인됨)/,
  /위반(?:했(?:습니다|다)?|하였(?:습니다|다)?|한\s*(?:사실|차량)|입니다|으로\s*판단)/,
  /침범(?:했(?:습니다|다)?|하였(?:습니다|다)?|한\s*(?:사실|차량))/,
  /끼어들(?:었습니다|었다|었음)/,
  /(?:명백한|분명한)\s*(?:법규\s*)?위반/,
  /(?:불법|위법)\s*(?:차량|입니다)/,
  /위반\s*차량입니다/,
];

function containsAssertiveLanguage(value: string) {
  return assertiveStatementPatterns.some((pattern) => pattern.test(value));
}

function sourceLabel(value: string, suggested: string) {
  if (!value.trim()) return "직접 입력 필요";
  return suggested.trim() && value === suggested
    ? "AI 제안 · 수정 가능"
    : "사용자 수정값";
}

function cleanSuggestion(value: string, missingLabels: string[]) {
  const normalized = value.trim();
  return missingLabels.includes(normalized) ? "" : normalized;
}

function RequiredMark() {
  return (
    <span className="ml-1 text-xs font-bold text-[var(--primary)]" aria-hidden="true">
      필수
    </span>
  );
}

function EditableField({
  id,
  label,
  value,
  suggested,
  placeholder,
  errorMessage,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  suggested: string;
  placeholder: string;
  errorMessage?: string;
  onChange: (value: string) => void;
}) {
  const sourceId = `${id}-source`;
  const errorId = `${id}-error`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="text-sm font-extrabold text-[var(--navy)]">
          {label}
          <RequiredMark />
        </label>
        <span id={sourceId} className="text-xs font-semibold text-[#7690a8]">
          {sourceLabel(value, suggested)}
        </span>
      </div>
      <input
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        required
        aria-invalid={Boolean(errorMessage)}
        aria-describedby={errorMessage ? `${sourceId} ${errorId}` : sourceId}
        className="form-input w-full"
        onChange={(event) => onChange(event.target.value)}
      />
      {errorMessage ? (
        <p id={errorId} className="text-xs font-semibold text-red-700">
          {errorMessage}
        </p>
      ) : null}
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
    markSubmissionReady,
  } = useDemo();

  const occurredAt = splitOccurredAt(draft.occurredAt);
  const suggestedOccurredAt = splitOccurredAt(selectedCandidate.occurredAt);
  const suggestedPlate = cleanSuggestion(selectedCandidate.plate, [
    "확인 필요",
    "차량번호 확인 필요",
  ]);
  const suggestedLocation = cleanSuggestion(selectedCandidate.location, [
    "장소 확인 필요",
    "확인 필요",
  ]);

  const violationSelection: ViolationSelection =
    draft.violationReviewMode === "other"
      ? "other"
      : draft.violationReviewMode === "uncertain" ||
          draft.violationType === "unknown"
        ? "unknown"
        : draft.violationType;
  const typeMatchesSuggestion =
    (draft.violationReviewMode === "supported" &&
      draft.violationType === selectedCandidate.type) ||
    (draft.violationReviewMode === "other" &&
      selectedCandidate.type === "other") ||
    (draft.violationReviewMode === "uncertain" &&
      selectedCandidate.type === "unknown");
  const statementNeedsSoftening = containsAssertiveLanguage(draft.statement);
  const occurrenceIsMissing = !occurredAt.date || !occurredAt.time;
  const plateIsMissing = !draft.plate.trim();
  const locationIsMissing = !draft.location.trim();
  const statementIsMissing = !draft.statement.trim();
  const otherTypeIsMissing =
    draft.violationReviewMode === "other" && !draft.violationTypeDetail.trim();
  const canContinue =
    !occurrenceIsMissing &&
    !plateIsMissing &&
    !locationIsMissing &&
    !statementIsMissing &&
    !otherTypeIsMissing &&
    !statementNeedsSoftening;

  function updateOccurredAt(part: "date" | "time", value: string) {
    updateDraft({
      occurredAt: combineOccurredAt({ ...occurredAt, [part]: value }),
    });
  }

  function changeViolation(nextSelection: ViolationSelection) {
    if (nextSelection === "other") {
      updateDraft({
        violationType: "other",
        violationReviewMode: "other",
      });
      return;
    }

    if (nextSelection === "unknown") {
      updateDraft({
        violationType: "unknown",
        violationReviewMode: "uncertain",
        violationTypeDetail: "",
      });
      return;
    }

    updateDraft({
      violationType: nextSelection,
      violationReviewMode: "supported",
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
      <section className="overflow-hidden rounded-2xl border border-[#d5e9ff] bg-[#edf6ff] px-6 py-7 sm:px-8">
        <p className="text-xs font-extrabold tracking-[0.08em] text-[var(--primary)]">
          AI 자동 작성
        </p>
        <h1 className="mt-4 whitespace-pre-line text-[30px] font-extrabold leading-[1.25] tracking-[-0.055em] text-[var(--navy)] sm:text-[34px]">
          {"신고서를\n자동으로 작성했어요."}
        </h1>
        <p className="mt-3 text-[15px] font-semibold text-[#66839e]">
          내용을 확인하고 필요한 부분만 수정해주세요.
        </p>
      </section>

      <form className="space-y-6" onSubmit={submitPackage} noValidate>
        <section
          className="surface-card space-y-6 p-5 sm:p-7"
          aria-label="신고 내용 확인"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="package-type" className="text-sm font-extrabold text-[var(--navy)]">
                위반 유형
                <RequiredMark />
              </label>
              <span id="package-type-source" className="text-xs font-semibold text-[#7690a8]">
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
              {violationTypeOptions.map((option) => (
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
                  required
                  aria-invalid={otherTypeIsMissing}
                  aria-describedby={
                    otherTypeIsMissing ? "package-type-detail-error" : undefined
                  }
                  onChange={(event) =>
                    updateDraft({ violationTypeDetail: event.target.value })
                  }
                />
                {otherTypeIsMissing ? (
                  <p
                    id="package-type-detail-error"
                    className="mt-2 text-xs font-semibold text-red-700"
                  >
                    기타 교통위반 내용을 입력해주세요.
                  </p>
                ) : null}
              </div>
            ) : null}
            {draft.violationReviewMode === "uncertain" ? (
              <p className="text-xs leading-5 text-[var(--ink-muted)]">
                유형을 판단하기 어려운 상태예요.
              </p>
            ) : null}
          </div>

          <EditableField
            id="package-plate"
            label="차량번호"
            value={draft.plate}
            suggested={suggestedPlate}
            placeholder="차량번호를 확인해주세요."
            errorMessage={plateIsMissing ? "차량번호를 확인해주세요." : undefined}
            onChange={(plate) => updateDraft({ plate })}
          />

          <fieldset
            className="space-y-2"
            aria-describedby={
              occurrenceIsMissing ? "package-occurred-at-error" : undefined
            }
          >
            <legend className="text-sm font-extrabold text-[var(--navy)]">
              발생 일시
              <RequiredMark />
            </legend>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="min-w-0 text-sm font-bold text-[#607b94]">
                발생 날짜
                <input
                  id="package-date"
                  type="date"
                  value={occurredAt.date}
                  required
                  aria-invalid={!occurredAt.date}
                  className="form-input mt-2 w-full min-w-0"
                  onChange={(event) =>
                    updateOccurredAt("date", event.target.value)
                  }
                />
                <span className="mt-1.5 block text-xs font-semibold text-[#7690a8]">
                  {sourceLabel(occurredAt.date, suggestedOccurredAt.date)}
                </span>
              </label>
              <label className="min-w-0 text-sm font-bold text-[#607b94]">
                발생 시각
                <input
                  id="package-time"
                  type="time"
                  step={60}
                  value={occurredAt.time}
                  required
                  aria-invalid={!occurredAt.time}
                  className="form-input mt-2 w-full min-w-0"
                  onChange={(event) =>
                    updateOccurredAt("time", event.target.value)
                  }
                />
                <span className="mt-1.5 block text-xs font-semibold text-[#7690a8]">
                  {sourceLabel(occurredAt.time, suggestedOccurredAt.time)}
                </span>
              </label>
            </div>
            {occurrenceIsMissing ? (
              <p
                id="package-occurred-at-error"
                className="text-xs font-semibold text-amber-800"
              >
                발생 날짜와 시각을 확인해주세요.
              </p>
            ) : null}
          </fieldset>

          <EditableField
            id="package-location"
            label="발생 장소"
            value={draft.location}
            suggested={suggestedLocation}
            placeholder="도로명 주소 또는 건물명"
            errorMessage={locationIsMissing ? "발생 장소를 입력해주세요." : undefined}
            onChange={(location) => updateDraft({ location })}
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="package-statement" className="text-sm font-extrabold text-[var(--navy)]">
                신고 내용
                <RequiredMark />
              </label>
              <button
                type="button"
                className="min-h-11 rounded-lg px-2 text-xs font-extrabold text-[var(--primary)] underline decoration-[#a9ccee] underline-offset-4 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                onClick={confirmRegenerateStatement}
              >
                초안 다시 만들기
              </button>
            </div>
            <textarea
              id="package-statement"
              value={draft.statement}
              rows={7}
              placeholder="예: 영상에서 위반이 의심되는 장면으로 보여 확인을 요청드립니다."
              required
              aria-invalid={statementIsMissing || statementNeedsSoftening}
              aria-describedby={
                statementIsMissing
                  ? "package-statement-help package-statement-error"
                  : "package-statement-help"
              }
              className="form-input w-full resize-y leading-7"
              onChange={(event) => updateDraft({ statement: event.target.value })}
            />
            <p id="package-statement-help" className="text-xs text-[var(--ink-muted)]">
              {draft.statement.length}자
            </p>
            {statementIsMissing ? (
              <p
                id="package-statement-error"
                className="text-xs font-semibold text-red-700"
              >
                신고 내용을 입력해주세요.
              </p>
            ) : null}
            {statementNeedsSoftening ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950" role="alert">
                위반을 확정하는 표현을 완화해주세요.
              </div>
            ) : null}
          </div>
        </section>

        <div className="space-y-3">
          <PrimaryButton
            type="submit"
            fullWidth
            disabled={!canContinue}
          >
            신고 준비 완료하기
          </PrimaryButton>
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
