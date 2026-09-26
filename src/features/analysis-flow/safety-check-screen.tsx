"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { InfoCard, PrimaryButton, SectionLabel } from "@/components/ui";

export type SafetyCheckSource = "pedestrian" | "dashcam";

export interface SafetyCheckScreenProps {
  source: SafetyCheckSource;
}

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className="h-14 w-14"
      aria-hidden="true"
    >
      <path
        d="M32 6.5 51 14v14.2c0 13.1-7.7 23.7-19 29.3-11.3-5.6-19-16.2-19-29.3V14l19-7.5Z"
        fill="currentColor"
        opacity="0.14"
      />
      <path
        d="M32 6.5 51 14v14.2c0 13.1-7.7 23.7-19 29.3-11.3-5.6-19-16.2-19-29.3V14l19-7.5Z"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      <path
        d="m23.5 31.8 5.7 5.7 11.8-13"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NoChaseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5 text-[var(--orange)]"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 15.5h14l-1.6-5.1a2 2 0 0 0-1.9-1.4h-7a2 2 0 0 0-1.9 1.4L5 15.5Z" />
      <path d="M4 15.5v2.2c0 .7.6 1.3 1.3 1.3h.9c.7 0 1.3-.6 1.3-1.3v-.2h9v.2c0 .7.6 1.3 1.3 1.3h.9c.7 0 1.3-.6 1.3-1.3v-2.2" />
      <path d="M7.5 13h.1M16.4 13h.1M4 4l16 16" />
    </svg>
  );
}

function SafeZoneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5 text-[var(--orange)]"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="5" r="2" />
      <path d="m10 9 2 3 2-3M12 12v7M8.5 20l3.5-1 3.5 1" />
      <path d="M3 22h18M4 16h3M17 16h3" />
    </svg>
  );
}

function AlbumIcon() {
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
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9" r="1.5" />
      <path d="m5.5 17 4.2-4.2 3.1 3.1 2.2-2.2 3.5 3.3" />
    </svg>
  );
}

export function SafetyCheckScreen({ source }: SafetyCheckScreenProps) {
  const router = useRouter();
  const [confirmed, setConfirmed] = useState(false);

  function continueToAlbum() {
    if (!confirmed) return;
    router.push(`/upload?source=${source}&step=select`);
  }

  return (
    <div className="page-container flex min-h-[calc(100svh-124px)] flex-col pb-2 pt-5">
      <div className="text-center">
        <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-[var(--orange-soft)] text-[var(--orange)] ring-1 ring-[#f7dfbd]">
          <ShieldIcon />
        </div>

        <SectionLabel tone="orange" className="mt-6">
          등록 전 안전 확인
        </SectionLabel>

        <h1 className="mt-3 whitespace-pre-line text-[28px] font-extrabold leading-[1.3] tracking-[-0.045em] text-[var(--navy)]">
          {"안전을 위해\n현장 촬영은 하지 않아요."}
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[var(--ink-muted)]">
          이미 촬영해 둔 사진 또는 영상을 휴대폰 앨범에서 안전하게 등록해주세요.
        </p>
      </div>

      <section className="mt-8 space-y-3" aria-label="자료 등록 안전 수칙">
        <InfoCard
          tone="orange"
          icon={<NoChaseIcon />}
          title="차량을 추격하지 않아요"
        >
          위험한 행동은 신고보다 우선하지 않아요.
        </InfoCard>
        <InfoCard
          tone="orange"
          icon={<SafeZoneIcon />}
          title="도로로 들어가지 않아요"
        >
          보도 또는 안전지대에서 촬영한 자료만 사용해주세요.
        </InfoCard>
      </section>

      <div className="mt-auto pt-8">
        <label className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-[#dce7f1] bg-white px-4 py-3 text-sm font-bold text-[var(--navy)]">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(event) => setConfirmed(event.target.checked)}
            className="h-5 w-5 shrink-0 accent-[var(--orange)]"
          />
          <span>안전 수칙을 확인했어요.</span>
        </label>

        <PrimaryButton
          type="button"
          tone="orange"
          fullWidth
          disabled={!confirmed}
          onClick={continueToAlbum}
          leadingIcon={<AlbumIcon />}
          className="mt-4"
        >
          앨범에서 자료 선택하기
        </PrimaryButton>
      </div>
    </div>
  );
}

export default SafetyCheckScreen;
