import React from "react";

interface CircularButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Define el estilo visual del botón.
   * - 'default': Fondo rojo sólido con texto blanco.
   * - 'outline': Fondo blanco con borde rojo y texto rojo.
   * - 'ghost': Fondo transparente con texto rojo.
   */
  variant?: "default" | "outline" | "ghost";
  /**
   * Define el tamaño del botón (ancho y alto).
   * - 'sm': Pequeño (w-20 h-20)
   * - 'md': Mediano (w-24 h-24)
   * - 'lg': Grande (w-28 h-28)
   */
  size?: "sm" | "md" | "lg";
  /** El contenido a renderizar dentro del botón, típicamente un ícono. */
  children: React.ReactNode;
  /**
   * Si es true, el botón aplicará una animación sutil de "salto" continuamente.
   */
  animate?: boolean;
}

/**
 * Un componente de botón circular, elegante y moderno, con variantes en rojo y blanco.
 * Ideal para íconos o acciones simples.
 * Asume que Tailwind CSS está configurado en el proyecto.
 */
export const CircularButton: React.FC<CircularButtonProps> = ({
  variant = "default",
  size = "md",
  children,
  className,
  animate = false,
  disabled,
  ...props
}) => {
  const baseClasses = `
    flex items-center justify-center
    rounded-full
    font-semibold
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-opacity-75
    active:scale-95
    overflow-hidden
    ${animate ? "button-animate" : ""}
  `;

  const sizeClasses = {
    sm: "w-20 h-20 text-lg",
    md: "w-24 h-24 text-xl",
    lg: "w-28 h-28 text-2xl",
  };

  const variantClasses = {
    default: `
      bg-red-600 text-white
      hover:bg-red-700
      shadow-lg hover:shadow-xl active:shadow-inner
      focus:ring-red-500 focus:ring-offset-white
    `,
    outline: `
      bg-white text-red-600
      border-2 border-red-600
      hover:bg-red-50 hover:text-red-700
      shadow-md hover:shadow-lg active:shadow-inner
      focus:ring-red-500 focus:ring-offset-white
    `,
    ghost: `
      bg-transparent text-red-600
      hover:bg-red-50 hover:shadow-sm
      active:shadow-inner
      focus:ring-red-500 focus:ring-offset-white
    `,
  };

  // Clases para el estado disabled
  const disabledClasses = `
    opacity-50
    cursor-not-allowed
    pointer-events-none
    grayscale
  `;

  // Combinar clases, incluyendo el estado disabled si corresponde
  const combinedClasses = [
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    disabled ? disabledClasses : "",
    className,
  ]
    .filter(Boolean)
    .map((cls) => cls.trim())
    .join(" ");

  return (
    <button className={combinedClasses} disabled={disabled} {...props}>
      {children}
    </button>
  );
};
