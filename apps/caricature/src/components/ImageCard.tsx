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
  className = "",
}) => (
  <div
    className={`image-card ${onClick ? "is-clickable" : ""} ${className}`}
    onClick={onClick}
    style={{
      transform: selected ? "scale(1.05)" : "scale(1)",
    }}
  >
    <div className="image-card__image-wrap">
      <img
        src={src}
        alt={alt}
        className={`image-card__image ${selected ? "is-selected" : ""}`}
        draggable={false}
      />
    </div>
    {(selected === undefined || selected === true) && (
      <svg
        className="image-card__border"
        viewBox="0 0 320 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle
          cx="160"
          cy="160"
          r="150"
          stroke="#000000"
          strokeWidth="4"
          strokeDasharray="850 120"
          strokeLinecap="round"
          strokeDashoffset="0"
          transform="rotate(107 160 160)"
        />
      </svg>
    )}
  </div>
);
