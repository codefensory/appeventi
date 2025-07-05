import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** El contenido de texto del botón */
  children: React.ReactNode;
  /** Si el botón está deshabilitado */
  disabled?: boolean;
  /** Clases adicionales opcionales */
  className?: string;
  /** Variante visual del botón */
  variant?: "default" | "outline";
  animated?: boolean
}

/**
 * Botón rectangular con bordes muy redondeados, fondo rojo sólido y texto blanco (default),
 * o fondo blanco con borde rojo y texto rojo (outline).
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  className = "",
  disabled = false,
  variant = "default",
  animated,
  ...props
}) => {
  const baseClasses = `
    px-10 py-3
    font-bold
    text-xl
    rounded-full
    shadow-md
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-4 focus:ring-red-400 focus:ring-opacity-50
    active:scale-95
    disabled:opacity-50 disabled:cursor-not-allowed
    disabled:bg-gray-300 disabled:text-gray-500 disabled:border-gray-300
  `;

  const variantClasses =
    variant === "outline"
      ? "bg-white text-red-600 border-2 border-red-600 hover:bg-red-50 hover:text-red-700"
      : "bg-red-600 text-white hover:bg-red-700";

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${className} ${animated ? "btn-animate" : ""}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
