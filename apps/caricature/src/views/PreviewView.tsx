import { Button } from "../components/Button";
import { ImageCard } from "../components/ImageCard";
import { BrandLogo } from "../components/BrandLogo";
import useViewStore from "../lib/view-manager/view-manager-store";

export const PreviewView = () => {
  const setView = useViewStore((store) => store.setView);

  return (
    <div className="screen-content preview-content">
      <BrandLogo />
      <div className="preview-card-wrap">
        <ImageCard src="ready.png" className="preview-card" />
      </div>
      <div className="preview-copy">
        <h2>¡Prepárate!</h2>
        <p>Por favor solo una persona a la vez</p>
        <span>(Es solo un robot)</span>
      </div>
      <div className="preview-actions">
        <Button
          variant="outline"
          className="cancel-button"
          onClick={() => setView("home")}
        >
          Cancelar
        </Button>
        <Button animated onClick={() => setView("camera")}>
          Siguiente
        </Button>
      </div>
    </div>
  );
};
