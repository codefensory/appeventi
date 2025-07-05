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
  selected = false,
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
        className="w-[calc(100%-20px)] h-[calc(100%-20px)] rounded-full object-cover"
        draggable={false}
        style={{
          boxShadow: selected ? "0 0 24px 0 rgba(255,0,0,0.3)" : undefined,
        }}
      />
    </div>
    {/* SVG para el borde circular con gap */}
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox="0 0 320 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="160"
        cy="160"
        r="150"
        stroke="#FF0000"
        strokeWidth="10"
        strokeDasharray="850 120"
        stroke-linecap="round"
        strokeDashoffset="0"
        transform="rotate(107 160 160)"
      />
    </svg>
  </div>
);
