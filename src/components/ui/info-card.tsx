import type { HTMLAttributes, ReactNode } from "react";
import type { UiTone } from "./primary-button";

export interface InfoCardProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "title"> {
  children: ReactNode;
  icon?: ReactNode;
  title?: ReactNode;
  tone?: UiTone;
}

export function InfoCard({
  children,
  className,
  icon,
  title,
  tone = "neutral",
  ...props
}: InfoCardProps) {
  const cardClassName = [
    "ui-info-card",
    `ui-info-card--${tone}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div {...props} className={cardClassName}>
      {icon ? (
        <div className="ui-info-card__icon" aria-hidden="true">
          {icon}
        </div>
      ) : null}
      <div className="ui-info-card__body">
        {title ? <p className="ui-info-card__title">{title}</p> : null}
        <div className="ui-info-card__content">{children}</div>
      </div>
    </div>
  );
}

export default InfoCard;
