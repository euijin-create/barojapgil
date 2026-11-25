import type { TrafficIncident } from "@/contracts/traffic-incidents";

interface IncidentDetailCardProps {
  incident: TrafficIncident;
}

const categoryTone = {
  ACCIDENT: "bg-[#fff0ee] text-[#b64c44]",
  CONSTRUCTION: "bg-[#fff4e4] text-[#a45e09]",
  CONTROL: "bg-[#edf6ff] text-[#2569bc]",
  EVENT: "bg-[#edf6ff] text-[#2569bc]",
  OTHER: "bg-[#edf1f5] text-[#61788e]",
} as const;

const seoulDateTimeFormatter = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

function formatIncidentTime(value: string | null) {
  if (!value) return "정보 없음";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "정보 없음";
  return seoulDateTimeFormatter.format(date);
}

export function IncidentDetailCard({ incident }: IncidentDetailCardProps) {
  return (
    <article
      className="rounded-2xl border border-[var(--line)] bg-white p-4"
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-extrabold text-[var(--primary)]">
            선택한 돌발상황
          </p>
          <h2 className="mt-1 break-keep text-lg font-extrabold tracking-[-0.03em] text-[var(--navy)]">
            {incident.category}
          </h2>
          <p className="mt-1.5 text-xs font-semibold text-[#6b839a]">
            서울 TOPIS · 실시간 데이터
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-extrabold ${categoryTone[incident.categoryKind]}`}
        >
          실시간
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
        <div className="rounded-xl bg-[#f7f9fb] p-3.5">
          <dt className="text-xs font-bold text-[var(--ink-muted)]">발생</dt>
          <dd className="mt-1 text-sm font-extrabold leading-5 text-[var(--navy)]">
            {formatIncidentTime(incident.occurredAt)}
          </dd>
        </div>
        <div className="rounded-xl bg-[#f7f9fb] p-3.5">
          <dt className="text-xs font-bold text-[var(--ink-muted)]">
            종료 예정
          </dt>
          <dd className="mt-1 text-sm font-extrabold leading-5 text-[var(--navy)]">
            {formatIncidentTime(incident.expectedClearAt)}
          </dd>
        </div>
        <div className="rounded-xl bg-[#f7f9fb] p-3.5 min-[360px]:col-span-2">
          <dt className="text-xs font-bold text-[var(--ink-muted)]">내용</dt>
          <dd className="mt-2 max-h-40 overflow-y-auto whitespace-pre-line break-words pr-1 text-sm font-semibold leading-6 text-[#294a65]">
            {incident.description}
          </dd>
        </div>
      </dl>

      <p className="mt-3 text-xs font-semibold text-[#607b94]">
        출처: 서울특별시 TOPIS / 서울 열린데이터광장
      </p>
    </article>
  );
}
