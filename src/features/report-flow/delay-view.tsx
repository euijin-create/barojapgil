"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useDemo, type DelayHours } from "@/features/demo/demo-context";

const delayOptions: { hours: DelayHours; label: string; description: string }[] = [
  { hours: 0, label: "즉시 신고", description: "지금 이동 버튼 활성" },
  { hours: 6, label: "6시간 후", description: "잠시 시간을 두고 다시 확인" },
  { hours: 12, label: "12시간 후", description: "반나절 뒤 버튼 활성" },
  { hours: 24, label: "24시간 후", description: "하루 뒤 버튼 활성" },
];

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

function formatRemaining(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}시간 ${String(minutes).padStart(2, "0")}분 ${String(seconds).padStart(2, "0")}초`;
}

export default function DelayView() {
  const { delayHours, scheduledAt, scheduleDelay, reportComplete, markReportComplete } = useDemo();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const updateClock = () => setNow(Date.now());
    updateClock();
    const timer = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const isScheduled = scheduledAt !== null;
  const canOpenReport = isScheduled && now !== null && now >= scheduledAt;
  const waiting = isScheduled && !canOpenReport;
  const availableTime = isScheduled ? dateFormatter.format(scheduledAt) : "설정 전";
  const remaining = !isScheduled
    ? "시점을 선택해 주세요"
    : now === null
      ? "계산 중"
      : canOpenReport
        ? "0시간 00분 00초"
        : formatRemaining(scheduledAt - now);

  function confirmComplete() {
    if (
      window.confirm(
        "안전신문고에서 직접 신고를 완료하셨나요? 이 기록은 사용자가 완료로 표시한 상태이며 접수 여부를 자동 확인하지 않습니다.",
      )
    ) {
      markReportComplete();
    }
  }

  return (
    <div className="page-container space-y-6 pt-6 pb-28 sm:pt-10">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
        <span className="rounded-full bg-teal-700 px-3 py-1 text-white">05</span>
        <span>신고 패키지</span>
        <span aria-hidden="true">/</span>
        <span className="text-teal-700">안전 지연 신고</span>
      </div>

      <div>
        <p className="eyebrow">마지막 단계 · 신고는 직접</p>
        <h1 className="page-heading">안전한 신고 시점을 선택해요</h1>
        <p className="page-subtitle">
          선택한 시각이 되면 안전신문고 이동 버튼을 켭니다. 이 서비스가 신고를 대신 제출하지는 않습니다.
        </p>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        <p className="font-bold">체험용 시간 설정입니다</p>
        <p className="mt-1">
          현재는 브라우저 시계로 화면만 체험할 수 있습니다. 실제 지연 신고에는 서버 시각과 공식 신고 기한의 검증이 필요합니다. 이 선택만으로 법적 신고 가능성이 보장되지 않습니다.
        </p>
      </div>

      <section className="surface-card space-y-5 p-5 sm:p-6">
        <div>
          <p className="eyebrow">이동 버튼 활성 시점</p>
          <h2 className="section-heading">언제 다시 신고하시겠어요?</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            나중을 선택해도 알림이나 자동 제출은 진행되지 않습니다. 사용자가 이 화면을 다시 열어 확인해야 합니다.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {delayOptions.map((option) => {
            const selected = isScheduled && delayHours === option.hours;
            return (
              <button
                key={option.hours}
                type="button"
                aria-pressed={selected}
                onClick={() => scheduleDelay(option.hours)}
                className={`min-h-24 rounded-2xl border-2 p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${
                  selected
                    ? "border-teal-700 bg-teal-50 text-teal-950"
                    : "border-slate-200 bg-white text-slate-800 hover:border-teal-300"
                }`}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="text-base font-extrabold">{option.label}</span>
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                      selected ? "border-teal-700 bg-teal-700" : "border-slate-300"
                    }`}
                    aria-hidden="true"
                  >
                    {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </span>
                </span>
                <span className="mt-2 block text-xs leading-5 opacity-75">{option.description}</span>
              </button>
            );
          })}
        </div>
        <p className="text-xs leading-5 text-slate-500">
          시점을 다시 선택하면 체험용 활성 예정 시각이 변경됩니다. 새로고침하면 설정이 사라질 수 있습니다.
        </p>
      </section>

      <section className="surface-card space-y-5 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="eyebrow">신고 일정</p>
            <h2 className="section-heading">현재 상태</h2>
          </div>
          <span className="badge">
            {reportComplete
              ? "사용자 완료 표시"
              : canOpenReport
                ? "이동 버튼 활성"
                : waiting
                  ? "안전 지연 중"
                  : "설정 전"}
          </span>
        </div>
        <dl className="divide-y divide-slate-100 rounded-xl border border-slate-200 px-4">
          <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
            <dt className="text-sm text-slate-500">신고 가능 예정 시각 (버튼 활성)</dt>
            <dd className="text-sm font-bold text-slate-900">{availableTime}</dd>
          </div>
          <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
            <dt className="text-sm text-slate-500">신고 마감 예정 시각</dt>
            <dd className="text-sm font-bold text-amber-800">정책 확인 전 · 현재 계산 불가</dd>
          </div>
          <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
            <dt className="text-sm text-slate-500">버튼 활성까지 남은 시간</dt>
            <dd className="font-mono text-lg font-extrabold tabular-nums text-teal-800">{remaining}</dd>
          </div>
        </dl>
        <p className="text-xs leading-5 text-slate-500">
          위 시각은 버튼 활성에 관한 체험용 표시이며 공식 신고 기한이 아닙니다. 실제 기한은 안전신문고의 최신 안내를 확인해 주세요.
        </p>
      </section>

      <section className="surface-card space-y-4 p-5 sm:p-6">
        <div>
          <p className="eyebrow">최종 제출은 안전신문고에서</p>
          <h2 className="section-heading">사용자가 직접 신고합니다</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            이동 후 자료 첨부, 내용 확인, 제출은 안전신문고에서 직접 진행해 주세요. 이 앱은 외부 서비스에 자료를 전송하거나 접수 결과를 확인하지 않습니다.
          </p>
        </div>
        {canOpenReport ? (
          <a
            href="https://www.safetyreport.go.kr/"
            target="_blank"
            rel="noopener noreferrer"
            className="button-primary flex w-full items-center justify-center text-center"
          >
            안전신문고에서 직접 신고하기 ↗
          </a>
        ) : (
          <button type="button" className="button-primary w-full cursor-not-allowed opacity-50" disabled>
            {isScheduled ? "설정한 시각에 이동 버튼 활성" : "신고 시점을 먼저 선택해 주세요"}
          </button>
        )}
        {canOpenReport && !reportComplete && (
          <button type="button" className="button-secondary w-full" onClick={confirmComplete}>
            안전신문고에서 직접 신고를 마쳤어요
          </button>
        )}
        {reportComplete && (
          <p className="rounded-xl bg-teal-50 p-4 text-sm leading-6 text-teal-900" role="status">
            사용자가 신고 완료로 표시했습니다. 실제 접수 여부는 안전신문고에서 확인해 주세요.
          </p>
        )}
        <Link href="/reports" className="block pt-1 text-center text-sm font-bold text-teal-800 underline underline-offset-4">
          내 신고 상태 보기
        </Link>
      </section>
    </div>
  );
}
