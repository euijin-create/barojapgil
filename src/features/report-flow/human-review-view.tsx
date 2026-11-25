"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  PrimaryButton,
  SectionLabel,
  StatusBadge,
} from "@/components/ui";
import { useDemo } from "@/features/demo/demo-context";
import {
  violationLabels,
  violationTypeOptions,
  type ViolationType,
} from "@/lib/demo-data";

type ReviewChoice = ViolationType;

function displayViolationType(type: ViolationType) {
  return type === "unknown" ? "판단 어려움" : `${violationLabels[type]} 의심`;
}

export default function HumanReviewView() {
  const router = useRouter();
  const { selectedCandidate, draft, updateDraft } = useDemo();
  const [selectedType, setSelectedType] = useState<ReviewChoice | null>(null);
  const [otherType, setOtherType] = useState(draft.violationTypeDetail);
  const otherTypeIsMissing = selectedType === "other" && otherType.trim().length === 0;
  const canContinue = selectedType !== null && !otherTypeIsMissing;

  function continueWithReviewedType() {
    if (!selectedType || !canContinue) return;

    if (selectedType === "other") {
      updateDraft({
        violationType: "other",
        violationReviewMode: "other",
        violationTypeDetail: otherType.trim(),
      });
    } else if (selectedType === "unknown") {
      updateDraft({
        violationType: "unknown",
        violationReviewMode: "uncertain",
        violationTypeDetail: "",
      });
    } else {
      updateDraft({
        violationType: selectedType,
        violationReviewMode: "supported",
        violationTypeDetail: "",
      });
    }

    router.push("/diagnosis?step=evidence");
  }

  return (
    <div className="page-container space-y-6 pb-10 pt-4">
      <header className="space-y-3">
        <SectionLabel>사용자 확인</SectionLabel>
        <h1 className="page-heading">
          AI의 예상 유형이
          <br />
          맞는지 확인해주세요.
        </h1>
        <p className="page-subtitle">
          실제 상황과 다르면 직접 선택하거나 수정할 수 있어요.
        </p>
      </header>

      <section
        className="rounded-2xl border border-[#d5e8fb] bg-[var(--primary-soft)] p-5"
        aria-labelledby="ai-suggestion-title"
      >
        <div className="flex items-center justify-between gap-3">
          <p
            id="ai-suggestion-title"
            className="text-xs font-extrabold tracking-[0.07em] text-[var(--primary)]"
          >
            AI가 제안한 유형
          </p>
          <StatusBadge tone="blue">AI 참고 분석</StatusBadge>
        </div>
        <p className="mt-4 text-xl font-extrabold text-[var(--navy)]">
          {displayViolationType(selectedCandidate.type)}
        </p>
        <p className="mt-2 text-sm leading-6 text-[#607d99]">
          원본 자료와 다르면 아래에서 다른 유형을 선택해주세요.
        </p>
      </section>

      <fieldset>
        <legend className="section-heading">위반 유형 선택</legend>
        <div className="mt-4 space-y-2.5">
          {violationTypeOptions.map((option) => {
            const selected = selectedType === option.value;
            const isAiSuggestion = selectedCandidate.type === option.value;

            return (
              <label
                key={option.value}
                className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                  selected
                    ? "border-[var(--primary)] bg-[var(--primary-soft)] ring-1 ring-[#b9d8f7]"
                    : "border-[#dce7f1] bg-white hover:border-[#a9c9ea]"
                } focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-[var(--primary)]`}
              >
                <input
                  type="radio"
                  name="reviewed-violation-type"
                  value={option.value}
                  checked={selected}
                  onChange={() => setSelectedType(option.value)}
                  className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                />
                <span className="flex-1 text-sm font-extrabold text-[var(--navy)]">
                  {option.label}
                </span>
                {isAiSuggestion ? (
                  <StatusBadge tone="blue">AI 예상</StatusBadge>
                ) : null}
              </label>
            );
          })}
        </div>
      </fieldset>

      {selectedType === "other" ? (
        <div>
          <label
            htmlFor="other-violation-type"
            className="mb-2 block text-sm font-extrabold text-[var(--navy)]"
          >
            기타 위반 유형 직접 입력
          </label>
          <input
            id="other-violation-type"
            type="text"
            value={otherType}
            maxLength={80}
            onChange={(event) => setOtherType(event.target.value)}
            className="form-input"
            placeholder="확인한 상황을 간단히 입력해주세요."
            aria-invalid={otherTypeIsMissing}
            aria-describedby="other-violation-help"
          />
          <p
            id="other-violation-help"
            className={`mt-2 text-xs leading-5 ${
              otherTypeIsMissing ? "text-red-700" : "text-[var(--ink-muted)]"
            }`}
          >
            {otherTypeIsMissing
              ? "기타 교통위반 내용을 입력해야 계속할 수 있어요."
              : "법적 유형을 확정하지 말고 직접 확인한 상황만 적어주세요."}
          </p>
        </div>
      ) : null}

      <div className="space-y-3">
        <PrimaryButton
          type="button"
          fullWidth
          disabled={!canContinue}
          onClick={continueWithReviewedType}
        >
          이 유형으로 계속하기
        </PrimaryButton>
        <Link
          href="/diagnosis"
          className="flex min-h-11 items-center justify-center text-sm font-bold text-[#607d99] hover:text-[var(--primary)]"
        >
          AI 1차 결과 다시 보기
        </Link>
      </div>
    </div>
  );
}
