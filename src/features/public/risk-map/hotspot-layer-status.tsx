import type { AccidentHotspotLoadState } from "./use-accident-hotspots";

interface HotspotLayerStatusProps {
  state: AccidentHotspotLoadState;
  visible: boolean;
  onRetry: () => void;
}

export function HotspotLayerStatus({
  state,
  visible,
  onRetry,
}: HotspotLayerStatusProps) {
  if (!visible) return null;

  if (state.status === "LOADING") {
    return (
      <div
        className="flex min-h-11 items-center gap-2.5 rounded-xl border border-[#f0d7b1] bg-[#fff8ed] px-3.5 py-2.5 text-xs font-bold text-[#8a5a18]"
        role="status"
      >
        <span
          className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-[#f1d29f] border-t-[#c46d18]"
          aria-hidden="true"
        />
        TAAS 사고다발지역 불러오는 중
      </div>
    );
  }

  if (state.status === "ERROR") {
    return (
      <div
        className="flex flex-col items-stretch gap-2 rounded-xl border border-[#efc7c2] bg-[#fff3f1] px-3.5 py-3 min-[360px]:flex-row min-[360px]:items-center min-[360px]:justify-between"
        role="alert"
      >
        <p className="text-xs font-bold leading-5 text-[#a34740]">
          TAAS 사고다발지역을 불러오지 못했어요.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="min-h-10 shrink-0 rounded-lg border border-[#e9b6b1] bg-white px-3 text-xs font-extrabold text-[#a34740] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a34740]"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (state.status === "EMPTY") {
    return (
      <p
        className="rounded-xl border border-[#e1e8ef] bg-[#f7f9fb] px-3.5 py-2.5 text-center text-xs font-bold text-[#617b94]"
        role="status"
      >
        {state.dataYear}년 기준 표시할 사고다발지역이 없습니다.
      </p>
    );
  }

  if (state.status === "PARTIAL") {
    return (
      <div
        className="flex flex-col items-stretch gap-2 rounded-xl border border-[#f0d7b1] bg-[#fff8ed] px-3.5 py-3 min-[360px]:flex-row min-[360px]:items-center min-[360px]:justify-between"
        role="status"
      >
        <p className="text-xs font-bold leading-5 text-[#8a5a18]">
          일부 지역 누락 · {state.hotspots.length}곳 표시 중
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="min-h-10 shrink-0 rounded-lg border border-[#efc987] bg-white px-3 text-xs font-extrabold text-[#8a5a18] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a45e09]"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-11 items-center justify-between gap-2 rounded-xl border border-[#f0d7b1] bg-[#fff8ed] px-3.5 py-2.5"
      role="status"
    >
      <span className="min-w-0 text-xs font-bold text-[#8a5a18]">
        TAAS {state.dataYear}년
      </span>
      <strong className="shrink-0 text-sm font-extrabold text-[#8a5a18]">
        {state.hotspots.length}곳
      </strong>
    </div>
  );
}
