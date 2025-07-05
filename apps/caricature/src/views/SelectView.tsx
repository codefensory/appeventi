import { useState } from "react";
import useViewStore from "../lib/view-manager/view-manager-store";
import { ImageCard } from "../components/ImageCard";
import { Button } from "../components/Button";

export const SelectView = () => {
  const generatedImages = useViewStore((s) => s.generatedImages);
  const setSelectedImage = useViewStore((s) => s.setSelectedImage);
  const setView = useViewStore((s) => s.setView);

  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const handleSelect = (index: number) => setSelectedIdx(index);

  const handleNext = () => {
    if (selectedIdx !== null && generatedImages[selectedIdx]) {
      setSelectedImage(generatedImages[selectedIdx]);
      setView("download");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 px-6">
      <img src="logo.png" alt="logo" className="w-72 mb-8" />
      <div className="flex flex-row gap-2">
        {generatedImages.map((image, index) => (
          <ImageCard 
            key={index}
            src={image} 
            selected={selectedIdx === index} 
            onClick={() => handleSelect(index)} 
          />
        ))}
      </div>
      <div className="text-center mt-8">
        <h2 className="text-3xl font-black">¡TADA!</h2>
        <p className="text-xl font-bold mt-2">Tu caricatura está lista</p>
        <p className="text-md mt-1">Selecciona tu favorita</p>
      </div>
      <Button
        className="mt-8 text-xl"
        disabled={selectedIdx === null}
        onClick={handleNext}
        animated
      >
        Siguiente
      </Button>
    </div>
  );
};
