import useViewStore from "../lib/view-manager/view-manager-store";
import QRCode from "react-qr-code";
import { Button } from "../components/Button";
import { useEffect, useState } from "react";
import { BrandLogo } from "../components/BrandLogo";
import { getAppConfig } from "../lib/apps";

const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export const DownloadView = () => {
  const storedSelectedImage = useViewStore((s) => s.selectedImage);
  const selectedImage =
    storedSelectedImage ??
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
  const clearContactFormData = useViewStore((s) => s.clearContactFormData);
  const activeApp = useViewStore((s) => s.activeApp);
  const app = getAppConfig(activeApp);

  const [cloudinaryUrl, setCloudinaryUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const processAndUpload = async () => {
      setLoading(true);
      setError(null);
      try {
        // Solo evitamos procesar la imagen de ejemplo. Las URLs devueltas por
        // la función sí deben pasar por el marco y el logo final.
        if (!storedSelectedImage && selectedImage.startsWith("http")) {
          setCloudinaryUrl(selectedImage);
          setPreviewUrl(selectedImage);
          setLoading(false);
          return;
        }

        // 1. Cargar imagen original (caricatura)
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const image = new window.Image();
          image.crossOrigin = "anonymous";
          image.onload = () => resolve(image);
          image.onerror = reject;
          image.src = selectedImage;
        });

        // 2. Cargar el marco y el logo de la aplicación seleccionada.
        const [frame, logo] = await Promise.all([
          new Promise<HTMLImageElement>((resolve, reject) => {
            const image = new window.Image();
            image.onload = () => resolve(image);
            image.onerror = reject;
            image.src = "/frame.png";
          }),
          new Promise<HTMLImageElement>((resolve, reject) => {
            const image = new window.Image();
            image.onload = () => resolve(image);
            image.onerror = reject;
            image.src = app.logoSrc;
          }),
        ]);

        // 3. Crear canvas del tamaño del marco
        const canvas = document.createElement("canvas");
        canvas.width = frame.width;
        canvas.height = frame.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("No se pudo crear el contexto del canvas");

        // 4. Dibujar el marco como fondo
        ctx.drawImage(frame, 0, 0, frame.width, frame.height);

        // 5. Dibujar la imagen generada con las esquinas redondeadas.
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(40, 25, 1084, 1084, 32);
        ctx.clip();
        ctx.drawImage(img, 40, 25, 1084, 1084);
        ctx.restore();

        // 6. Reemplazar la identidad fija del marco por la de la app activa.
        // El área inferior del marco está reservada para el logo y el mensaje.
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 1110, canvas.width, canvas.height - 1110);

        const maxLogoWidth = 310;
        const maxLogoHeight = 80;
        const logoScale = Math.min(
          maxLogoWidth / logo.width,
          maxLogoHeight / logo.height,
        );
        const logoWidth = logo.width * logoScale;
        const logoHeight = logo.height * logoScale;
        ctx.drawImage(
          logo,
          80,
          1170 + (maxLogoHeight - logoHeight) / 2,
          logoWidth,
          logoHeight,
        );

        ctx.fillStyle = "#000000";
        ctx.font = "700 36px Comfortaa, Arial, sans-serif";
        ctx.textAlign = "right";
        app.photoMessage.forEach((line, index) => {
          ctx.fillText(line, 1080, 1200 + index * 42);
        });

        // 7. Guardar preview del canvas
        const dataUrl = canvas.toDataURL("image/png");
        if (isMounted) setPreviewUrl(dataUrl);

        // 8. Convertir canvas a blob
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/png"),
        );
        if (!blob) throw new Error("No se pudo convertir el canvas a imagen");

        // 9. Subir a Cloudinary
        const formData = new FormData();
        formData.append("file", blob, "caricatura.png");
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
      } catch {
        if (isMounted) {
          setError("Error procesando o subiendo la imagen");
          setLoading(false);
        }
      }
    };
    processAndUpload();
    return () => {
      isMounted = false;
    };
  }, [selectedImage, app]);

  const qrValue = cloudinaryUrl;

  return (
    <div className="screen-content download-content">
      {loading ? (
        <div className="download-loading">
          <div className="download-spinner" />
          <span>Preparando tu caricatura...</span>
        </div>
      ) : error ? (
        <div className="download-error">{error}</div>
      ) : (
        <>
          <BrandLogo />
          <div className="download-image-wrap">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Caricatura generada"
                className="download-image"
              />
            ) : (
              <div className="download-image-placeholder">
                <span>Cargando preview...</span>
              </div>
            )}
          </div>
          <div className="download-copy">
            <h2>¡Te ves super!</h2>
            <span>Escanea el QR para descargar</span>
            <div className="download-qr">
              <QRCode
                value={qrValue ?? ""}
                size={140}
                bgColor="#fff"
                fgColor="#000000"
                title="Código QR para descargar la caricatura"
              />
            </div>
          </div>
          <Button
            className="download-button"
            onClick={() => {
              clearContactFormData();
              setView("home");
            }}
            disabled={loading}
          >
            Finalizar
          </Button>
        </>
      )}
    </div>
  );
};
