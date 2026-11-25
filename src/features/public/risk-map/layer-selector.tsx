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
  OFFICIAL: "bg-[#fff4e4] text-[#a45e09]",
  COMING_SOON: "bg-[#edf1f5] text-[#61788e]",
  DEMO: "bg-[#fff4e4] text-[#a45e09]",
} as const;

function selectionDescription(selection: MapLayerSelection) {
  if (selection === "ALL") {
    return {
      badge: "4개 레이어",
      badgeClassName: "bg-[#edf6ff] text-[#2569bc]",
      text: "실시간 교통·돌발정보·사고다발·DEMO 신고를 함께 봅니다.",
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
        className="grid grid-cols-6 gap-2"
        role="group"
        aria-label="지도에 표시할 데이터 선택"
      >
        <button
          type="button"
          aria-pressed={selection === "ALL"}
          onClick={() => onChange("ALL")}
          className={`col-span-2 min-h-11 whitespace-nowrap rounded-xl border px-2 text-[13px] font-extrabold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] ${
            selection === "ALL"
              ? "border-[var(--primary)] bg-[var(--primary)] text-white"
              : "border-[var(--line)] bg-white text-[#526f88] hover:border-[#a9caed]"
          }`}
        >
          종합
        </button>

        {MAP_LAYER_DEFINITIONS.map((layer, index) => {
          const isSelected = selection === layer.id;
          const gridClassName = index < 2 ? "col-span-2" : "col-span-3";
          return (
            <button
              key={layer.id}
              type="button"
              aria-label={`${layer.label}, ${layer.statusLabel}`}
              aria-pressed={isSelected}
              onClick={() => onChange(layer.id)}
              className={`${gridClassName} min-h-11 whitespace-nowrap rounded-xl border px-2 text-[13px] font-extrabold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] ${
                isSelected
                  ? "border-[var(--primary)] bg-[var(--primary)] text-white"
                  : "border-[var(--line)] bg-white text-[#526f88] hover:border-[#a9caed]"
              }`}
            >
              {layer.label}
            </button>
          );
        })}
      </div>

      {selectedDescription ? (
        <div
          className="flex items-center gap-2.5 rounded-xl bg-[#f5f8fb] px-3.5 py-2.5"
          aria-live="polite"
        >
          <span
            className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-extrabold ${selectedDescription.badgeClassName}`}
          >
            {selectedDescription.badge}
          </span>
          <p className="min-w-0 text-xs font-semibold leading-5 text-[#617b94]">
            {selectedDescription.text}
          </p>
        </div>
      ) : null}
    </section>
  );
}
