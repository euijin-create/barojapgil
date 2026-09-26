import type { HTMLAttributes, ReactNode } from "react";
import type { UiTone } from "./primary-button";

export interface SectionLabelProps
  extends Omit<HTMLAttributes<HTMLParagraphElement>, "children"> {
  children: ReactNode;
  icon?: ReactNode;
  tone?: UiTone;
}

export function SectionLabel({
  children,
  className,
  icon,
  tone = "blue",
  ...props
}: SectionLabelProps) {
  const labelClassName = [
    "ui-section-label",
    `ui-section-label--${tone}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <p {...props} className={labelClassName}>
      {icon ? (
        <span className="ui-section-label__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className="ui-section-label__text">{children}</span>
    </p>
  );
}

export default SectionLabel;
