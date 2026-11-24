import type {
  AccidentHotspotsErrorResponse,
  AccidentHotspotsPublicErrorCode,
} from "@/contracts/accident-hotspots";
import { getSeoulAccidentHotspots } from "@/infrastructure/traffic/taas-hotspot-client";
import {
  TAAS_HOTSPOT_CACHE_TTL_SECONDS,
  TAAS_HOTSPOT_PARTIAL_CACHE_TTL_SECONDS,
} from "@/infrastructure/traffic/taas-hotspot-config";
import { TaasHotspotError } from "@/infrastructure/traffic/taas-hotspot-error";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUCCESS_CACHE_HEADERS = {
  "Cache-Control": `public, s-maxage=${TAAS_HOTSPOT_CACHE_TTL_SECONDS}, stale-while-revalidate=3600`,
};

const PARTIAL_CACHE_HEADERS = {
  "Cache-Control": `public, s-maxage=${TAAS_HOTSPOT_PARTIAL_CACHE_TTL_SECONDS}, stale-while-revalidate=60`,
};

const ERROR_CACHE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
};

function errorResponse(
  code: AccidentHotspotsPublicErrorCode,
  message: string,
  status: number,
) {
  const body: AccidentHotspotsErrorResponse = { error: { code, message } };
  return Response.json(body, { status, headers: ERROR_CACHE_HEADERS });
}

function logServerError(requestId: string, error: unknown) {
  if (error instanceof TaasHotspotError) {
    console.error("[traffic-hotspots] provider error", {
      requestId,
      code: error.code,
      upstreamCode: error.upstreamCode,
      district: error.district,
    });
    return;
  }

  console.error("[traffic-hotspots] unexpected error", {
    requestId,
    errorType: error instanceof Error ? error.name : "UnknownError",
  });
}

export async function GET() {
  const requestId = crypto.randomUUID();

  try {
    const result = await getSeoulAccidentHotspots();
    const isPartial = result.warnings.some(
      (warning) => warning.code === "DISTRICT_UNAVAILABLE",
    );
    return Response.json(result, {
      headers: isPartial ? PARTIAL_CACHE_HEADERS : SUCCESS_CACHE_HEADERS,
    });
  } catch (error) {
    logServerError(requestId, error);

    if (error instanceof TaasHotspotError) {
      if (
        error.code === "SERVICE_NOT_CONFIGURED" ||
        error.code === "UPSTREAM_AUTHENTICATION_FAILED"
      ) {
        return errorResponse(
          "SERVICE_CONFIGURATION_ERROR",
          "TAAS 사고다발지역 연결 설정을 확인해주세요.",
          503,
        );
      }

      if (error.code === "INVALID_UPSTREAM_RESPONSE") {
        return errorResponse(
          "INVALID_UPSTREAM_RESPONSE",
          "TAAS 사고다발지역 응답을 확인할 수 없습니다.",
          502,
        );
      }

      return errorResponse(
        "ACCIDENT_HOTSPOTS_UNAVAILABLE",
        "사고다발지역 정보를 불러오지 못했습니다.",
        502,
      );
    }

    return errorResponse(
      "INTERNAL_SERVER_ERROR",
      "사고다발지역 정보를 처리하지 못했습니다.",
      500,
    );
  }
}
