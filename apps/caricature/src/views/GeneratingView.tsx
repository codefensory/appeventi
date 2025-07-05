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
    if (capturedImage) {
      (async () => {
        try {
          const base64 = capturedImage.split(",")[1];
          
          const byteCharacters = atob(base64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'image/png' });
          
          // Crear las dos peticiones en paralelo
          const createFormData = (prompt: string) => {
            const formData = new FormData();
            formData.append('model', 'gpt-image-1');
            formData.append('image', blob, 'captured_image.png');
            formData.append('prompt', prompt);
            formData.append('quality', 'medium');
            formData.append('size', '1024x1024');
            return formData;
          };

          const prompts = [
            "A very funny black and white caricature with exaggerated features. Identify the flaws and make them even bigger. Make it very funny. White and gray gradient background. Don't make it so ugly, make it pretty but very funny. Digital art. Portrait photo type",
            "A very funny black and white caricature with exaggerated features. Identify the flaws and make them even bigger. Make it very funny. White and gray gradient background. Don't make it so ugly, make it pretty but very funny. Digital art Draw only from the waist up."
          ];

          const requests = prompts.map(prompt => 
            fetch("https://api.openai.com/v1/images/edits", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${import.meta.env.VITE_GENERATING_API_KEY}`
              },
              body: createFormData(prompt)
            }).then(response => response.json())
          );

          const [data1, data2] = await Promise.all(requests);
        
          if (
            data1.data && data1.data[0] && data1.data[0].b64_json &&
            data2.data && data2.data[0] && data2.data[0].b64_json
          ) {
            const generatedBase64_1 = data1.data[0].b64_json;
            const generatedDataUrl_1 = `data:image/png;base64,${generatedBase64_1}`;
            
            const generatedBase64_2 = data2.data[0].b64_json;
            const generatedDataUrl_2 = `data:image/png;base64,${generatedBase64_2}`;
            
            setGeneratedImages([generatedDataUrl_1, generatedDataUrl_2]);
            setView("select");
          } else {
            console.error('Error en la respuesta:', data1, data2);
            setError("Error generando las imágenes. Volverás al inicio en unos segundos.");
          }
        } catch (e) {
          console.error('Error completo:', e);
          setError("Error conectando con OpenAI. Volverás al inicio en unos segundos.");
        }
      })();
    }
  }, [capturedImage, setGeneratedImages, setView]);

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex flex-col items-center gap-8">
      <img src="logo.png" alt="logo" className="w-72 mb-8" />
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
