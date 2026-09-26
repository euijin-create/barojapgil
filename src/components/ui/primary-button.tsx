import Link from "next/link";
import type {
  ComponentPropsWithoutRef,
  ReactNode,
} from "react";

export type UiTone = "blue" | "mint" | "orange" | "neutral";

type PrimaryButtonBaseProps = {
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  size?: "default" | "large";
  tone?: UiTone;
  trailingIcon?: ReactNode;
};

type PrimaryButtonElementProps = PrimaryButtonBaseProps &
  Omit<ComponentPropsWithoutRef<"button">, "children" | "className"> & {
    href?: never;
  };

type PrimaryButtonLinkProps = PrimaryButtonBaseProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, "children" | "className"> & {
    href: ComponentPropsWithoutRef<typeof Link>["href"];
  };

export type PrimaryButtonProps =
  | PrimaryButtonElementProps
  | PrimaryButtonLinkProps;

function getClassName({
  tone,
  size,
  fullWidth,
  className,
}: Required<Pick<PrimaryButtonBaseProps, "tone" | "size" | "fullWidth">> &
  Pick<PrimaryButtonBaseProps, "className">) {
  return [
    "ui-primary-button",
    `ui-primary-button--${tone}`,
    `ui-primary-button--${size}`,
    fullWidth ? "ui-primary-button--full-width" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

function ButtonContent({
  children,
  leadingIcon,
  trailingIcon,
}: Pick<
  PrimaryButtonBaseProps,
  "children" | "leadingIcon" | "trailingIcon"
>) {
  return (
    <>
      {leadingIcon ? (
        <span className="ui-primary-button__icon" aria-hidden="true">
          {leadingIcon}
        </span>
      ) : null}
      <span className="ui-primary-button__label">{children}</span>
      {trailingIcon ? (
        <span className="ui-primary-button__icon" aria-hidden="true">
          {trailingIcon}
        </span>
      ) : null}
    </>
  );
}

export function PrimaryButton(props: PrimaryButtonProps) {
  const {
    children,
    className,
    fullWidth = false,
    leadingIcon,
    size = "large",
    tone = "blue",
    trailingIcon,
    ...elementProps
  } = props;
  const buttonClassName = getClassName({
    tone,
    size,
    fullWidth,
    className,
  });
  const content = (
    <ButtonContent leadingIcon={leadingIcon} trailingIcon={trailingIcon}>
      {children}
    </ButtonContent>
  );

  if ("href" in elementProps && elementProps.href !== undefined) {
    return (
      <Link {...elementProps} className={buttonClassName}>
        {content}
      </Link>
    );
  }

  return (
    <button {...elementProps} className={buttonClassName}>
      {content}
    </button>
  );
}

export default PrimaryButton;
