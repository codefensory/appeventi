import { useEffect, useRef, useState } from "react";
import useViewStore from "../lib/view-manager/view-manager-store";
import { CircularButton } from "../components/Button";

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
        const dataUrl = canvas.toDataURL("image/png");
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
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex flex-col items-center gap-8">
      <div className="mt-4 relative">
        <div className="h-[600px] w-[400px] rounded-3xl bg-black/10 overflow-hidden flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover rounded-3xl"
            style={{ background: "transparent" }}
          />
          <canvas ref={canvasRef} style={{ display: "none" }} />
          
          {/* Flash overlay */}
          {showFlash && (
            <div className="absolute inset-0 bg-white opacity-80 z-10 rounded-3xl" />
          )}
          
          {/* Countdown overlay */}
          {countdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="text-8xl font-black text-white drop-shadow-2xl">
                {countdown}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-3xl font-black text-center text-gray-800">
          {isCapturing ? "¡Sonríe!" : "Acomódate bien"}
        </h2>
        <p className="text-lg text-center text-gray-700">
          {isCapturing ? "Preparando la foto..." : "Cuando estés listo, toma la foto"}
        </p>
        <span className="text-sm text-gray-500">(La imagen solo se usará para la caricatura)</span>
      </div>
      
      <div className="flex flex-row gap-8 mt-4">
        <CircularButton
          variant="outline"
          className="text-xl"
          size="lg"
          onClick={() => setView("preview")}
          disabled={isCapturing}
        >
          Volver
        </CircularButton>
        <CircularButton
          variant="default"
          className="text-xl"
          size="lg"
          onClick={startCountdown}
          animate={!isCapturing}
          disabled={isCapturing}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="32" height="32">
            <circle cx="12" cy="13" r="3.2" stroke="white" strokeWidth="2" />
            <rect x="4" y="7" width="16" height="12" rx="3" stroke="white" strokeWidth="2" />
            <rect x="9" y="2" width="6" height="4" rx="2" stroke="white" strokeWidth="2" />
          </svg>
        </CircularButton>
      </div>
    </div>
  );
};
