"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  AccidentHotspot,
  AccidentHotspotWarning,
} from "@/contracts/accident-hotspots";

export type AccidentHotspotLoadState =
  | {
      status: "LOADING";
      hotspots: readonly AccidentHotspot[];
      dataYear: null;
      fetchedAt: null;
      warnings: readonly AccidentHotspotWarning[];
    }
  | {
      status: "SUCCESS" | "EMPTY" | "PARTIAL";
      hotspots: readonly AccidentHotspot[];
      dataYear: number;
      fetchedAt: string;
      warnings: readonly AccidentHotspotWarning[];
    }
  | {
      status: "ERROR";
      hotspots: readonly AccidentHotspot[];
      dataYear: null;
      fetchedAt: null;
      warnings: readonly AccidentHotspotWarning[];
    };

interface AccidentHotspotsPayload {
  source: "KOROAD_TAAS";
  dataYear: number;
  fetchedAt: string;
  hotspots: AccidentHotspot[];
  warnings: AccidentHotspotWarning[];
}

const LOADING_STATE: AccidentHotspotLoadState = {
  status: "LOADING",
  hotspots: [],
  dataYear: null,
  fetchedAt: null,
  warnings: [],
};

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isAccidentHotspot(value: unknown): value is AccidentHotspot {
  if (!value || typeof value !== "object") return false;
  const hotspot = value as Partial<AccidentHotspot>;

  return (
    typeof hotspot.id === "string" &&
    typeof hotspot.district === "string" &&
    typeof hotspot.name === "string" &&
    (hotspot.violationType === "SIGNAL_VIOLATION" ||
      hotspot.violationType === "CENTER_LINE_VIOLATION" ||
      hotspot.violationType === "GENERAL") &&
    isFiniteNumber(hotspot.latitude) &&
    isFiniteNumber(hotspot.longitude) &&
    isFiniteNumber(hotspot.occurrenceCount) &&
    isFiniteNumber(hotspot.casualtyCount) &&
    isFiniteNumber(hotspot.deathCount) &&
    isFiniteNumber(hotspot.seriousInjuryCount) &&
    isFiniteNumber(hotspot.minorInjuryCount) &&
    isFiniteNumber(hotspot.reportedInjuryCount) &&
    Array.isArray(hotspot.polygon) &&
    hotspot.polygon.every(
      (point) =>
        isFiniteNumber(point.latitude) && isFiniteNumber(point.longitude),
    ) &&
    isFiniteNumber(hotspot.dataYear) &&
    hotspot.source === "KOROAD_TAAS"
  );
}

function isAccidentHotspotWarning(
  value: unknown,
): value is AccidentHotspotWarning {
  if (!value || typeof value !== "object") return false;
  const warning = value as Partial<AccidentHotspotWarning>;

  return (
    (warning.code === "DISTRICT_UNAVAILABLE" ||
      warning.code === "INVALID_ROW" ||
      warning.code === "INVALID_COORDINATE" ||
      warning.code === "INVALID_POLYGON") &&
    typeof warning.district === "string" &&
    isFiniteNumber(warning.count) &&
    typeof warning.message === "string"
  );
}

function isAccidentHotspotsPayload(
  value: unknown,
): value is AccidentHotspotsPayload {
  if (!value || typeof value !== "object") return false;
  const payload = value as Partial<AccidentHotspotsPayload>;

  return (
    payload.source === "KOROAD_TAAS" &&
    isFiniteNumber(payload.dataYear) &&
    typeof payload.fetchedAt === "string" &&
    Array.isArray(payload.hotspots) &&
    payload.hotspots.every(isAccidentHotspot) &&
    Array.isArray(payload.warnings) &&
    payload.warnings.every(isAccidentHotspotWarning)
  );
}

export function useAccidentHotspots() {
  const [requestVersion, setRequestVersion] = useState(0);
  const [state, setState] =
    useState<AccidentHotspotLoadState>(LOADING_STATE);

  useEffect(() => {
    const controller = new AbortController();

    async function loadHotspots() {
      try {
        const response = await fetch("/api/traffic/hotspots", {
          signal: controller.signal,
        });
        const payload: unknown = await response.json();

        if (!response.ok || !isAccidentHotspotsPayload(payload)) {
          throw new Error("INVALID_ACCIDENT_HOTSPOTS_RESPONSE");
        }

        let status: "SUCCESS" | "EMPTY" | "PARTIAL" = "SUCCESS";
        if (payload.hotspots.length === 0) {
          status = "EMPTY";
        } else if (
          payload.warnings.some(
            (warning) => warning.code === "DISTRICT_UNAVAILABLE",
          )
        ) {
          status = "PARTIAL";
        }

        setState({
          status,
          hotspots: payload.hotspots,
          dataYear: payload.dataYear,
          fetchedAt: payload.fetchedAt,
          warnings: payload.warnings,
        });
      } catch {
        if (controller.signal.aborted) return;
        setState({
          status: "ERROR",
          hotspots: [],
          dataYear: null,
          fetchedAt: null,
          warnings: [],
        });
      }
    }

    void loadHotspots();
    return () => controller.abort();
  }, [requestVersion]);

  const retry = useCallback(() => {
    setState(LOADING_STATE);
    setRequestVersion((version) => version + 1);
  }, []);

  return { state, retry };
}
