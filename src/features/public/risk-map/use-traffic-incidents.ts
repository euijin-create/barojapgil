"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  TrafficIncident,
  TrafficIncidentsResponse,
} from "@/contracts/traffic-incidents";

export type TrafficIncidentLoadState =
  | {
      status: "LOADING";
      incidents: readonly TrafficIncident[];
      fetchedAt: null;
    }
  | {
      status: "SUCCESS";
      incidents: readonly TrafficIncident[];
      fetchedAt: string;
    }
  | {
      status: "EMPTY";
      incidents: readonly TrafficIncident[];
      fetchedAt: string;
    }
  | {
      status: "ERROR";
      incidents: readonly TrafficIncident[];
      fetchedAt: null;
    };

const LOADING_STATE: TrafficIncidentLoadState = {
  status: "LOADING",
  incidents: [],
  fetchedAt: null,
};

function isTrafficIncident(value: unknown): value is TrafficIncident {
  if (!value || typeof value !== "object") return false;
  const incident = value as Partial<TrafficIncident>;

  return (
    typeof incident.id === "string" &&
    typeof incident.category === "string" &&
    typeof incident.categoryKind === "string" &&
    typeof incident.description === "string" &&
    typeof incident.latitude === "number" &&
    Number.isFinite(incident.latitude) &&
    typeof incident.longitude === "number" &&
    Number.isFinite(incident.longitude) &&
    incident.source === "SEOUL_TOPIS"
  );
}

function isTrafficIncidentsResponse(
  value: unknown,
): value is TrafficIncidentsResponse {
  if (!value || typeof value !== "object") return false;
  const response = value as Partial<TrafficIncidentsResponse>;

  return (
    response.source === "SEOUL_TOPIS" &&
    typeof response.fetchedAt === "string" &&
    Array.isArray(response.incidents) &&
    response.incidents.every(isTrafficIncident)
  );
}

export function useTrafficIncidents() {
  const [requestVersion, setRequestVersion] = useState(0);
  const [state, setState] =
    useState<TrafficIncidentLoadState>(LOADING_STATE);

  useEffect(() => {
    const controller = new AbortController();

    async function loadIncidents() {
      try {
        const response = await fetch("/api/traffic/incidents", {
          signal: controller.signal,
        });
        const payload: unknown = await response.json();

        if (!response.ok || !isTrafficIncidentsResponse(payload)) {
          throw new Error("INVALID_TRAFFIC_INCIDENT_RESPONSE");
        }

        setState({
          status: payload.incidents.length === 0 ? "EMPTY" : "SUCCESS",
          incidents: payload.incidents,
          fetchedAt: payload.fetchedAt,
        });
      } catch {
        if (controller.signal.aborted) return;
        setState({
          status: "ERROR",
          incidents: [],
          fetchedAt: null,
        });
      }
    }

    void loadIncidents();
    return () => controller.abort();
  }, [requestVersion]);

  const retry = useCallback(() => {
    setState(LOADING_STATE);
    setRequestVersion((version) => version + 1);
  }, []);

  return { state, retry };
}
