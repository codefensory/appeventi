import { Button } from "../components/Button";
import { ImageCarousel } from "../components/Carousel";
import { BrandLogo } from "../components/BrandLogo";
import useViewStore from "../lib/view-manager/view-manager-store";

export const HomeView = () => {
  const setView = useViewStore((store) => store.setView);
  const clearExperience = useViewStore((store) => store.clearExperience);

  return (
    <div className="screen-content home-content">
      <BrandLogo />
      <ImageCarousel />
      <h2 className="home-title">
        Toca la pantalla y <br />
        <span className="home-title-highlight">Crea tu caricatura</span>
      </h2>
      <Button
        animated
        className="home-button"
        onClick={() => {
          clearExperience();
          setView("preview");
        }}
      >
        Iniciar
      </Button>
    </div>
  );
};
