import Image from "next/image";

type BrandLogoProps = {
  className?: string;
  decorative?: boolean;
  preload?: boolean;
  variant?: "full" | "icon";
};

const logoByVariant = {
  full: {
    src: "/brand/logo-full.png",
    width: 1200,
    height: 399,
  },
  icon: {
    src: "/brand/logo-icon.png",
    width: 512,
    height: 512,
  },
} as const;

export function BrandLogo({
  className,
  decorative = false,
  preload = false,
  variant = "full",
}: BrandLogoProps) {
  const logo = logoByVariant[variant];

  return (
    <Image
      src={logo.src}
      width={logo.width}
      height={logo.height}
      alt={decorative ? "" : "바로잡길"}
      className={className}
      preload={preload}
      sizes={variant === "full" ? "112px" : "48px"}
    />
  );
}

