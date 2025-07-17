import { useState, useRef } from "react";

interface Prize {
  id: number;
  name: string;
  color: string;
  textColor: string;
  image?: string;
  imageWidth?: string;
  imageHeight?: string;
}

const prizes: Prize[] = [
  {
    id: 1,
    name: "VINCHA",
    color: "#FF6B9D",
    textColor: "#000",
    image: "/vincha.png",
    imageWidth: "64px",
    imageHeight: "64px",
  },
  {
    id: 2,
    name: "RESALTADOR\nPOST IT",
    color: "#FF8FA3",
    textColor: "#000",
    image: "/postit.png",
    imageWidth: "auto",
    imageHeight: "110px",
  },
  {
    id: 3,
    name: "50%\nDESCTO\nALCOHOL\nEN GEL",
    color: "#FFB3C1",
    textColor: "#000",
    image: "/dscto.png",
    imageWidth: "auto",
    imageHeight: "65px",
  },
  {
    id: 4,
    name: "BONILLA\nPALETA",
    color: "#FFC2D4",
    textColor: "#000",
    image: "/bowl-y-paleta.png",
    imageWidth: "64px",
    imageHeight: "64px",
  },
  {
    id: 5,
    name: "10%DSCTO\nEN TU PRÓXIMA\nCOMPRA + ALARMA",
    color: "#FFD1E8",
    textColor: "#000",
    image: "/chanchito.png",
    imageWidth: "auto",
    imageHeight: "70px",
  },
  {
    id: 6,
    name: "ANTI STRESS\n+ LAPICES\n+ AGENDA",
    color: "#FFE0F0",
    textColor: "#000",
    image: "/lanyard.png",
    imageWidth: "auto",
    imageHeight: "100px",
  },
  {
    id: 7,
    name: "SET DE\nMASCARILLAS\nHIDROPLÁSTICA",
    color: "#FFEFF7",
    textColor: "#000",
    image: "/mascarrilla.png",
    imageWidth: "auto",
    imageHeight: "100px",
  },
  {
    id: 8,
    name: "CUADERNO\nY LAPICERO",
    color: "#FFF7FB",
    textColor: "#000",
    image: "/cuaderno.png",
    imageWidth: "auto",
    imageHeight: "70px",
  },
];

function App() {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [spinCount, setSpinCount] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);
  const [resetHoldTimer, setResetHoldTimer] = useState<number | null>(null);

  const spinWheel = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setSelectedPrize(null);

    const spins = 5 + Math.random() * 5;
    const segmentAngle = 360 / prizes.length;
    const randomAngleOffset = (Math.random() - 0.5) * segmentAngle;
    const finalRotation = rotation + spins * 360 + randomAngleOffset;

    setRotation(finalRotation);
    setSpinCount((prev) => prev + 1);

    setTimeout(() => {
      const effectiveAngle = (360 - (finalRotation % 360)) % 360;

      const prizeIndex =
        Math.floor((effectiveAngle + segmentAngle / 2) / segmentAngle) %
        prizes.length;
      const winner = prizes[prizeIndex];

      setSelectedPrize(winner);
      setIsSpinning(false);
      setShowModal(true);
    }, 4000);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const resetWheel = () => {
    setRotation(0);
    setSpinCount(0);
    setSelectedPrize(null);
    setShowModal(false);
  };

  const generateCirclePositions = () => {
    const positions = [];
    for (let i = 0; i < 6; i++) {
      positions.push({
        top: Math.random() * 80 + 10,
        left: Math.random() * 80 + 10,
        size: Math.random() * 60 + 20,
        delay: Math.random() * 3,
      });
    }
    return positions;
  };

  const [circlePositions] = useState(generateCirclePositions());

  const handleResetPress = () => {
    const timer = setTimeout(() => {
      resetWheel();
    }, 5000);
    setResetHoldTimer(timer);
  };

  const handleResetRelease = () => {
    if (resetHoldTimer) {
      clearTimeout(resetHoldTimer);
      setResetHoldTimer(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(135deg, #FFE0F0 0%, #FFF0F8 50%, #FFEFF7 100%)",
        }}
      />

      <div className="absolute inset-0 opacity-10">
        {circlePositions.map((circle, index) => (
          <div
            key={index}
            className="absolute rounded-full border-2 border-pink-400 floating-circles"
            style={{
              top: `${circle.top}%`,
              left: `${circle.left}%`,
              width: `${circle.size}px`,
              height: `${circle.size}px`,
              animationDelay: `${circle.delay}s`,
            }}
          />
        ))}
      </div>

      <div
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: "url(/background.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      <div className="mb-8 z-10 text-center">
        <img
          src="/logo.png"
          alt="Pharmabella Magistral"
          className="h-16 mx-auto mb-4"
        />
        <h1 className="text-2xl font-bold gradient-text mb-8">
          RULETA DE PREMIOS
        </h1>
      </div>

      <div className="relative mb-8 z-10">
        <div className="absolute inset-0 bg-black opacity-20 rounded-full blur-lg transform translate-y-4 scale-95"></div>

        <div
          ref={wheelRef}
          className="relative w-80 h-80 rounded-full overflow-hidden wheel-container"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning
              ? "transform 4s cubic-bezier(0.2, 0.8, 0.2, 1)"
              : "none",
          }}
        >
          <img
            src="/ruleta-colors.png"
            alt="Ruleta"
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
              <img
                src="/logo.png"
                alt="Logo"
                className="w-16 h-16 object-contain"
              />
            </div>
          </div>

          {prizes.map((prize, index) => {
            return (
              <div
                key={prize.id}
                className="absolute"
                style={{
                  left: "50%",
                  top: "50%",
                  transform: `translate(-50%, -50%) rotatez(${index * 45}deg)`,
                }}
              >
                <div className="flex flex-col items-center justify-center text-center">
                  {prize.image && (
                    <img
                      src={prize.image}
                      alt={prize.name}
                      className="mb-1 prize-image object-contain"
                      style={{
                        width: prize.imageWidth || "64px",
                        height: prize.imageHeight || "64px",
                        transform: "translateY(-110px)",
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
          <div className="wheel-pointer">
            <img src="/puntero.png" alt="Puntero" className="w-8 h-12" />
          </div>
        </div>
      </div>

      <div className="mb-4 z-10 text-center">
        <p className="text-pink-600 text-sm">
          Giros realizados: <span className="font-bold">{spinCount}</span>
        </p>
      </div>

      <div className="flex gap-4 z-10">
        <button
          onClick={spinWheel}
          disabled={isSpinning}
          className={`
            px-8 py-4 text-white font-bold text-xl rounded-full shadow-lg transform transition-all duration-200 spin-button
            ${
              isSpinning
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 hover:scale-105 active:scale-95"
            }
          `}
          style={{
            background: isSpinning
              ? "#9CA3AF"
              : "linear-gradient(to right, #EC4899, #DB2777)",
            boxShadow: isSpinning
              ? "0 5px 15px rgba(156, 163, 175, 0.3)"
              : "0 10px 25px rgba(236, 72, 153, 0.3)",
          }}
        >
          {isSpinning ? "GIRANDO..." : "GIRAR"}
        </button>
      </div>

      {/* Special reset button */}
      <button
        aria-label="Special reset button"
        onMouseDown={handleResetPress}
        onMouseUp={handleResetRelease}
        onMouseLeave={handleResetRelease} // In case the mouse leaves the element before releasing
        onTouchStart={handleResetPress}
        onTouchEnd={handleResetRelease}
        className="fixed top-0 right-0 w-16 h-16 rounded-full bg-transparent z-50 cursor-pointer"
        style={{ cursor: 'url("/cursor-grab.png"), auto' }} // Example custom cursor
      ></button>

      <div className="mt-8 z-10 text-center max-w-md">
        <p className="text-gray-600 text-sm leading-relaxed">
          ¡Participa en nuestra ruleta de premios de Pharmabella Magistral!
          Presiona el botón "GIRAR" y descubre qué increíble premio te espera.
        </p>
      </div>

      {showModal && selectedPrize && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 modal-backdrop">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl modal-content">
            <div className="mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🎉</span>
              </div>
              <h2 className="text-2xl font-bold gradient-text mb-2">
                ¡FELICITACIONES!
              </h2>
              <p className="text-gray-600 text-sm">
                Has ganado un increíble premio
              </p>
            </div>

            <div className="mb-6 p-4 bg-pink-50 rounded-xl">
              {selectedPrize.image && (
                <img
                  src={selectedPrize.image}
                  alt={selectedPrize.name}
                  className="w-40 h-40 mx-auto mb-4 object-contain"
                />
              )}
            </div>

            <div className="text-xs text-gray-500 mb-4">
              Acércate a nuestro stand para reclamar tu premio
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 bg-gradient-to-r from-pink-500 to-pink-600 text-white px-6 py-3 rounded-full font-bold hover:from-pink-600 hover:to-pink-700 transition-all duration-200"
              >
                ¡Genial!
              </button>
              <button
                onClick={() => {
                  closeModal();
                  setTimeout(() => spinWheel(), 500);
                }}
                className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-full font-bold hover:bg-gray-600 transition-all duration-200"
              >
                Girar otra vez
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
