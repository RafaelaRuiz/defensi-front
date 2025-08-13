import React from 'react';
import Link from 'next/link';

interface BaseButtonProps {
  /** Texto que se mostrará en el botón */
  text: string;
  /** Si el botón está deshabilitado */
  disabled?: boolean;
  /** Función que se ejecuta al hacer click */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Clases CSS adicionales */
  className?: string;
  /** Tipo de botón */
  type?: 'button' | 'submit' | 'reset';
  /** ID del botón */
  id?: string;
  /** Título del botón (tooltip) */
  title?: string;
  /** Estilo del botón */
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  /** Tamaño del botón */
  size?: 'small' | 'medium' | 'large';
  /** Si el botón debe ocupar todo el ancho disponible */
  fullWidth?: boolean;
  /** Icono a mostrar antes del texto */
  iconBefore?: React.ReactNode;
  /** Icono a mostrar después del texto */
  iconAfter?: React.ReactNode;
  /** Si el botón está en estado de carga */
  loading?: boolean;
}

interface ButtonWithLinkProps extends BaseButtonProps {
  /** URL de destino cuando se hace click (convierte el botón en un enlace) */
  backlink: string;
  /** Si el enlace se abre en una nueva pestaña */
  target?: '_blank' | '_self' | '_parent' | '_top';
  /** Relación del enlace (para seguridad cuando target='_blank') */
  rel?: string;
}

interface RegularButtonProps extends BaseButtonProps {
  backlink?: never;
}

type ButtonProps = ButtonWithLinkProps | RegularButtonProps;

const Button: React.FC<ButtonProps> = (props) => {
  const {
    text,
    disabled = false,
    onClick,
    className = '',
    type = 'button',
    id,
    title,
    variant = 'primary',
    size = 'medium',
    fullWidth = false,
    iconBefore,
    iconAfter,
    loading = false,
    backlink,
    ...restProps
  } = props;

  // Extraer target y rel solo si backlink existe
  const target = 'target' in props ? props.target || '_self' : '_self';
  const rel = 'rel' in props ? props.rel : undefined;
  // Clases base del botón
  const baseClasses = `
    inline-flex items-center justify-center
    font-medium rounded-md transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
  `.trim().replace(/\s+/g, ' ');

  // Clases según el variant
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white focus:ring-blue-500'
  };

  // Clases según el tamaño
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg'
  };

  // Combinar todas las clases
  const buttonClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  // Contenido del botón
  const buttonContent = (
    <>
      {loading && (
        <svg 
          className="animate-spin -ml-1 mr-2 h-4 w-4" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {!loading && iconBefore && <span className="mr-2">{iconBefore}</span>}
      <span>{text}</span>
      {!loading && iconAfter && <span className="ml-2">{iconAfter}</span>}
    </>
  );

  // Si hay backlink, renderizar como Link de Next.js
  if (backlink) {
    return (
      <Link
        href={backlink}
        target={target}
        rel={target === '_blank' ? rel || 'noopener noreferrer' : rel}
        className={`${buttonClasses} ${disabled ? 'pointer-events-none' : ''}`}
        id={id}
        title={title}
        onClick={disabled ? undefined : onClick as any}
        {...restProps}
      >
        {buttonContent}
      </Link>
    );
  }

  // Renderizar como botón normal
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={buttonClasses}
      id={id}
      title={title}
      {...restProps}
    >
      {buttonContent}
    </button>
  );
};

export default Button;