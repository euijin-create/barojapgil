"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { InfoCard, PrimaryButton, SectionLabel, StatusBadge } from "@/components/ui";
import {
  MAX_IMAGE_FILE_SIZE,
  isSupportedImageMimeType,
} from "@/contracts/image-upload";
import { useDemo } from "@/features/demo/demo-context";
import { MediaPreview } from "./media-preview";

const MAX_VIDEO_FILE_SIZE = 100 * 1024 * 1024;
const SUPPORTED_VIDEO_MIME_TYPES = new Set(["video/mp4", "video/quicktime"]);

function formatFileSize(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function UploadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 16V4m0 0-4 4m4-4 4 4" />
      <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}

export function UploadScreen() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const {
    selectedFiles,
    selectedFile,
    previewUrl,
    mediaKind,
    setMediaFiles,
    setAnalysisStarted,
    analyzeSelectedImage,
  } = useDemo();

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    const videoFiles = files.filter((file) => file.type.startsWith("video/"));

    let nextError: string | null = null;
    if (files.some((file) => file.size === 0)) {
      nextError = "비어 있는 파일은 등록할 수 없습니다. 다른 자료를 선택해 주세요.";
    } else if (imageFiles.length === files.length) {
      if (files.length > 5) {
        nextError = "사진은 한 번에 최대 5장까지 선택할 수 있습니다.";
      } else if (files.some((file) => !isSupportedImageMimeType(file.type))) {
        nextError = "JPG, PNG 또는 WEBP 사진만 분석할 수 있습니다.";
      } else if (files.some((file) => file.size > MAX_IMAGE_FILE_SIZE)) {
        nextError = "사진은 각각 10 MB 이하 파일을 선택해 주세요.";
      }
    } else if (videoFiles.length === files.length) {
      if (files.length > 1) {
        nextError = "영상은 한 번에 1개만 선택할 수 있습니다.";
      } else if (!SUPPORTED_VIDEO_MIME_TYPES.has(files[0].type)) {
        nextError = "MP4 또는 MOV 영상만 선택할 수 있습니다.";
      } else if (files[0].size > MAX_VIDEO_FILE_SIZE) {
        nextError = "체험용 영상은 100 MB 이하 파일을 선택해 주세요.";
      }
    } else {
      nextError = "사진 여러 장 또는 영상 1개 중 한 가지 방식으로 선택해 주세요.";
    }

    if (nextError) {
      setError(nextError);
      event.target.value = "";
      return;
    }

    setError(null);
    setMediaFiles(files);
    event.target.value = "";
  }

  function removeFile() {
    setMediaFiles([]);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function beginAnalysis() {
    if (!selectedFile || error) return;

    setAnalysisStarted(true);
    router.push("/analyzing");
    if (mediaKind === "image") void analyzeSelectedImage();
  }

  return (
    <div className="page-container space-y-7 pb-10 pt-4">
      <header className="space-y-3">
        <SectionLabel>사진·영상 등록</SectionLabel>
        <h1 className="page-heading">
          휴대폰 앨범에서
          <br />
          자료를 선택해주세요.
        </h1>
        <p className="page-subtitle">
          사진은 최대 5장, 영상은 1개까지 등록할 수 있어요.
        </p>
      </header>

      <section aria-labelledby="album-upload-title" className="space-y-4">
        <h2 id="album-upload-title" className="sr-only">
          앨범에서 신고 자료 선택
        </h2>
        <input
          ref={fileInputRef}
          id="incident-file"
          type="file"
          accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
          multiple
          onChange={handleFileChange}
          className="sr-only"
          aria-label="사진 또는 영상 파일 선택"
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? "supported-file-types upload-error" : "supported-file-types"
          }
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex min-h-60 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#9ec4ed] bg-[#f7fbff] px-6 py-9 text-center transition-colors hover:border-[var(--primary)] hover:bg-[var(--primary-soft)]"
        >
          <span
            className="grid h-14 w-14 place-items-center rounded-xl bg-white text-[var(--primary)]"
            aria-hidden="true"
          >
            <span className="h-7 w-7">
              <UploadIcon />
            </span>
          </span>
          <span className="mt-4 text-base font-extrabold text-[var(--navy)]">
            {selectedFile ? "다른 자료 선택하기" : "앨범 열기"}
          </span>
          <span
            id="supported-file-types"
            className="mt-2 text-xs font-semibold tracking-wide text-[var(--ink-muted)]"
          >
            JPG, PNG, WEBP, MP4, MOV
          </span>
        </button>

        {error ? (
          <p
            id="upload-error"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold leading-6 text-red-700"
            role="alert"
          >
            {error}
          </p>
        ) : null}
      </section>

      {selectedFile ? (
        <section className="space-y-3" aria-labelledby="selected-media-title">
          <div className="flex items-center justify-between gap-3">
            <h2 id="selected-media-title" className="section-heading">
              선택한 자료
            </h2>
            <StatusBadge tone={mediaKind === "video" ? "orange" : "blue"}>
              {mediaKind === "video" ? "영상 데모" : `사진 ${selectedFiles.length}장`}
            </StatusBadge>
          </div>
          <div className="surface-card space-y-4 p-4">
            <MediaPreview
              kind={mediaKind}
              previewUrl={previewUrl}
              fileName={selectedFile.name}
              onMediaError={() =>
                setError(
                  "이 파일을 미리볼 수 없습니다. 다른 사진이나 영상을 선택해 주세요.",
                )
              }
            />
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p
                  className="truncate text-sm font-bold text-[var(--navy)]"
                  title={selectedFile.name}
                >
                  {selectedFile.name}
                </p>
                <p className="mt-1 text-xs text-[var(--ink-muted)]">
                  {mediaKind === "video" ? "영상" : "대표 사진"} ·{" "}
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="min-h-11 shrink-0 rounded-lg px-3 py-2 text-sm font-bold text-[#667f96] hover:bg-[#eef3f7]"
              >
                {selectedFiles.length > 1 ? "전체 제거" : "제거"}
              </button>
            </div>
            {selectedFiles.length > 1 ? (
              <ul className="space-y-2 border-t border-[#e3ebf3] pt-3" aria-label="선택한 추가 사진">
                {selectedFiles.slice(1).map((file, index) => (
                  <li
                    key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                    className="flex items-center justify-between gap-3 text-xs"
                  >
                    <span className="min-w-0 truncate font-semibold text-[#526d86]">
                      사진 {index + 2} · {file.name}
                    </span>
                    <span className="shrink-0 text-[var(--ink-muted)]">
                      {formatFileSize(file.size)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          {mediaKind === "video" ? (
            <InfoCard tone="orange" title="영상 분석 데모 안내">
              이번 단계에서는 영상을 실제 AI로 분석하지 않고, 위반 장면 탐색
              흐름을 예시 결과로 보여드려요.
            </InfoCard>
          ) : selectedFiles.length > 1 ? (
            <InfoCard tone="blue" title="현재 MVP 분석 안내">
              첫 번째 사진 1장만 AI 참고 분석에 사용해요. 나머지 사진은 이
              선택 목록에만 보관되며 분석 API로 전송하지 않아요.
            </InfoCard>
          ) : null}
        </section>
      ) : null}

      <InfoCard tone="blue" title="개인정보 보호 안내">
        <p>신고 목적 외 영상 공개는 금지됩니다.</p>
        <p className="mt-2">
          대표 사진 1장은 분석을 위해 서버로 일시 전송되며 저장하지 않아요.
          모의 분석에서는 외부 AI로 보내지 않고, OpenAI 분석 설정일 때만
          제공자에 전달해요. 영상과 추가 사진은 현재 분석 API로 전송하지
          않아요.
        </p>
      </InfoCard>

      <PrimaryButton
        type="button"
        onClick={beginAnalysis}
        disabled={!selectedFile || Boolean(error)}
        fullWidth
        trailingIcon={<span aria-hidden="true">→</span>}
      >
        선택한 자료 분석하기
      </PrimaryButton>
    </div>
  );
}
