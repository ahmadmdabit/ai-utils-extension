import React from 'react';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

export function Button({
  children,
  className,
  variant = 'primary',
  ...props
}: ButtonProps) {
  const baseClasses =
    'px-6 py-2.5 rounded-full font-bold text-sm tracking-wider uppercase transition-transform transform hover:scale-105';

  const themeClasses = {
    primary:
      'bg-spotify-green hover:bg-spotify-green-light text-black disabled:bg-spotify-gray disabled:text-spotify-light-gray disabled:hover:scale-100 disabled:cursor-not-allowed',
    secondary: 'bg-spotify-gray hover:bg-spotify-gray/80 text-white',
  };

  return (
    <button
      className={`${baseClasses} ${themeClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
