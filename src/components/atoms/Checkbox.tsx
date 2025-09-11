// src/components/atoms/Checkbox.tsx
import React from 'react';

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function Checkbox({ label, id, ...props }: CheckboxProps) {
  return (
    <label htmlFor={id} className="flex items-center space-x-3 cursor-pointer">
      <input
        type="checkbox"
        id={id}
        className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-violet-500 focus:ring-violet-600"
        {...props}
      />
      <span className="text-slate-300">{label}</span>
    </label>
  );
}
