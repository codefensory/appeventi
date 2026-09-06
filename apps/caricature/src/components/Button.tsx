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
  animated?: boolean;
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
  const variantClass = variant === "outline" ? "app-button--outline" : "";

  return (
    <button
      className={`app-button ${variantClass} ${className} ${animated ? "btn-animate" : ""}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
