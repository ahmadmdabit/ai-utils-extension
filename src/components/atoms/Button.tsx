// src/components/atoms/Button.tsx
import React from 'react';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ children, className, ...props }: ButtonProps) {
  const baseClasses =
    'px-4 py-2 rounded-md font-semibold text-white transition-colors duration-200';
  const themeClasses =
    'bg-violet-600 hover:bg-violet-700 disabled:bg-slate-500 disabled:cursor-not-allowed';

  return (
    <button
      className={`${baseClasses} ${themeClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
