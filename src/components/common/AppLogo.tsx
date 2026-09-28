import React from 'react';
import { LOGO_URL } from '../../assets/logo';

interface AppLogoProps {
  variant?: 'full' | 'icon' | 'compact' | 'print';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  theme?: 'dark' | 'light';
}

export const AppLogo: React.FC<AppLogoProps> = ({
  variant = 'full',
  size = 'md',
  className = '',
  theme = 'dark',
}) => {
  const iconDimensions = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-13 h-13',
    xl: 'w-20 h-20',
    '2xl': 'w-28 h-28',
  }[size];

  // Visual Graphic Mark: Official Heraldic Shield
  const LogoMark = (
    <div
      className={`relative ${iconDimensions} shrink-0 flex items-center justify-center transition-transform hover:scale-105`}
    >
      <img
        src={LOGO_URL}
        alt="Brasão Oficial"
        className="w-full h-full object-contain filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.25)]"
      />
    </div>
  );

  if (variant === 'icon') {
    return <div className={`inline-flex items-center ${className}`}>{LogoMark}</div>;
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2.5 ${className}`}>
        {LogoMark}
        <div className="leading-tight text-left">
          <div className="font-bold text-sm tracking-tight text-slate-800">
            <span className={theme === 'light' ? 'text-slate-900' : 'text-white'}>
              Controle de Pacientes
            </span>
          </div>
          <p className={`text-[10px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'} font-medium`}>
            Acompanhamento & Evolução
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'print') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="w-14 h-14 shrink-0 flex items-center justify-center">
          <img
            src={LOGO_URL}
            alt="Brasão Oficial"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="text-left">
          <div className="text-base font-bold tracking-tight text-slate-900">
            Controle e Gestão de Pacientes
          </div>
          <div className="text-xs text-slate-600">
            Acompanhamento Ambulatorial e Linha de Cuidado
          </div>
        </div>
      </div>
    );
  }

  // Full default variant
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {LogoMark}
      <div className="text-left">
        <div className="flex items-center gap-2">
          <span
            className={`font-extrabold tracking-tight text-base sm:text-lg ${
              theme === 'light' ? 'text-slate-900' : 'text-white'
            }`}
          >
            Controle de Pacientes
          </span>
        </div>
        <p
          className={`text-[11px] font-medium tracking-tight ${
            theme === 'light' ? 'text-slate-500' : 'text-slate-300'
          }`}
        >
          Acompanhamento, Contatos & Evolução
        </p>
      </div>
    </div>
  );
};
