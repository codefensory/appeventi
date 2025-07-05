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
    className={`rounded-2xl overflow-hidden h-[400px] border-4 cursor-pointer transition-all duration-200 ${
      selected ? "border-red-500 scale-105 shadow-xl" : "border-transparent"
    } ${className}`}
    onClick={onClick}
  >
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover"
      draggable={false}
    />
  </div>
);
