"use client";

import { useCallback, useMemo, useState } from "react";
import { useDemo } from "@/features/demo/demo-context";
import { AccidentHotspotDetailCard } from "./risk-map/accident-hotspot-detail-card";
import { DEMO_RISK_AGGREGATE_AREAS } from "./risk-map/demo-risk-map-data";
import { HotspotLayerStatus } from "./risk-map/hotspot-layer-status";
import { IncidentDetailCard } from "./risk-map/incident-detail-card";
import { IncidentLayerStatus } from "./risk-map/incident-layer-status";
import { KakaoTrafficMap } from "./risk-map/kakao-traffic-map";
import { LayerSelector } from "./risk-map/layer-selector";
import { RiskAreaDetailCard } from "./risk-map/risk-area-detail-card";
import {
  MAP_LAYER_DEFINITIONS,
  selectionIncludesLayer,
  type MapLayerSelection,
} from "./risk-map/types";
import { useAccidentHotspots } from "./risk-map/use-accident-hotspots";
import { useTrafficIncidents } from "./risk-map/use-traffic-incidents";

interface RiskMapViewProps {
  kakaoMapKey: string;
}

const sourceStatusClassName = {
  LIVE: "bg-[#e7f8f3] text-[#168f73]",
  OFFICIAL: "bg-[#fff4e4] text-[#a45e09]",
  COMING_SOON: "bg-[#edf1f5] text-[#61788e]",
  DEMO: "bg-[#fff4e4] text-[#a45e09]",
} as const;

export default function RiskMapView({ kakaoMapKey }: RiskMapViewProps) {
  const [selection, setSelection] = useState<MapLayerSelection>("ALL");
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(
    null,
  );
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(
    null,
  );
  const { riskConsent, setRiskConsent } = useDemo();
  const { state: incidentState, retry: retryIncidents } =
    useTrafficIncidents();
  const { state: hotspotState, retry: retryHotspots } =
    useAccidentHotspots();

  const showTraffic = selectionIncludesLayer(selection, "TRAFFIC");
  const showHotspots = selectionIncludesLayer(selection, "ACCIDENT_HOTSPOT");
  const showReportAreas = selectionIncludesLayer(
    selection,
    "BAROJAPGIL_REPORT",
  );
  const showIncidents = selectionIncludesLayer(selection, "INCIDENT");
  const selectedHotspot = useMemo(
    () =>
      showHotspots
        ? (hotspotState.hotspots.find(
            (hotspot) => hotspot.id === selectedHotspotId,
          ) ?? null)
        : null,
    [hotspotState.hotspots, selectedHotspotId, showHotspots],
  );
  const selectedArea = useMemo(
    () =>
      showReportAreas
        ? (DEMO_RISK_AGGREGATE_AREAS.find(
            (area) => area.id === selectedAreaId,
          ) ?? null)
        : null,
    [selectedAreaId, showReportAreas],
  );
  const selectedIncident = useMemo(
    () =>
      showIncidents
        ? (incidentState.incidents.find(
            (incident) => incident.id === selectedIncidentId,
          ) ?? null)
        : null,
    [incidentState.incidents, selectedIncidentId, showIncidents],
  );

  const selectArea = useCallback((areaId: string) => {
    setSelectedAreaId(areaId);
    setSelectedIncidentId(null);
    setSelectedHotspotId(null);
  }, []);

  const selectIncident = useCallback((incidentId: string) => {
    setSelectedIncidentId(incidentId);
    setSelectedAreaId(null);
    setSelectedHotspotId(null);
  }, []);

  const selectHotspot = useCallback((hotspotId: string) => {
    setSelectedHotspotId(hotspotId);
    setSelectedAreaId(null);
    setSelectedIncidentId(null);
  }, []);

  function selectLayer(nextSelection: MapLayerSelection) {
    setSelection(nextSelection);
    if (!selectionIncludesLayer(nextSelection, "BAROJAPGIL_REPORT")) {
      setSelectedAreaId(null);
    }
    if (!selectionIncludesLayer(nextSelection, "INCIDENT")) {
      setSelectedIncidentId(null);
    }
    if (!selectionIncludesLayer(nextSelection, "ACCIDENT_HOTSPOT")) {
      setSelectedHotspotId(null);
    }
  }

  return (
    <div className="mt-6 space-y-5">
      <LayerSelector selection={selection} onChange={selectLayer} />

      <section aria-labelledby="seoul-map-heading" className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-extrabold tracking-[0.06em] text-[var(--primary)]">
              SEOUL SAFETY MAP
            </p>
            <h2
              id="seoul-map-heading"
              className="mt-1 text-base font-extrabold text-[var(--navy)]"
            >
              서울 교통안전 지도
            </h2>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-1.5 text-[10px] font-extrabold">
            {showTraffic ? (
              <span className="rounded-full bg-[#e7f8f3] px-2 py-1 text-[#168f73]">
                교통 실제
              </span>
            ) : null}
            {showIncidents ? (
              <span className="rounded-full bg-[#edf6ff] px-2 py-1 text-[#2569bc]">
                돌발 실시간
              </span>
            ) : null}
            {showHotspots ? (
              <span className="rounded-full bg-[#fff4e4] px-2 py-1 text-[#a45e09]">
                사고다발 공식
              </span>
            ) : null}
            {showReportAreas ? (
              <span className="rounded-full bg-[#fff4e4] px-2 py-1 text-[#a45e09]">
                신고 DEMO
              </span>
            ) : null}
          </div>
        </div>

        <KakaoTrafficMap
          appKey={kakaoMapKey}
          showTraffic={showTraffic}
          showHotspots={showHotspots}
          showReportAreas={showReportAreas}
          showIncidents={showIncidents}
          hotspots={hotspotState.hotspots}
          areas={DEMO_RISK_AGGREGATE_AREAS}
          incidents={incidentState.incidents}
          selectedHotspotId={selectedHotspotId}
          selectedAreaId={selectedAreaId}
          selectedIncidentId={selectedIncidentId}
          onSelectHotspot={selectHotspot}
          onSelectArea={selectArea}
          onSelectIncident={selectIncident}
        />

        <IncidentLayerStatus
          state={incidentState}
          visible={showIncidents}
          onRetry={retryIncidents}
        />

        <HotspotLayerStatus
          state={hotspotState}
          visible={showHotspots}
          onRetry={retryHotspots}
        />

        {selection === "BAROJAPGIL_REPORT" && !selectedArea ? (
          <p className="text-center text-xs font-semibold text-[var(--ink-muted)]">
            DEMO 집계구역을 선택하면 요약을 확인할 수 있어요.
          </p>
        ) : null}
      </section>

      {selectedHotspot ? (
        <AccidentHotspotDetailCard hotspot={selectedHotspot} />
      ) : selectedIncident ? (
        <IncidentDetailCard incident={selectedIncident} />
      ) : selectedArea ? (
        <RiskAreaDetailCard
          area={selectedArea}
          isTrafficVisible={showTraffic}
        />
      ) : null}

      <section
        className="rounded-2xl border border-[var(--line)] bg-white p-4"
        aria-labelledby="map-source-heading"
      >
        <h2
          id="map-source-heading"
          className="text-base font-extrabold text-[var(--navy)]"
        >
          데이터 출처
        </h2>
        <ul className="mt-3 divide-y divide-[#e7edf3]">
          {MAP_LAYER_DEFINITIONS.map((layer) => (
            <li
              key={layer.id}
              className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="text-sm font-extrabold text-[#294a65]">
                  {layer.label}
                </p>
                <p className="mt-0.5 truncate text-[11px] text-[var(--ink-muted)]">
                  {layer.source}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold ${sourceStatusClassName[layer.status]}`}
              >
                {layer.statusLabel}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 border-t border-[#e7edf3] pt-3 text-[11px] font-semibold leading-5 text-[#6b839a]">
          출처: 한국도로교통공단 교통사고분석시스템(TAAS) / 공공데이터포털
          <br />
          서울특별시 TOPIS / 서울 열린데이터광장
        </p>
        <p className="mt-2 text-[11px] font-semibold leading-5 text-[#8a6b42]">
          사고다발지역은 실시간 정보가 아닌 과거 교통사고 통계입니다.
        </p>
      </section>

      <section className="rounded-2xl border border-[#ccecdf] bg-[#e7f8f3] p-4">
        <h2 className="text-sm font-extrabold text-[var(--navy)]">
          개인정보 보호
        </h2>
        <p className="mt-1 text-xs leading-5 text-[#53786f]">
          차량번호·신고자·원본 미디어·이동경로·개별 신고 위치는 지도에 표시하지 않습니다.
        </p>
        <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-xl bg-white/75 p-3.5">
          <input
            type="checkbox"
            checked={riskConsent}
            onChange={(event) => setRiskConsent(event.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--primary)]"
          />
          <span className="text-xs font-bold leading-5 text-[#365f57]">
            비식별 교통위험 집계 제공 동의
            <span className="ml-1 font-normal text-[#6b8982]">(선택)</span>
          </span>
        </label>
      </section>
    </div>
  );
}
