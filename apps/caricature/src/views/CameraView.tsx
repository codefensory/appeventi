import { useEffect, useRef, useState } from "react";
import useViewStore from "../lib/view-manager/view-manager-store";
import { Button } from "../components/Button";
import { BrandLogo } from "../components/BrandLogo";

export const CameraView = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showFlash, setShowFlash] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const setView = useViewStore((store) => store.setView);
  const setCapturedImage = useViewStore((store) => store.setCapturedImage);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((mediaStream) => {
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      })
      .catch(() => {
        alert("No se pudo acceder a la cámara");
      });
    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
    // eslint-disable-next-line
  }, []);

  const startCountdown = () => {
    setIsCapturing(true);
    setCountdown(3);

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownInterval);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    setTimeout(() => {
      setShowFlash(true);

      if (!videoRef.current || !canvasRef.current) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        // JPEG reduce el tamaño de la petición al endpoint serverless de Vercel.
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        setCapturedImage(dataUrl);
      }

      setTimeout(() => {
        setShowFlash(false);
        setIsCapturing(false);

        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }

        setView("generating");
      }, 500);
    }, 3000);
  };

  return (
    <div className="screen-content camera-content">
      <BrandLogo />
      <div className="camera-frame">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="camera-video"
          style={{ background: "transparent" }}
        />
        <canvas ref={canvasRef} hidden />

        {showFlash && <div className="camera-flash" />}

        {countdown !== null && (
          <div className="camera-countdown">
            <strong>{countdown}</strong>
          </div>
        )}
      </div>

      <div className="camera-copy">
        <h2>{isCapturing ? "¡Sonríe!" : "Acomódate bien"}</h2>
        <p>
          {isCapturing
            ? "Preparando la foto..."
            : "Cuando estés listo, toma la foto"}
        </p>
        <span>(La imagen solo se usará para la caricatura)</span>
      </div>

      <div className="camera-actions">
        <Button
          variant="outline"
          onClick={() => setView("preview")}
          disabled={isCapturing}
        >
          Volver
        </Button>
        <Button
          className="camera-shoot-button"
          onClick={startCountdown}
          disabled={isCapturing}
          animated
          aria-label="Tomar foto"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <circle cx="12" cy="13" r="3.2" stroke="white" strokeWidth="2" />
            <rect x="4" y="7" width="16" height="12" rx="3" stroke="white" strokeWidth="2" />
            <rect x="9" y="2" width="6" height="4" rx="2" stroke="white" strokeWidth="2" />
          </svg>
        </Button>
      </div>
    </div>
  );
};
