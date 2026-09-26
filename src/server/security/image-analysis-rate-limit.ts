import "server-only";

import { createHash } from "node:crypto";

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 10;
const MAX_TRACKED_CLIENTS = 1_000;

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

// 단일 인스턴스의 기본 방어선이다. 운영 배포 전에는 호스트 또는 공유 저장소 기반
// 속도 제한을 함께 적용해야 여러 서버 인스턴스에서도 동일한 한도를 보장할 수 있다.
const buckets = new Map<string, RateLimitBucket>();

function clientFingerprint(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address = forwardedFor || request.headers.get("x-real-ip") || "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";

  // 원문 IP나 User-Agent를 보관하지 않고 현재 프로세스의 단기 제한 키로만 사용한다.
  return createHash("sha256").update(`${address}|${userAgent}`).digest("hex");
}

function removeExpiredBuckets(now: number) {
  if (buckets.size < MAX_TRACKED_CLIENTS) return;

  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }

  if (buckets.size >= MAX_TRACKED_CLIENTS) {
    const oldestKey = buckets.keys().next().value;
    if (oldestKey) buckets.delete(oldestKey);
  }
}

export function consumeImageAnalysisRateLimit(request: Request) {
  const now = Date.now();
  removeExpiredBuckets(now);

  const key = clientFingerprint(request);
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterSeconds: 0 } as const;
  }

  if (current.count >= MAX_REQUESTS_PER_WINDOW) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    } as const;
  }

  current.count += 1;
  return { allowed: true, retryAfterSeconds: 0 } as const;
}
