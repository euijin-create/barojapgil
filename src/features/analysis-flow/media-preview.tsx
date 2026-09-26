"use client";

import type { RefObject } from "react";

type MediaPreviewProps = {
  kind: "image" | "video" | null;
  previewUrl: string | null;
  fileName?: string;
  videoRef?: RefObject<HTMLVideoElement | null>;
  label?: string;
  onMediaError?: () => void;
};

export function MediaPreview({
  kind,
  previewUrl,
  fileName,
  videoRef,
  label,
  onMediaError,
}: MediaPreviewProps) {
  if (previewUrl && kind === "video") {
    return (
      <div className="relative overflow-hidden rounded-[24px] bg-slate-950">
        <video
          ref={videoRef}
          controls
          playsInline
          preload="metadata"
          src={previewUrl}
          onError={onMediaError}
          aria-label={fileName ? `${fileName} 미리보기` : "선택한 영상 미리보기"}
          className="aspect-video w-full bg-slate-950 object-contain"
        />
        {label ? (
          <span className="absolute left-3 top-3 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            {label}
          </span>
        ) : null}
      </div>
    );
  }

  if (previewUrl && kind === "image") {
    return (
      <div className="relative overflow-hidden rounded-[24px] bg-slate-950">
        {/* 브라우저에서 선택한 임시 object URL이므로 Next 이미지 최적화 대상이 아닙니다. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewUrl}
          onError={onMediaError}
          alt={fileName ? `${fileName} 미리보기` : "선택한 사진 미리보기"}
          className="aspect-video w-full object-contain"
        />
        {label ? (
          <span className="absolute left-3 top-3 rounded-full bg-slate-950/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            {label}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="relative flex aspect-video flex-col items-center justify-center overflow-hidden rounded-[24px] bg-[#152b3a] text-center text-white">
      <div className="absolute inset-0 opacity-50" aria-hidden="true">
        <div className="absolute bottom-[-35%] left-[25%] h-[115%] w-[50%] rotate-[-17deg] bg-[#233f50]" />
        <div className="absolute bottom-[-35%] left-[39%] h-[115%] w-[3px] rotate-[-17deg] bg-amber-300/70" />
        <div className="absolute bottom-[-35%] left-[63%] h-[115%] w-[3px] rotate-[-17deg] bg-white/50" />
        <div className="absolute left-[47%] top-[35%] h-9 w-14 rounded-lg border border-white/25 bg-[#d8eee8] shadow-[0_12px_35px_rgba(0,0,0,.3)]" />
      </div>
      <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/15 backdrop-blur-sm" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
          <path d="m9.5 9 5 3-5 3V9Z" />
        </svg>
      </div>
      <p className="relative z-10 mt-3 text-sm font-semibold">샘플 영상 미리보기</p>
      <p className="relative z-10 mt-1 text-xs text-slate-200">실제 파일은 전송되지 않습니다</p>
      {label ? (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-slate-950/70 px-3 py-1 text-xs font-semibold text-white">
          {label}
        </span>
      ) : null}
    </div>
  );
}
