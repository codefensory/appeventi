import { Button } from "../components/Button";
import { ImageCarousel } from "../components/Carousel";
import useViewStore from "../lib/view-manager/view-manager-store";

export const HomeView = () => {
  const setView = useViewStore((store) => store.setView);

  return (
    <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex items-center flex-col gap-12">
      <img src="logo.png" alt="logo" className="w-72 mb-8" />
      <ImageCarousel className="w-full" />
      <h2 className="text-4xl text-center text-gray-800 mt-6">
        Toca la pantalla y <br />
        <span className="inline-block animate-pulse bg-gradient-to-r from-red-500 via-yellow-500 to-purple-500 bg-clip-text text-transparent font-black text-5xl">
          Crea tu caricatura
        </span>
      </h2>
      <Button animated className="text-xl mt-6" onClick={() => setView("preview")}>Iniciar</Button>
    </div>
  );
};
