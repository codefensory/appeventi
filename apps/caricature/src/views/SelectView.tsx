import { useState } from "react";
import useViewStore from "../lib/view-manager/view-manager-store";
import { ImageCard } from "../components/ImageCard";
import { Button } from "../components/Button";
import { BrandLogo } from "../components/BrandLogo";

export const SelectView = () => {
  const generatedImages = useViewStore((s) => s.generatedImages);
  const setSelectedImage = useViewStore((s) => s.setSelectedImage);
  const setView = useViewStore((s) => s.setView);

  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const handleSelect = (index: number) => setSelectedIdx(index);

  const handleNext = () => {
    if (selectedIdx !== null && generatedImages[selectedIdx]) {
      setSelectedImage(generatedImages[selectedIdx]);
      setView("form");
    }
  };

  return (
    <div className="screen-content select-content">
      <BrandLogo />
      <div className="select-results">
        {generatedImages.map((image, index) => (
          <ImageCard
            key={index}
            src={image}
            className="select-card"
            selected={selectedIdx === index}
            onClick={() => handleSelect(index)}
          />
        ))}
      </div>
      <div className="select-copy preview-copy">
        <h2>¡TADA!</h2>
        <p>Tu caricatura está lista</p>
        <small>Selecciona tu favorita</small>
      </div>
      <Button
        className="select-button"
        disabled={selectedIdx === null}
        onClick={handleNext}
        animated
      >
        Siguiente
      </Button>
    </div>
  );
};
