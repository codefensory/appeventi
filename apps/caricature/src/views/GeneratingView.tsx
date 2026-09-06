import { useEffect, useState } from "react";
import useViewStore from "../lib/view-manager/view-manager-store";
import { BrandLogo } from "../components/BrandLogo";

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
    <div className="screen-content generating-content">
      <BrandLogo />
      <div className="generating-visual">
        <video
          src="pepe.mp4"
          className="generating-video"
          autoPlay
          loop
          muted
          playsInline
        />
        <svg
          viewBox="0 0 450 450"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle
            cx="225"
            cy="225"
            r="215"
            stroke="#000000"
            strokeWidth="4"
            strokeDasharray="1200 180"
            strokeDashoffset="0"
            strokeLinecap="round"
            transform="rotate(107 225 225)"
          />
        </svg>
      </div>
      <div className="generating-progress">
        <div style={{ width: `${progress}%` }} />
      </div>
      <div className="generating-copy">
        {error ? (
          <>
            <h2 className="generating-error-title">¡Ups! Hubo un error</h2>
            <p>{error}</p>
          </>
        ) : (
          <>
            <h2>Solo un momento</h2>
            <p>Mientras nuestro artista te dibuja</p>
          </>
        )}
      </div>
    </div>
  );
};
