export interface OccurredAtParts {
  date: string;
  time: string;
}

function isValidDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isValidTime(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return false;

  return Number(match[1]) <= 23 && Number(match[2]) <= 59;
}

/**
 * AI 후보는 자유 문자열일 수 있으므로 명시적인 ISO 형태만 입력 기본값으로
 * 사용한다. 해석할 수 없는 값은 추측하지 않고 빈 입력으로 둔다.
 */
export function splitOccurredAt(value: string): OccurredAtParts {
  const normalized = value.trim();
  const dateTimeMatch =
    /^(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2})(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?$/.exec(
      normalized,
    );

  if (
    dateTimeMatch &&
    isValidDate(dateTimeMatch[1]) &&
    isValidTime(dateTimeMatch[2])
  ) {
    return { date: dateTimeMatch[1], time: dateTimeMatch[2] };
  }

  if (isValidDate(normalized)) return { date: normalized, time: "" };

  const time = normalized.startsWith("T") ? normalized.slice(1) : normalized;
  if (isValidTime(time)) return { date: "", time };

  return { date: "", time: "" };
}

export function combineOccurredAt({ date, time }: OccurredAtParts) {
  if (date && time) return `${date}T${time}`;
  return date || time;
}

export function formatOccurredAtForStatement(value: string) {
  const { date, time } = splitOccurredAt(value);
  if (!date || !time) return null;

  const [, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const year = Number(date.slice(0, 4));

  return `${year}년 ${month}월 ${day}일 ${hour}시 ${String(minute).padStart(2, "0")}분경`;
}
