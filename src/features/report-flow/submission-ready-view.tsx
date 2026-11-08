"use client";

import { InfoCard, PrimaryButton, SectionLabel, StatusBadge } from "@/components/ui";

const SAFETY_REPORT_URL = "https://www.safetyreport.go.kr/";

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-12 w-12"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6.5 12.5 3.4 3.4L17.8 8" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 4h6v6M20 4l-9 9" />
      <path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" />
    </svg>
  );
}

export default function SubmissionReadyView() {
  return (
    <div className="page-container space-y-7 pb-10 pt-4">
      <header className="text-center">
        <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
          <CheckIcon />
        </div>
        <SectionLabel tone="mint" className="mt-5">
          SUBMISSION READY
        </SectionLabel>
        <h1 className="page-heading mt-3 whitespace-pre-line">
          {"신고 준비가\n완료되었어요."}
        </h1>
        <p className="page-subtitle mt-3">
          안전신문고에서 최종 제출하면 접수번호를 앱에 등록할 수 있어요.
        </p>
      </header>

      <section className="surface-card overflow-hidden" aria-label="준비된 신고 자료">
        <dl className="divide-y divide-slate-100 px-5">
          <div className="flex items-start justify-between gap-4 py-5">
            <dt className="text-sm font-semibold text-slate-500">첨부 자료</dt>
            <dd className="text-right text-sm font-extrabold leading-6 text-slate-900">
              사진·영상 1개 · AI 신고서 1건
            </dd>
          </div>
          <div className="flex items-start justify-between gap-4 py-5">
            <dt className="text-sm font-semibold text-slate-500">신고 상태</dt>
            <dd className="text-right">
              <StatusBadge tone="orange" showDot>
                안전신문고 제출 대기
              </StatusBadge>
            </dd>
          </div>
        </dl>
      </section>

      <InfoCard tone="mint" title="안전신문고로 이동할 수 있어요">
        버튼을 누른 경우에만 안전신문고 외부 페이지가 열립니다. 자료 첨부와
        최종 제출은 사용자가 직접 진행해주세요.
      </InfoCard>

      <section className="space-y-3" aria-label="제출 단계 이동">
        <PrimaryButton
          href={SAFETY_REPORT_URL}
          target="_blank"
          rel="noopener noreferrer"
          fullWidth
          trailingIcon={<ExternalLinkIcon />}
        >
          안전신문고에서 제출하기
        </PrimaryButton>

        <PrimaryButton href="/safety-points" tone="neutral" fullWidth>
          안전 포인트 안내 보기
        </PrimaryButton>
      </section>

      <p className="text-center text-xs leading-5 text-slate-500">
        바로잡길은 신고 자료를 자동으로 전송하거나 제출하지 않습니다.
      </p>
    </div>
  );
}
