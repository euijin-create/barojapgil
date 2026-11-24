import "server-only";

export type TaasHotspotErrorCode =
  | "SERVICE_NOT_CONFIGURED"
  | "UPSTREAM_AUTHENTICATION_FAILED"
  | "UPSTREAM_RATE_LIMITED"
  | "UPSTREAM_UNAVAILABLE"
  | "INVALID_UPSTREAM_RESPONSE";

export class TaasHotspotError extends Error {
  readonly code: TaasHotspotErrorCode;
  readonly upstreamCode?: string;
  readonly district?: string;

  constructor(
    code: TaasHotspotErrorCode,
    message: string,
    options?: {
      upstreamCode?: string;
      district?: string;
      cause?: unknown;
    },
  ) {
    super(
      message,
      options?.cause === undefined ? undefined : { cause: options.cause },
    );
    this.name = "TaasHotspotError";
    this.code = code;
    this.upstreamCode = options?.upstreamCode;
    this.district = options?.district;
  }
}
