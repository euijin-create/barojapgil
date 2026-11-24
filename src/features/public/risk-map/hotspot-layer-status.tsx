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
        className="flex items-center gap-2.5 rounded-xl bg-[#fff4e4] px-3.5 py-3 text-xs font-bold text-[#8a5a18]"
        role="status"
      >
        <span
          className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-[#f1d29f] border-t-[#c46d18]"
          aria-hidden="true"
        />
        공식 사고다발지역을 불러오는 중
      </div>
    );
  }

  if (state.status === "ERROR") {
    return (
      <div
        className="flex items-center justify-between gap-3 rounded-xl bg-[#fff0ee] px-3.5 py-3"
        role="alert"
      >
        <p className="text-xs font-bold leading-5 text-[#a34740]">
          사고다발지역을 불러오지 못했습니다.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="min-h-9 shrink-0 rounded-lg border border-[#e9b6b1] bg-white px-3 text-xs font-extrabold text-[#a34740]"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (state.status === "EMPTY") {
    return (
      <p
        className="rounded-xl bg-[#f5f8fb] px-3.5 py-3 text-center text-xs font-bold text-[#617b94]"
        role="status"
      >
        {state.dataYear}년 기준 표시할 사고다발지역이 없습니다.
      </p>
    );
  }

  if (state.status === "PARTIAL") {
    return (
      <div
        className="flex items-center justify-between gap-3 rounded-xl bg-[#fff4e4] px-3.5 py-3"
        role="status"
      >
        <p className="text-xs font-bold leading-5 text-[#8a5a18]">
          일부 지역을 불러오지 못했습니다. {state.hotspots.length}곳 표시 중
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="min-h-9 shrink-0 rounded-lg border border-[#efc987] bg-white px-3 text-xs font-extrabold text-[#8a5a18]"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <p
      className="rounded-xl bg-[#fff4e4] px-3.5 py-3 text-center text-xs font-bold text-[#8a5a18]"
      role="status"
    >
      TAAS {state.dataYear}년 기준 {state.hotspots.length}곳 · 영역을 눌러 상세 확인
    </p>
  );
}
