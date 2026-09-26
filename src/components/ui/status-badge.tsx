import type { HTMLAttributes, ReactNode } from "react";
import type { UiTone } from "./primary-button";

export interface StatusBadgeProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  children: ReactNode;
  showDot?: boolean;
  tone?: UiTone;
}

export function StatusBadge({
  children,
  className,
  showDot = false,
  tone = "neutral",
  ...props
}: StatusBadgeProps) {
  const badgeClassName = [
    "ui-status-badge",
    `ui-status-badge--${tone}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span {...props} className={badgeClassName}>
      {showDot ? (
        <span className="ui-status-badge__dot" aria-hidden="true" />
      ) : null}
      <span className="ui-status-badge__label">{children}</span>
    </span>
  );
}

export default StatusBadge;
