"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  KakaoMapSdk,
  type KakaoSdkErrorCode,
} from "./kakao-map-sdk";
import type { DemoRiskAggregateArea } from "./types";

interface KakaoTrafficMapProps {
  appKey: string;
  showTraffic: boolean;
  showReportAreas: boolean;
  areas: readonly DemoRiskAggregateArea[];
  selectedAreaId: string | null;
  onSelectArea: (areaId: string) => void;
}

interface ReportOverlayRecord {
  circle: KakaoCircleInstance;
  overlay: KakaoCustomOverlayInstance;
  circleClickHandler: () => void;
  markerButton: HTMLButtonElement;
  markerClickHandler: (event: MouseEvent) => void;
}

const SEOUL_CITY_HALL = {
  latitude: 37.566826,
  longitude: 126.9786567,
} as const;

function sdkErrorMessage(code: KakaoSdkErrorCode) {
  if (code === "SDK_LOAD_FAILED") {
    return "지도를 불러오지 못했습니다. 네트워크 연결을 확인해주세요.";
  }

  return "Kakao 지도 설정 또는 허용 도메인을 확인해주세요.";
}

function createAggregateMarker(
  area: DemoRiskAggregateArea,
  isSelected: boolean,
) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `risk-map-zone-marker${isSelected ? " is-selected" : ""}`;
  button.setAttribute(
    "aria-label",
    `${area.name}, 바로잡길 데모 신고 집계 ${area.reportCount}건`,
  );

  const status = document.createElement("span");
  status.className = "risk-map-zone-marker__status";
  status.textContent = "DEMO";

  const count = document.createElement("strong");
  count.className = "risk-map-zone-marker__count";
  count.textContent = `${area.reportCount}건`;

  button.append(status, count);
  return button;
}

export function KakaoTrafficMap({
  appKey,
  showTraffic,
  showReportAreas,
  areas,
  selectedAreaId,
  onSelectArea,
}: KakaoTrafficMapProps) {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<KakaoMapInstance | null>(null);
  const mapsRef = useRef<KakaoMapsNamespace | null>(null);
  const overlayRecordsRef = useRef<ReportOverlayRecord[]>([]);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [trafficError, setTrafficError] = useState(false);

  const clearReportOverlays = useCallback(() => {
    const maps = mapsRef.current;
    for (const record of overlayRecordsRef.current) {
      if (maps) {
        maps.event.removeListener(
          record.circle,
          "click",
          record.circleClickHandler,
        );
      }
      record.markerButton.removeEventListener(
        "click",
        record.markerClickHandler,
      );
      record.circle.setMap(null);
      record.overlay.setMap(null);
    }
    overlayRecordsRef.current = [];
  }, []);

  const initializeMap = useCallback((maps: KakaoMapsNamespace) => {
    const container = mapElementRef.current;
    if (!container) return;

    try {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.relayout();
        setMapReady(true);
        return;
      }

      const map = new maps.Map(container, {
        center: new maps.LatLng(
          SEOUL_CITY_HALL.latitude,
          SEOUL_CITY_HALL.longitude,
        ),
        level: 8,
        draggable: true,
        scrollwheel: true,
      });
      map.addControl(new maps.ZoomControl(), maps.ControlPosition.RIGHT);
      map.setKeyboardShortcuts(true);

      mapsRef.current = maps;
      mapInstanceRef.current = map;
      setMapError(null);
      setMapReady(true);
    } catch {
      setMapError("지도를 초기화하지 못했습니다. Kakao 지도 설정을 확인해주세요.");
    }
  }, []);

  const handleSdkError = useCallback((code: KakaoSdkErrorCode) => {
    setMapError(sdkErrorMessage(code));
    setMapReady(false);
  }, []);

  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !mapsRef.current) return;

    const map = mapInstanceRef.current;
    const maps = mapsRef.current;
    let feedbackTimer: number | null = null;

    try {
      map.removeOverlayMapTypeId(maps.MapTypeId.TRAFFIC);
      if (showTraffic) {
        map.addOverlayMapTypeId(maps.MapTypeId.TRAFFIC);
      }
      feedbackTimer = window.setTimeout(() => setTrafficError(false), 0);
    } catch {
      feedbackTimer = window.setTimeout(() => setTrafficError(true), 0);
    }

    return () => {
      if (feedbackTimer !== null) window.clearTimeout(feedbackTimer);
      try {
        map.removeOverlayMapTypeId(maps.MapTypeId.TRAFFIC);
      } catch {
        // SDK 정리 단계에서는 사용자 화면을 다시 변경하지 않는다.
      }
    };
  }, [mapReady, showTraffic]);

  useEffect(() => {
    clearReportOverlays();
    if (
      !mapReady ||
      !showReportAreas ||
      !mapInstanceRef.current ||
      !mapsRef.current
    ) {
      return;
    }

    const map = mapInstanceRef.current;
    const maps = mapsRef.current;

    overlayRecordsRef.current = areas.map((area) => {
      const center = new maps.LatLng(
        area.center.latitude,
        area.center.longitude,
      );
      const isSelected = area.id === selectedAreaId;
      const circle = new maps.Circle({
        center,
        radius: area.radiusMeters,
        strokeWeight: isSelected ? 3 : 2,
        strokeColor: isSelected ? "#2f80ed" : "#168f73",
        strokeOpacity: 0.9,
        strokeStyle: "solid",
        fillColor: isSelected ? "#2f80ed" : "#26b894",
        fillOpacity: isSelected ? 0.2 : 0.13,
        clickable: true,
      });
      circle.setMap(map);

      const circleClickHandler = () => onSelectArea(area.id);
      maps.event.addListener(circle, "click", circleClickHandler);

      const markerButton = createAggregateMarker(area, isSelected);
      const markerClickHandler = (event: MouseEvent) => {
        event.stopPropagation();
        onSelectArea(area.id);
      };
      markerButton.addEventListener("click", markerClickHandler);

      const overlay = new maps.CustomOverlay({
        map,
        position: center,
        content: markerButton,
        xAnchor: 0.5,
        yAnchor: 0.5,
        zIndex: isSelected ? 4 : 3,
        clickable: true,
      });

      return {
        circle,
        overlay,
        circleClickHandler,
        markerButton,
        markerClickHandler,
      };
    });

    return clearReportOverlays;
  }, [
    areas,
    clearReportOverlays,
    mapReady,
    onSelectArea,
    selectedAreaId,
    showReportAreas,
  ]);

  useEffect(() => {
    if (!mapReady || !mapElementRef.current || !mapInstanceRef.current) return;
    if (typeof ResizeObserver === "undefined") return;

    const map = mapInstanceRef.current;
    const observer = new ResizeObserver(() => map.relayout());
    observer.observe(mapElementRef.current);
    return () => observer.disconnect();
  }, [mapReady]);

  useEffect(() => {
    return () => {
      clearReportOverlays();
      const map = mapInstanceRef.current;
      const maps = mapsRef.current;
      if (map && maps) {
        try {
          map.removeOverlayMapTypeId(maps.MapTypeId.TRAFFIC);
        } catch {
          // unmount 중 SDK 정리 실패는 무시한다.
        }
      }
      mapInstanceRef.current = null;
      mapsRef.current = null;
    };
  }, [clearReportOverlays]);

  const normalizedAppKey = appKey.trim();
  const configurationMissing = normalizedAppKey.length === 0;
  const visibleError = configurationMissing
    ? "지도 연결 설정이 필요합니다. 관리자에게 문의해주세요."
    : mapError;

  return (
    <div className="space-y-2">
      <div
        className="relative h-[58svh] min-h-[430px] max-h-[560px] overflow-hidden rounded-2xl border border-[#ccdbe8] bg-[#eaf0f5]"
        role="region"
        aria-label="서울 교통안전 지도"
      >
        <div
          ref={mapElementRef}
          className="absolute inset-0 h-full w-full"
          tabIndex={mapReady ? 0 : -1}
          aria-label="Kakao 지도. 드래그와 확대 또는 축소로 서울 지역을 살펴볼 수 있습니다."
        />

        {!visibleError && !mapReady ? (
          <div
            className="absolute inset-0 z-10 grid place-items-center bg-[#f4f7fa] px-6 text-center"
            aria-live="polite"
          >
            <div>
              <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-3 border-[#c9d9e7] border-t-[var(--primary)]" />
              <p className="mt-4 text-sm font-extrabold text-[var(--navy)]">
                지도를 불러오고 있어요
              </p>
            </div>
          </div>
        ) : null}

        {visibleError ? (
          <div
            className="absolute inset-0 z-20 grid place-items-center bg-[#f7f9fb] px-7 text-center"
            role="alert"
          >
            <div>
              <span
                className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-[#fff4e4] text-xl font-extrabold text-[#a45e09]"
                aria-hidden="true"
              >
                !
              </span>
              <p className="mt-4 text-base font-extrabold text-[var(--navy)]">
                지도를 표시할 수 없어요
              </p>
              <p className="mt-2 text-sm leading-6 text-[#617b94]">
                {visibleError}
              </p>
              {!configurationMissing ? (
                <button
                  type="button"
                  className="mt-5 min-h-11 rounded-xl border border-[#b9d3f2] bg-white px-4 text-sm font-extrabold text-[var(--primary-dark)]"
                  onClick={() => window.location.reload()}
                >
                  다시 불러오기
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      {trafficError ? (
        <p className="rounded-xl bg-[#fff4e4] px-3.5 py-2.5 text-xs font-semibold text-[#8a5a18]" role="status">
          실시간 교통정보를 표시하지 못했습니다. 잠시 후 다시 시도해주세요.
        </p>
      ) : null}

      {!configurationMissing ? (
        <KakaoMapSdk
          appKey={normalizedAppKey}
          onReady={initializeMap}
          onError={handleSdkError}
        />
      ) : null}
    </div>
  );
}
