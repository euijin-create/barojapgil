"use client";

import Image from "next/image";

type MediaPreviewProps = {
  mediaKind: "image" | "video" | null;
  previewUrl: string | null;
  range?: string;
};

export default function MediaPreview({
  mediaKind,
  previewUrl,
  range,
}: MediaPreviewProps) {
  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-900">
      {previewUrl && mediaKind === "video" ? (
        <video
          className="h-full w-full object-contain"
          controls
          playsInline
          preload="metadata"
          src={previewUrl}
          aria-label="선택한 영상 미리보기"
        />
      ) : previewUrl && mediaKind === "image" ? (
        <Image
          alt="선택한 사진 미리보기"
          src={previewUrl}
          width={1280}
          height={720}
          unoptimized
          className="h-full w-full object-contain"
        />
      ) : (
        <div className="relative flex h-full items-end justify-center overflow-hidden bg-gradient-to-b from-slate-700 via-slate-800 to-slate-950 pb-6">
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-sky-700/50 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-[52%] [transform:perspective(180px)_rotateX(35deg)] bg-slate-700/70">
            <div className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 bg-[repeating-linear-gradient(to_bottom,#e2e8f0_0px,#e2e8f0_18px,transparent_18px,transparent_39px)] opacity-60" />
            <div className="absolute left-[22%] top-0 h-full w-0.5 bg-slate-400/70" />
            <div className="absolute right-[22%] top-0 h-full w-0.5 bg-slate-400/70" />
          </div>
          <span className="relative rounded-full border border-white/25 bg-slate-950/55 px-4 py-2 text-xs font-semibold tracking-wide text-white">
            체험용 장면 미리보기
          </span>
        </div>
      )}
      {range && (
        <span className="absolute left-3 top-3 rounded-lg bg-slate-950/75 px-3 py-1.5 text-xs font-semibold text-white">
          핵심 구간 {range}
        </span>
      )}
    </div>
  );
}
