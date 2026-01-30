import React from "react";

interface ImageCardProps {
  src: string;
  alt?: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export const ImageCard: React.FC<ImageCardProps> = ({
  src,
  alt,
  selected = undefined,
  onClick,
  className,
}) => (
  <div
    className={`relative flex items-center justify-center w-[320px] h-[320px] ${className} rounded-full`}
    onClick={onClick}
    style={{
      cursor: onClick ? "pointer" : "default",
      transition: "box-shadow 0.2s, transform 0.2s",
      transform: selected ? "scale(1.05)" : "scale(1)",
    }}
  >
    {/* Imagen circular */}
    <div className="absolute inset-0 flex items-center justify-center">
      <img
        src={src}
        alt={alt}
        className={`w-[calc(100%-20px)] h-[calc(100%-20px)] rounded-full object-cover ${selected ? 'border-4 border-[#D01B52]' : 'border-2 border-[#D01B52]'}`}
        draggable={false}
        style={{
          boxShadow: selected ? "0 0 24px 0 #d01b524d" : undefined,
          boxSizing: 'border-box'
        }}
      />
    </div>
    {/* Borde aplicado en la propia imagen, sin overlay SVG/absolute */}
  </div>
);
