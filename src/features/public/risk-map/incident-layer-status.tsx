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
        className="flex min-h-11 items-center gap-2.5 rounded-xl border border-[#d6e8f8] bg-[#f3f8fd] px-3.5 py-2.5 text-xs font-bold text-[#456b8e]"
        role="status"
      >
        <span
          className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-[#bcd7f3] border-t-[var(--primary)]"
          aria-hidden="true"
        />
        TOPIS 돌발정보 불러오는 중
      </div>
    );
  }

  if (state.status === "ERROR") {
    return (
      <div
        className="flex flex-col items-stretch gap-2 rounded-xl border border-[#f0d7b1] bg-[#fff8ed] px-3.5 py-3 min-[360px]:flex-row min-[360px]:items-center min-[360px]:justify-between"
        role="alert"
      >
        <p className="text-xs font-bold leading-5 text-[#8a5a18]">
          TOPIS 돌발정보를 불러오지 못했어요.
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

  if (state.status === "EMPTY") {
    return (
      <p
        className="rounded-xl border border-[#e1e8ef] bg-[#f7f9fb] px-3.5 py-2.5 text-center text-xs font-bold text-[#617b94]"
        role="status"
      >
        현재 표시할 돌발상황이 없습니다.
      </p>
    );
  }

  return (
    <div
      className="flex min-h-11 items-center justify-between gap-2 rounded-xl border border-[#ccecdf] bg-[#f0faf7] px-3.5 py-2.5"
      role="status"
    >
      <span className="flex min-w-0 items-center gap-2 text-xs font-bold text-[#36776a]">
        <span
          className="h-2 w-2 shrink-0 rounded-full bg-[#26b894]"
          aria-hidden="true"
        />
        TOPIS 돌발정보
      </span>
      <strong className="shrink-0 text-sm font-extrabold text-[#176d5b]">
        {state.incidents.length}건
      </strong>
    </div>
  );
}
