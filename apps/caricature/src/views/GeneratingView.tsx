import { useEffect, useState } from "react";
import useViewStore from "../lib/view-manager/view-manager-store";

export const GeneratingView = () => {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const capturedImage = useViewStore((store) => store.capturedImage);
  const setGeneratedImages = useViewStore((store) => store.setGeneratedImages);
  const setView = useViewStore((store) => store.setView);

  useEffect(() => {
    if (progress < 100 && !error) {
      const timer = setTimeout(() => setProgress(progress + 1), 300);
      return () => clearTimeout(timer);
    }
  }, [progress, error]);

  useEffect(() => {
    if (error) {
      // Si hay error, volver a "home" después de 2 segundos
      const timer = setTimeout(() => {
        setView("home");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [error, setView]);

  useEffect(() => {
    if (!capturedImage) return;

    (async () => {
      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: capturedImage }),
        });
        const data = await response.json();

        if (!response.ok || !Array.isArray(data.images) || data.images.length !== 2) {
          throw new Error(data.error ?? "Respuesta inválida");
        }

        setGeneratedImages(data.images);
        setView("select");
      } catch (error) {
        console.error("Error generando imágenes:", error);
        setError("Error generando las imágenes. Volverás al inicio en unos segundos.");
      }
    })();
  }, [capturedImage, setGeneratedImages, setView]);

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex flex-col items-center gap-8">
      <img
      src="/logo.png"
      alt="Santa Clara Camiones"
      className="brand-logo"
    />
      <div className="mt-4">
        <div className="relative flex items-center justify-center w-[450px] h-[450px] rounded-full overflow-hiddenimgCard">
          <video
            src="pepe.mp4"
            className="w-[calc(100%-20px)] h-[calc(100%-20px)] object-cover"
            autoPlay
            loop
            muted
            playsInline
            style={{ borderRadius: '50%' }}
          />
          {/* SVG para el borde circular con gap */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 450 450"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="225"
              cy="225"
              r="215"
              stroke="#FF0000"
              strokeWidth="4"
              strokeDasharray="1200 180"
              strokeDashoffset="0"
              stroke-linecap="round"
              transform="rotate(107 225 225)"
            />
          </svg>
        </div>
      </div>
      <div className="w-[320px] h-2 rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-200"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="flex flex-col items-center gap-2 mt-2">
        {error ? (
          <>
            <h2 className="text-2xl font-black text-center text-red-600">¡Ups! Hubo un error</h2>
            <p className="text-lg text-center text-gray-700">{error}</p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-black text-center text-black">Solo un momento</h2>
            <p className="text-lg text-center text-gray-700">Mientras nuestro artista te dibuja</p>
          </>
        )}
      </div>
    </div>
  );
};
