import React from 'react';

export type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  'data-testid'?: string; // Allow data-testid prop
};

export function Checkbox({ label, id, ...props }: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className="flex items-center space-x-3 cursor-pointer group"
    >
      <input
        type="checkbox"
        id={id}
        data-testid={props['data-testid'] || `checkbox-${id}`}
        className="h-4 w-4 rounded-sm border-spotify-light-gray bg-spotify-gray text-spotify-green focus:ring-spotify-green focus:ring-2"
        {...props}
      />
      <span className="text-spotify-light-gray group-hover:text-white transition-colors">
        {label}
      </span>
    </label>
  );
}
