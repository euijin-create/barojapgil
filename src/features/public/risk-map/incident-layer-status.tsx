import type { TrafficIncidentLoadState } from "./use-traffic-incidents";

interface IncidentLayerStatusProps {
  state: TrafficIncidentLoadState;
  visible: boolean;
  onRetry: () => void;
}

export function IncidentLayerStatus({
  state,
  visible,
  onRetry,
}: IncidentLayerStatusProps) {
  if (!visible) return null;

  if (state.status === "LOADING") {
    return (
      <div
        className="flex items-center gap-2.5 rounded-xl bg-[#edf6ff] px-3.5 py-3 text-xs font-bold text-[#456b8e]"
        role="status"
      >
        <span
          className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-[#bcd7f3] border-t-[var(--primary)]"
          aria-hidden="true"
        />
        실시간 돌발정보를 불러오는 중
      </div>
    );
  }

  if (state.status === "ERROR") {
    return (
      <div
        className="flex items-center justify-between gap-3 rounded-xl bg-[#fff4e4] px-3.5 py-3"
        role="alert"
      >
        <p className="text-xs font-bold leading-5 text-[#8a5a18]">
          서울 실시간 돌발정보를 불러오지 못했습니다.
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

  if (state.status === "EMPTY") {
    return (
      <p
        className="rounded-xl bg-[#f5f8fb] px-3.5 py-3 text-center text-xs font-bold text-[#617b94]"
        role="status"
      >
        현재 표시할 돌발상황이 없습니다.
      </p>
    );
  }

  return (
    <p
      className="rounded-xl bg-[#e7f8f3] px-3.5 py-3 text-center text-xs font-bold text-[#36776a]"
      role="status"
    >
      서울 TOPIS 실시간 돌발정보 {state.incidents.length}건 · 마커를 눌러 상세 확인
    </p>
  );
}
