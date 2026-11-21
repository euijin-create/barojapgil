import type {
  TrafficIncidentsErrorResponse,
  TrafficIncidentsPublicErrorCode,
} from "@/contracts/traffic-incidents";
import { getSeoulTrafficIncidents } from "@/infrastructure/traffic/seoul-incident-client";
import { SeoulIncidentError } from "@/infrastructure/traffic/seoul-incident-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUCCESS_CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=180, stale-while-revalidate=60",
};

const ERROR_CACHE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
};

function errorResponse(
  code: TrafficIncidentsPublicErrorCode,
  message: string,
  status: number,
) {
  const body: TrafficIncidentsErrorResponse = { error: { code, message } };
  return Response.json(body, { status, headers: ERROR_CACHE_HEADERS });
}

function logServerError(requestId: string, error: unknown) {
  if (error instanceof SeoulIncidentError) {
    console.error("[traffic-incidents] provider error", {
      requestId,
      code: error.code,
      upstreamCode: error.upstreamCode,
    });
    return;
  }

  console.error("[traffic-incidents] unexpected error", {
    requestId,
    errorType: error instanceof Error ? error.name : "UnknownError",
  });
}

export async function GET() {
  const requestId = crypto.randomUUID();

  try {
    const result = await getSeoulTrafficIncidents();
    return Response.json(result, { headers: SUCCESS_CACHE_HEADERS });
  } catch (error) {
    logServerError(requestId, error);

    if (error instanceof SeoulIncidentError) {
      if (
        error.code === "SERVICE_NOT_CONFIGURED" ||
        error.code === "UPSTREAM_AUTHENTICATION_FAILED"
      ) {
        return errorResponse(
          "SERVICE_CONFIGURATION_ERROR",
          "서울 실시간 돌발정보 연결 설정을 확인해주세요.",
          503,
        );
      }

      if (error.code === "INVALID_UPSTREAM_RESPONSE") {
        return errorResponse(
          "INVALID_UPSTREAM_RESPONSE",
          "서울 실시간 돌발정보 응답을 확인할 수 없습니다.",
          502,
        );
      }

      return errorResponse(
        "TRAFFIC_INCIDENTS_UNAVAILABLE",
        "서울 실시간 돌발정보를 불러오지 못했습니다.",
        502,
      );
    }

    return errorResponse(
      "INTERNAL_SERVER_ERROR",
      "서울 실시간 돌발정보를 처리하지 못했습니다.",
      500,
    );
  }
}
