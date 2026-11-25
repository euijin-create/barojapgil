import Link from "next/link";

function CameraIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-7 w-7"
      aria-hidden="true"
    >
      <path d="M4.5 7.5A2.5 2.5 0 0 1 7 5h1.4l1.1-1.5h5L15.6 5H17a2.5 2.5 0 0 1 2.5 2.5v9A2.5 2.5 0 0 1 17 19H7a2.5 2.5 0 0 1-2.5-2.5v-9Z" />
      <circle cx="12" cy="12" r="3.25" />
    </svg>
  );
}

function DashcamIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-7 w-7"
      aria-hidden="true"
    >
      <rect x="3.5" y="5" width="17" height="12" rx="2.5" />
      <path d="m10 9 5 2.5-5 2.5V9ZM8 20h8M12 17v3" />
    </svg>
  );
}

function ReportsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <rect x="5" y="3.5" width="14" height="17" rx="2" />
      <path d="M8.5 8h7M8.5 12h7M8.5 16h4" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="m3.5 6 5.5-2.5 6 2.5 5.5-2.5v14L15 20l-6-2.5L3.5 20V6Z" />
      <path d="M9 3.5v14M15 6v14" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <div className="page-container pb-3">
      <header className="pt-2">
        <p className="inline-flex min-h-7 items-center rounded-full bg-[var(--primary-soft)] px-3 text-[11px] font-extrabold text-[var(--primary)]">
          사진 AI 분석 · 신고 준비 지원
        </p>
        <h1 className="mt-4 text-[clamp(1.75rem,8vw,2rem)] font-extrabold leading-[1.25] tracking-[-0.055em] text-[var(--navy)]">
          교통 상황이 담긴 사진을
          <br />
          AI가 정리해드려요
        </h1>
        <p className="mt-3 text-[15px] leading-6 text-[var(--ink-muted)]">
          교통법규 위반이 의심되는 자료에서 차량과 증거 정보를 찾아
          신고 준비를 도와드려요.
        </p>
        <p className="mt-3 flex items-start gap-2 text-[13px] font-semibold leading-5 text-[#526d84]">
          <span
            className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#eef3f7] text-[11px] font-black text-[var(--navy)]"
            aria-hidden="true"
          >
            i
          </span>
          최종 확인과 안전신문고 제출은 사용자가 직접 해요.
        </p>
      </header>

      <section className="mt-7" aria-labelledby="material-choice-title">
        <h2
          id="material-choice-title"
          className="text-lg font-extrabold tracking-[-0.035em] text-[var(--navy)]"
        >
          자료를 선택해주세요
        </h2>
        <p className="mt-1 text-[13px] leading-5 text-[var(--ink-muted)]">
          휴대폰에 저장된 자료만 등록할 수 있어요.
        </p>

        <div className="mt-4 space-y-3">
          <Link
            href="/upload?source=pedestrian"
            className="group flex min-h-[124px] items-center gap-4 rounded-2xl border border-[#cfe4fb] bg-[var(--primary-soft)] p-5 transition-colors hover:border-[#91bff2] hover:bg-[#e5f2ff] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
          >
            <span
              className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white text-[var(--primary)]"
              aria-hidden="true"
            >
              <CameraIcon />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <strong className="text-[17px] font-extrabold tracking-[-0.035em] text-[var(--navy)]">
                  사진 AI 분석
                </strong>
                <span className="rounded-full bg-white px-2 py-1 text-[10px] font-extrabold text-[var(--primary)]">
                  실제 분석
                </span>
              </span>
              <span className="mt-2 block text-[13px] leading-5 text-[#526f8b]">
                저장된 사진을 분석해 신고 정보를 정리해요.
              </span>
              <span className="mt-2 block text-xs font-extrabold text-[var(--primary)]">
                사진 등록하기
              </span>
            </span>
          </Link>

          <Link
            href="/upload?source=dashcam"
            className="group flex min-h-[124px] items-center gap-4 rounded-2xl border border-[#ccecdf] bg-[var(--mint-soft)] p-5 transition-colors hover:border-[#91d5c2] hover:bg-[#def5ee] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
          >
            <span
              className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white text-[var(--mint-dark)]"
              aria-hidden="true"
            >
              <DashcamIcon />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <strong className="text-[17px] font-extrabold tracking-[-0.035em] text-[var(--navy)]">
                  블랙박스 영상 체험
                </strong>
                <span className="rounded-full bg-white px-2 py-1 text-[10px] font-extrabold text-[var(--mint-dark)]">
                  DEMO
                </span>
              </span>
              <span className="mt-2 block text-[13px] leading-5 text-[#52786e]">
                영상 장면 선택 흐름을 체험해요. 실제 영상 분석은 준비
                중이에요.
              </span>
              <span className="mt-2 block text-xs font-extrabold text-[var(--mint-dark)]">
                데모 체험하기
              </span>
            </span>
          </Link>
        </div>
      </section>

      <nav
        className="mt-5 grid grid-cols-2 gap-3"
        aria-label="주요 서비스 바로가기"
      >
        <Link
          href="/reports"
          className="flex min-h-14 min-w-0 items-center gap-3 rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm font-extrabold text-[var(--navy)] transition-colors hover:border-[#a9ccef] hover:bg-[#f7fbff] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
        >
          <span className="shrink-0 text-[var(--primary)]">
            <ReportsIcon />
          </span>
          <span className="min-w-0">내 신고</span>
        </Link>
        <Link
          href="/risk-map"
          className="flex min-h-14 min-w-0 items-center gap-3 rounded-xl border border-[var(--line)] bg-white px-4 py-3 text-sm font-extrabold text-[var(--navy)] transition-colors hover:border-[#a9ccef] hover:bg-[#f7fbff] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
        >
          <span className="shrink-0 text-[var(--primary)]">
            <MapIcon />
          </span>
          <span className="min-w-0 leading-5">교통위험지도</span>
        </Link>
      </nav>

      <p className="mt-5 rounded-xl bg-[var(--orange-soft)] px-4 py-3 text-center text-[13px] font-bold leading-5 text-[#8c560e]">
        운전 중에는 앱을 사용하지 마세요.
      </p>
    </div>
  );
}
