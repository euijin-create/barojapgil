"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDemo } from "@/features/demo/demo-context";
import { violationLabels, type ViolationType } from "@/lib/demo-data";
import MediaPreview from "./media-preview";

const violationTypes: ViolationType[] = ["signal", "center", "cutin", "unknown"];

function PackageField({
  id,
  label,
  value,
  suggested,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  suggested: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-bold text-slate-800">
          {label}
        </label>
        <span className="text-xs text-slate-500">
          {value === suggested ? "AI 제안 · 수정 가능" : "사용자 수정값"}
        </span>
      </div>
      <input
        id={id}
        type="text"
        className="form-input w-full"
        value={value}
        placeholder={`${label} 확인 필요`}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

export default function PackageView() {
  const router = useRouter();
  const {
    selectedFile,
    selectedCandidate,
    draft,
    updateDraft,
    regenerateStatement,
    mediaKind,
    previewUrl,
    analysisIsDemo,
  } = useDemo();
  const [confirmed, setConfirmed] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");
  const range = selectedCandidate.end
    ? `${selectedCandidate.start}~${selectedCandidate.end}`
    : selectedCandidate.start;
  const filled = Boolean(
    draft.plate.trim() &&
      draft.occurredAt.trim() &&
      draft.location.trim() &&
      draft.statement.trim(),
  );
  const missing = [
    !draft.plate.trim() && "차량번호",
    !draft.occurredAt.trim() && "발생 시각",
    !draft.location.trim() && "장소",
    !draft.statement.trim() && "신고 문장",
  ].filter(Boolean);

  function changeField(patch: Parameters<typeof updateDraft>[0]) {
    updateDraft(patch);
    setConfirmed(false);
    setCopyMessage("");
  }

  async function copyStatement() {
    if (!draft.statement.trim()) return;
    try {
      await navigator.clipboard.writeText(draft.statement);
      setCopyMessage("신고 문장을 복사했습니다. 안전신문고에서 내용을 다시 확인해 주세요.");
    } catch {
      setCopyMessage("복사할 수 없습니다. 문장을 직접 선택해 복사해 주세요.");
    }
  }

  function confirmRegenerateStatement() {
    if (
      window.confirm(
        "현재 입력한 차량번호, 시각, 장소, 예상 위반 유형으로 신고 문장 초안을 다시 만드시겠어요? 지금 수정한 문장은 덮어써집니다.",
      )
    ) {
      regenerateStatement();
      setConfirmed(false);
      setCopyMessage("");
    }
  }

  return (
    <div className="page-container space-y-6 pt-6 pb-28 sm:pt-10">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
        <span className="rounded-full bg-teal-700 px-3 py-1 text-white">04</span>
        <span>증거 진단</span>
        <span aria-hidden="true">/</span>
        <span className="text-teal-700">신고 패키지</span>
        <span aria-hidden="true">/</span>
        <span>안전 지연</span>
      </div>

      <div>
        <p className="eyebrow">최종 확인 단계</p>
        <h1 className="page-heading">신고 자료를 검토해 주세요</h1>
        <p className="page-subtitle">
          핵심 장면과 신고 문장을 한곳에 모았습니다. 실제 자료와 대조해 틀린 부분을 수정해 주세요.
        </p>
      </div>

      <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm leading-6 text-teal-900">
        AI 분석은 참고 정보이며 부정확할 수 있습니다. 최종 판단, 내용 확인 및 신고는 사용자가 직접 수행해야 합니다.
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]">
        <section className="surface-card space-y-4 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">신고 자료 01</p>
              <h2 className="section-heading">핵심 장면</h2>
            </div>
            <span className="badge">{range}</span>
          </div>
          <MediaPreview mediaKind={mediaKind} previewUrl={previewUrl} range={range} />
          <div className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
            <p className="font-bold text-slate-900">
              {selectedFile ? selectedFile.name : "체험용 모의 자료"}
            </p>
            <p className="mt-1">
              {selectedFile && analysisIsDemo === false
                ? "업로드한 사진의 브라우저 미리보기입니다. AI 참고 분석 결과와 모든 신고 정보를 원본과 직접 대조해 주세요."
                : selectedFile
                  ? "선택한 원본의 브라우저 미리보기입니다. 분석 내용은 실제 판독값이 아닌 모의 결과이며 자동 첨부는 제공되지 않습니다."
                : "실제 파일이 선택되지 않았습니다. 이 장면은 화면 흐름 체험용 예시입니다."}
            </p>
          </div>
          <Link href="/diagnosis" className="button-secondary inline-flex w-full items-center justify-center">
            증거 진단 다시 보기
          </Link>
        </section>

        <section className="surface-card space-y-5 p-5 sm:p-6">
          <div>
            <p className="eyebrow">신고 자료 02</p>
            <h2 className="section-heading">핵심정보 수정</h2>
            <p className="mt-2 text-sm text-slate-600">AI가 제안한 값과 사용자 수정값을 구분해 보여줍니다.</p>
          </div>

          <PackageField
            id="package-plate"
            label="차량번호"
            value={draft.plate}
            suggested={selectedCandidate.plate}
            onChange={(plate) => changeField({ plate })}
          />
          <PackageField
            id="package-time"
            label="발생 시각"
            value={draft.occurredAt}
            suggested={selectedCandidate.occurredAt}
            onChange={(occurredAt) => changeField({ occurredAt })}
          />
          <PackageField
            id="package-location"
            label="장소"
            value={draft.location}
            suggested={selectedCandidate.location}
            onChange={(location) => changeField({ location })}
          />
          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <label htmlFor="package-type" className="text-sm font-bold text-slate-800">
                예상 위반 유형
              </label>
              <span className="text-xs text-slate-500">
                {draft.violationType === selectedCandidate.type ? "AI 제안 · 수정 가능" : "사용자 수정값"}
              </span>
            </div>
            <select
              id="package-type"
              className="form-input w-full"
              value={draft.violationType}
              onChange={(event) =>
                changeField({ violationType: event.target.value as ViolationType })
              }
            >
              {violationTypes.map((type) => (
                <option key={type} value={type}>
                  {violationLabels[type]}
                </option>
              ))}
            </select>
            {draft.violationType !== selectedCandidate.type && (
              <p className="mt-2 text-xs leading-5 text-amber-800">
                유형을 바꾸면 이전 AI 증거 진단이 현재 유형에 그대로 적용되지 않습니다.
              </p>
            )}
          </div>
        </section>
      </div>

      <section className="surface-card space-y-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="eyebrow">신고 자료 03</p>
            <h2 className="section-heading">자동 작성 신고 문장</h2>
          </div>
          <span className="badge">AI 초안 · 수정 가능</span>
        </div>
        <p className="text-sm leading-6 text-slate-600">
          {analysisIsDemo === false
            ? "아래 문장은 AI 참고 분석과 현재 입력값을 바탕으로 만든 초안입니다. 원본에서 확인되지 않은 사실이 없는지 직접 점검해 주세요."
            : "아래 문장은 선택한 장면의 모의 제안을 바탕으로 만든 예시입니다. 수정 내용이 문장에 반영됐는지 확인하고, 필요하면 현재 입력값으로 다시 만들어 주세요."}
        </p>
        <label htmlFor="package-statement" className="sr-only">신고 문장</label>
        <textarea
          id="package-statement"
          className="form-input min-h-44 w-full resize-y leading-7"
          value={draft.statement}
          placeholder="관찰한 사실을 중심으로 신고 문장을 직접 작성해 주세요."
          onChange={(event) => changeField({ statement: event.target.value })}
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">{draft.statement.length}자 · 확인되지 않은 사실은 적지 마세요.</p>
          <div className="flex w-full flex-wrap gap-2 sm:w-auto">
            <button
              type="button"
              className="button-secondary w-full sm:w-auto"
              onClick={confirmRegenerateStatement}
            >
              현재 입력값으로 문장 초안 다시 만들기
            </button>
            <button
              type="button"
              className="button-secondary w-full sm:w-auto"
              onClick={copyStatement}
              disabled={!draft.statement.trim()}
            >
              문장 복사하기
            </button>
          </div>
        </div>
        {copyMessage && <p className="text-sm text-teal-800" role="status">{copyMessage}</p>}
      </section>

      <section className="surface-card space-y-4 p-5 sm:p-6">
        <div>
          <p className="eyebrow">마지막 확인</p>
          <h2 className="section-heading">직접 확인하셨나요?</h2>
        </div>
        {missing.length > 0 && (
          <p className="rounded-xl bg-amber-50 p-3 text-sm leading-6 text-amber-900">
            확인이 필요한 항목: {missing.join(", ")}. 빈 칸을 채워야 다음 단계로 이동할 수 있습니다.
          </p>
        )}
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 text-sm leading-6 text-slate-700">
          <input
            type="checkbox"
            className="mt-1 h-5 w-5 shrink-0 accent-teal-700"
            checked={confirmed}
            onChange={(event) => setConfirmed(event.target.checked)}
          />
          <span>핵심 장면, 차량번호, 시각, 장소, 예상 유형, 신고 문장을 직접 검토했습니다. 최종 판단과 신고는 제가 직접 합니다.</span>
        </label>
        <button
          type="button"
          className="button-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!filled || !confirmed}
          onClick={() => router.push("/delay")}
        >
          확인 완료 · 안전 지연 설정하기
        </button>
        <p className="text-center text-xs leading-5 text-slate-500">
          이 단계는 자료를 정리할 뿐 안전신문고에 자동 제출하지 않습니다.
        </p>
      </section>
    </div>
  );
}
