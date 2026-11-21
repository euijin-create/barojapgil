import "server-only";

export type SeoulIncidentErrorCode =
  | "SERVICE_NOT_CONFIGURED"
  | "UPSTREAM_AUTHENTICATION_FAILED"
  | "UPSTREAM_UNAVAILABLE"
  | "INVALID_UPSTREAM_RESPONSE";

export class SeoulIncidentError extends Error {
  readonly code: SeoulIncidentErrorCode;
  readonly upstreamCode?: string;

  constructor(
    code: SeoulIncidentErrorCode,
    message: string,
    options?: { upstreamCode?: string; cause?: unknown },
  ) {
    super(
      message,
      options?.cause === undefined ? undefined : { cause: options.cause },
    );
    this.name = "SeoulIncidentError";
    this.code = code;
    this.upstreamCode = options?.upstreamCode;
  }
}
