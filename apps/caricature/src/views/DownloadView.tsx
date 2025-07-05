import useViewStore from "../lib/view-manager/view-manager-store";
import QRCode from "react-qr-code";
import { CircularButton } from "../components/Button";
import { useEffect, useState } from "react";

const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export const DownloadView = () => {
  const selectedImage =
    useViewStore((s) => s.selectedImage) ??
    (() => {
      // Si no hay imagen seleccionada, usa una imagen random de internet
      const ejemplos = [
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
        "https://images.unsplash.com/photo-1519125323398-675f0ddb6308",
        "https://images.unsplash.com/photo-1465101046530-73398c7f28ca",
      ];
      return ejemplos[Math.floor(Math.random() * ejemplos.length)];
    })();
  const setView = useViewStore((s) => s.setView);

  const [cloudinaryUrl, setCloudinaryUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const uploadToCloudinary = async () => {
      setLoading(true);
      setError(null);
      try {
        // Si la imagen ya es una URL remota, no la subas
        if (selectedImage.startsWith("http")) {
          setCloudinaryUrl(selectedImage);
          setLoading(false);
          return;
        }
        const formData = new FormData();
        formData.append("file", selectedImage);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
        const res = await fetch(CLOUDINARY_API, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (isMounted) {
          if (data.secure_url) {
            setCloudinaryUrl(data.secure_url);
          } else {
            setError("Error subiendo la imagen a Cloudinary");
          }
          setLoading(false);
        }
      } catch (e) {
        if (isMounted) {
          setError("Error subiendo la imagen a Cloudinary");
          setLoading(false);
        }
      }
    };
    uploadToCloudinary();
    return () => {
      isMounted = false;
    };
  }, [selectedImage]);

  const qrValue = cloudinaryUrl;

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex flex-col items-center justify-center gap-8">
      {loading ? (
        <div className="flex flex-col items-center gap-4 mt-8">
          <div className="w-24 h-24 border-8 border-red-200 border-t-red-500 rounded-full animate-spin" />
          <span className="text-lg font-bold text-gray-600 animate-pulse">
            Preparando tu caricatura...
          </span>
        </div>
      ) : error ? (
        <div className="text-red-600 font-bold">{error}</div>
      ) : (
        <>
          <h2 className="text-4xl font-black text-center text-gray-800 mb-2">
            Descarga tu caricatura
          </h2>
          <div className="relative flex items-center justify-center">
            <img
              src={selectedImage}
              alt="Caricatura seleccionada"
              className="w-96 h-96 object-cover rounded-3xl border-8 border-red-400 shadow-2xl transition-all duration-300"
              style={{
                boxShadow:
                  "0 8px 40px 0 rgba(239,68,68,0.25), 0 1.5px 8px 0 rgba(0,0,0,0.10)",
              }}
            />
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-red-500 text-white text-xs px-3 py-1 rounded-full shadow font-bold opacity-90">
              Tu caricatura
            </span>
          </div>
          <div className="flex flex-col items-center gap-3 mt-2">
            <span className="text-lg font-bold text-gray-700 mb-1">
              Escanea el QR para descargar
            </span>
            <div className="bg-white p-3 rounded-xl shadow-lg border border-red-200">
              <QRCode
                value={qrValue ?? ""}
                size={140}
                bgColor="#fff"
                fgColor="#ef4444"
                title="Código QR para descargar la caricatura"
              />
            </div>
          </div>
          <CircularButton
            variant="default"
            className="text-xl mt-2"
            size="lg"
            onClick={() => setView("home")}
            disabled={loading}
          >
            Finalizar
          </CircularButton>
        </>
      )}
    </div>
  );
};
