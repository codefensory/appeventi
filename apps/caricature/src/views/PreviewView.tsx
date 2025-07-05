import { Button } from "../components/Button";
import { ImageCard } from "../components/ImageCard";
import useViewStore from "../lib/view-manager/view-manager-store";

export const PreviewView = () => {
  const setView = useViewStore((store) => store.setView);

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex flex-col items-center gap-8">
      <img src="logo.png" alt="logo" className="w-72 mb-8" />
      <div className="mt-4">
        <ImageCard src="ready.png" className="w-[400px] h-[400px]" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-3xl font-black text-center text-gray-800">¡Prepárate!</h2>
        <p className="text-lg text-center text-gray-700">Por favor solo una persona a la vez</p>
        <span className="text-sm text-gray-500">(Es solo un robot)</span>
      </div>
      <div className="flex flex-row gap-8 mt-4">
        <Button className="text-xl" variant="outline" onClick={() => setView("home")}>Cancelar</Button>
        <Button animated className="text-xl" onClick={() => setView("camera")}>Siguiente</Button>
      </div>
    </div>
  );
};
