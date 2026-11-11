import { APP } from "../lib/apps";

interface BrandLogoProps {
  className?: string;
}

export const BrandLogo = ({ className = "" }: BrandLogoProps) => (
  <img
    src={APP.logoSrc}
    alt={APP.label}
    className={`brand-logo${className ? ` ${className}` : ""}`}
  />
);
