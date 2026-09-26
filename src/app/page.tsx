import Link from "next/link";
import { SectionLabel } from "@/components/ui/section-label";

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden="true">
      <path d="M4.5 7.5A2.5 2.5 0 0 1 7 5h1.4l1.1-1.5h5L15.6 5H17a2.5 2.5 0 0 1 2.5 2.5v9A2.5 2.5 0 0 1 17 19H7a2.5 2.5 0 0 1-2.5-2.5v-9Z" />
      <circle cx="12" cy="12" r="3.25" />
    </svg>
  );
}

function DashcamIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="12" rx="2.5" />
      <path d="m10 9 5 2.5-5 2.5V9ZM8 20h8M12 17v3" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="M5 12h14M14 7l5 5-5 5" />
    </svg>
  );
}

export default function HomePage() {
  return (
    <div className="page-container flex min-h-[calc(100svh-124px)] flex-col pb-2">
      <header className="pt-3">
        <SectionLabel>AI TRAFFIC SAFETY</SectionLabel>
        <h1 className="mt-4 text-[2rem] font-extrabold leading-[1.22] tracking-[-0.055em] text-[#12304a]">
          어떤 자료를
          <br />
          등록하시겠어요?
        </h1>
        <p className="mt-4 text-[15px] leading-6 text-[#6f879f]">
          AI가 신고에 필요한 정보를 찾아
          <br />
          정리해드릴게요.
        </p>
      </header>

      <section className="mt-8 space-y-3" aria-label="등록할 자료 유형">
        <Link href="/upload?source=pedestrian" className="group flex min-h-[136px] items-center gap-4 rounded-2xl border border-[#d5e8fb] bg-[#edf6ff] px-5 py-5 transition-colors hover:border-[#aacff5] hover:bg-[#e5f2ff] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#2f80ed]">
          <span className="grid h-13 w-13 shrink-0 place-items-center rounded-xl bg-white text-[#2f80ed]" aria-hidden="true"><CameraIcon /></span>
          <span className="min-w-0 flex-1">
            <strong className="block text-[17px] font-extrabold tracking-[-0.035em] text-[#12304a]">보행자 촬영 자료</strong>
            <span className="mt-2 block text-[13px] leading-5 text-[#607d99]">휴대폰 앨범의 사진·영상을 올려요</span>
          </span>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-[#2f80ed] transition-transform group-hover:translate-x-0.5" aria-hidden="true"><ArrowIcon /></span>
        </Link>

        <Link href="/upload?source=dashcam" className="group flex min-h-[136px] items-center gap-4 rounded-2xl border border-[#ccecdf] bg-[#e7f8f3] px-5 py-5 transition-colors hover:border-[#9bdcc9] hover:bg-[#def5ee] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#26b894]">
          <span className="grid h-13 w-13 shrink-0 place-items-center rounded-xl bg-white text-[#168f73]" aria-hidden="true"><DashcamIcon /></span>
          <span className="min-w-0 flex-1">
            <strong className="block text-[17px] font-extrabold tracking-[-0.035em] text-[#12304a]">블랙박스 영상</strong>
            <span className="mt-2 block text-[13px] leading-5 text-[#5f7f77]">저장된 영상에서 위반 장면을 찾아요</span>
          </span>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-[#168f73] transition-transform group-hover:translate-x-0.5" aria-hidden="true"><ArrowIcon /></span>
        </Link>
      </section>

      <footer className="mt-auto pt-8 text-center">
        <p className="text-[13px] font-semibold text-[#6f8498]">ⓘ 운전 중에는 앱을 사용하지 마세요.</p>
        <nav className="mt-4 flex items-center justify-center gap-3 text-xs font-bold text-[#54718b]" aria-label="바로가기">
          <Link href="/reports" className="min-h-9 rounded-lg px-2 py-2 underline-offset-4 hover:text-[#2f80ed] hover:underline">내 신고 보기</Link>
          <span className="h-3 w-px bg-[#d5e0ea]" aria-hidden="true" />
          <Link href="/risk-map" className="min-h-9 rounded-lg px-2 py-2 underline-offset-4 hover:text-[#2f80ed] hover:underline">교통위험지도</Link>
        </nav>
      </footer>
    </div>
  );
}
