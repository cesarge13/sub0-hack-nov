import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className = '', showText = true, size = 'md' }: LogoProps) {
  const sizes = {
    sm: { icon: 32, text: 'text-lg' },
    md: { icon: 48, text: 'text-xl' },
    lg: { icon: 64, text: 'text-2xl' }
  };

  const currentSize = sizes[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Icono geométrico 3D - forma de cinta/box parcialmente abierto */}
      <div className="relative" style={{ width: currentSize.icon, height: currentSize.icon }}>
        <svg
          width={currentSize.icon}
          height={currentSize.icon}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Segmento superior derecho - verde brillante (#10B981) */}
          <path
            d="M32 8L44 14L44 22L32 28L20 22L20 14L32 8Z"
            fill="#10B981"
          />
          {/* Segmento medio - verde medio (#059669) */}
          <path
            d="M20 14L32 20L32 28L20 22L20 14Z"
            fill="#059669"
          />
          {/* Segmento inferior izquierdo - azul-verde oscuro/teal (#0D9488) */}
          <path
            d="M8 22L20 28L20 36L8 30L8 22Z"
            fill="#0D9488"
          />
          {/* Hoja blanca dentro del segmento verde brillante */}
          <path
            d="M36 16C36 16 34.5 14.5 34 15.5C33.5 16.5 34.5 18 35.5 18.5C36.5 19 37.5 18 38 17C38.5 16 37.5 15 36 16Z"
            fill="white"
          />
          <path
            d="M35.5 17L35.5 18.5"
            stroke="white"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <h1 className={`font-bold text-slate-700 dark:text-slate-200 ${currentSize.text}`}>
            Certifik
          </h1>
          {/* Línea curva con hoja */}
          <svg
            width="80"
            height="12"
            viewBox="0 0 80 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mt-0.5"
          >
            <path
              d="M0 8 Q20 4, 40 6 T75 5"
              stroke="url(#gradient)"
              strokeWidth="2"
              fill="none"
            />
            {/* Hoja al final */}
            <path
              d="M72 4C72 4 74 3 75 4C76 5 75 7 73 7C73 7 71 6 72 4Z"
              fill="#10B981"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0D9488" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}
    </div>
  );
}

