import type { MapLayerSelection } from "./types";
import {
  MAP_LAYER_DEFINITIONS,
  getMapLayerDefinition,
} from "./types";

interface LayerSelectorProps {
  selection: MapLayerSelection;
  onChange: (selection: MapLayerSelection) => void;
}

const statusTone = {
  LIVE: "bg-[#e7f8f3] text-[#168f73]",
  COMING_SOON: "bg-[#edf1f5] text-[#61788e]",
  DEMO: "bg-[#fff4e4] text-[#a45e09]",
} as const;

function selectionDescription(selection: MapLayerSelection) {
  if (selection === "ALL") {
    return {
      badge: "실제 + DEMO",
      badgeClassName: "bg-[#edf6ff] text-[#2569bc]",
      text: "Kakao 실시간 교통과 바로잡길 데모 집계를 함께 표시합니다.",
    };
  }

  const layer = getMapLayerDefinition(selection);
  if (!layer) return null;

  return {
    badge: layer.statusLabel,
    badgeClassName: statusTone[layer.status],
    text: layer.description,
  };
}

export function LayerSelector({ selection, onChange }: LayerSelectorProps) {
  const selectedDescription = selectionDescription(selection);

  return (
    <section aria-labelledby="map-layer-heading" className="space-y-3">
      <h2 id="map-layer-heading" className="sr-only">
        지도 레이어 선택
      </h2>
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="지도에 표시할 데이터 선택"
      >
        <button
          type="button"
          aria-pressed={selection === "ALL"}
          onClick={() => onChange("ALL")}
          className={`min-h-11 rounded-xl border px-3.5 text-sm font-extrabold transition-colors ${
            selection === "ALL"
              ? "border-[var(--primary)] bg-[var(--primary)] text-white"
              : "border-[var(--line)] bg-white text-[#526f88] hover:border-[#a9caed]"
          }`}
        >
          종합
        </button>

        {MAP_LAYER_DEFINITIONS.map((layer) => {
          const isSelected = selection === layer.id;
          return (
            <button
              key={layer.id}
              type="button"
              aria-label={`${layer.label}, ${layer.statusLabel}`}
              aria-pressed={isSelected}
              onClick={() => onChange(layer.id)}
              className={`flex min-h-11 items-center gap-1.5 rounded-xl border px-3 text-sm font-extrabold transition-colors ${
                isSelected
                  ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                  : "border-[var(--line)] bg-white text-[#526f88] hover:border-[#a9caed]"
              }`}
            >
              <span>{layer.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[9px] font-extrabold ${
                  isSelected
                    ? "bg-white/20 text-white"
                    : statusTone[layer.status]
                }`}
                aria-hidden="true"
              >
                {layer.status === "LIVE"
                  ? "실제"
                  : layer.status === "DEMO"
                    ? "DEMO"
                    : "준비"}
              </span>
            </button>
          );
        })}
      </div>

      {selectedDescription ? (
        <div
          className="flex items-start gap-2.5 rounded-xl bg-[#f5f8fb] px-3.5 py-3"
          aria-live="polite"
        >
          <span
            className={`mt-0.5 shrink-0 rounded-full px-2 py-1 text-[10px] font-extrabold ${selectedDescription.badgeClassName}`}
          >
            {selectedDescription.badge}
          </span>
          <p className="text-xs font-semibold leading-5 text-[#617b94]">
            {selectedDescription.text}
          </p>
        </div>
      ) : null}
    </section>
  );
}
