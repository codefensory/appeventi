import useViewStore from "../lib/view-manager/view-manager-store";
import { getAppConfig } from "../lib/apps";

interface BrandLogoProps {
  className?: string;
}

export const BrandLogo = ({ className = "" }: BrandLogoProps) => {
  const activeApp = useViewStore((store) => store.activeApp);
  const app = getAppConfig(activeApp);

  return (
    <img
      src={app.logoSrc}
      alt={app.label}
      className={`brand-logo${className ? ` ${className}` : ""}`}
    />
  );
};
