"use client";

import { useRef, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDemo } from "@/features/demo/demo-context";
import {
  MAX_IMAGE_FILE_SIZE,
  isSupportedImageMimeType,
} from "@/contracts/image-upload";
import { MediaPreview } from "./media-preview";

const MAX_VIDEO_FILE_SIZE = 100 * 1024 * 1024;

function formatFileSize(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadScreen() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const {
    selectedFile,
    previewUrl,
    mediaKind,
    setMediaFile,
    setAnalysisStarted,
    analyzeSelectedImage,
  } = useDemo();

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (!isImage && !isVideo) {
      setMediaFile(null);
      setError("사진 또는 영상 파일만 선택해 주세요.");
      event.target.value = "";
      return;
    }

    if (isImage && !isSupportedImageMimeType(file.type)) {
      setMediaFile(null);
      setError("JPG, PNG 또는 WEBP 사진만 분석할 수 있습니다.");
      event.target.value = "";
      return;
    }

    if (isImage && file.size > MAX_IMAGE_FILE_SIZE) {
      setMediaFile(null);
      setError("사진은 10 MB 이하 파일을 선택해 주세요.");
      event.target.value = "";
      return;
    }

    if (isVideo && file.size > MAX_VIDEO_FILE_SIZE) {
      setMediaFile(null);
      setError("체험용 영상은 100 MB 이하 파일을 선택해 주세요.");
      event.target.value = "";
      return;
    }

    if (file.size === 0) {
      setMediaFile(null);
      setError("비어 있는 파일은 미리볼 수 없습니다. 다른 파일을 선택해 주세요.");
      event.target.value = "";
      return;
    }

    setError(null);
    setMediaFile(file);
  }

  function removeFile() {
    setMediaFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function beginAnalysis(useSample = false) {
    if (useSample) {
      removeFile();
      setAnalysisStarted(true);
      router.push("/analyzing");
      return;
    }
    if (!selectedFile || error) return;

    setAnalysisStarted(true);
    router.push("/analyzing");
    if (mediaKind === "image") void analyzeSelectedImage();
  }

  return (
    <div className="page-container space-y-6 pt-6 pb-12 sm:pt-10">
      <div className="space-y-2">
        <Link href="/" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-[#0f6b65]">
          <span aria-hidden="true">←</span> 홈으로
        </Link>
        <p className="eyebrow">자료 준비 · 1/4</p>
        <h1 className="page-heading">신고 자료 업로드</h1>
        <p className="page-subtitle">블랙박스 영상이나 사진을 선택해 주세요. 긴 영상에서도 살펴볼 장면을 찾는 흐름을 체험할 수 있습니다.</p>
      </div>

      <div className="flex gap-1.5" aria-label="진행 단계: 자료 선택 1단계">
        <span className="h-1.5 flex-1 rounded-full bg-[#0f766e]" />
        <span className="h-1.5 flex-1 rounded-full bg-slate-200" />
        <span className="h-1.5 flex-1 rounded-full bg-slate-200" />
        <span className="h-1.5 flex-1 rounded-full bg-slate-200" />
      </div>

      <section className="surface-card p-5 sm:p-7" aria-labelledby="file-title">
        <div className="mb-5">
          <h2 id="file-title" className="section-heading">사진 또는 영상 선택</h2>
          <p className="muted-text mt-1 text-sm">선택한 자료는 현재 화면에서만 미리봅니다.</p>
        </div>

        <input
          ref={fileInputRef}
          id="incident-file"
          type="file"
          accept="image/jpeg,image/png,image/webp,video/*"
          onChange={handleFileChange}
          className="sr-only"
          aria-label="사진 또는 영상 파일 선택"
        />

        {selectedFile ? (
          <div className="space-y-4">
            <MediaPreview
              kind={mediaKind}
              previewUrl={previewUrl}
              fileName={selectedFile.name}
              onMediaError={() => setError("이 파일을 미리볼 수 없습니다. 다른 사진이나 영상을 선택해 주세요.")}
            />
            <div className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900" title={selectedFile.name}>{selectedFile.name}</p>
                <p className="mt-1 text-xs text-slate-500">{mediaKind === "video" ? "영상" : "사진"} · {formatFileSize(selectedFile.size)}</p>
              </div>
              <button type="button" onClick={removeFile} className="shrink-0 rounded-lg px-2 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-200">
                제거
              </button>
            </div>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="button-secondary w-full">
              다른 파일 선택
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex min-h-56 w-full flex-col items-center justify-center rounded-[22px] border-2 border-dashed border-[#a8ccc7] bg-[#f4faf8] px-5 py-8 text-center transition-colors hover:bg-[#eaf6f2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f766e]"
          >
            <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#0f766e] shadow-sm" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 16V4m0 0-4 4m4-4 4 4" />
                <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
              </svg>
            </span>
            <span className="text-base font-bold text-slate-900">파일 선택하기</span>
            <span className="mt-1 text-sm text-slate-600">JPG·PNG·WEBP 최대 10 MB · 영상 최대 100 MB</span>
          </button>
        )}
        {error ? <p className="mt-3 text-sm font-medium text-red-700" role="alert">{error}</p> : null}
      </section>

      <div className="rounded-2xl border border-[#cfe3df] bg-[#f5faf8] p-4 text-sm leading-6 text-slate-700">
        <p className="font-semibold text-[#155e58]">개인정보 안내</p>
        <p className="mt-1">사진은 분석을 위해 서버로 일시 전송되며 저장하지 않습니다. 모의 분석 설정에서는 외부 AI로 보내지 않고, OpenAI 설정을 켠 경우에만 분석을 위해 제공자에 전달합니다. 영상은 이번 단계에서 전송하지 않으며 원본 자료는 공개되지 않습니다.</p>
      </div>

      <div className="space-y-3">
        <button type="button" onClick={() => beginAnalysis()} disabled={!selectedFile || Boolean(error)} className="button-primary w-full disabled:cursor-not-allowed disabled:opacity-50">
          {mediaKind === "image" ? "AI 참고 분석 시작" : "영상 분석 흐름 체험하기"} <span aria-hidden="true">→</span>
        </button>
        <button type="button" onClick={() => beginAnalysis(true)} className="button-secondary w-full">
          샘플 영상으로 체험하기
        </button>
        <p className="text-center text-xs leading-5 text-slate-500">사진은 서버 분석 API로 처리하며 사용된 분석 방식은 결과 화면에서 안내합니다. 영상과 샘플은 체험용 예시 결과를 사용합니다.</p>
      </div>
    </div>
  );
}
