import { type ComponentProps, type ReactNode, forwardRef } from 'react';

type Props = {
  label: string | ReactNode;
  id: string;
  className?: string;
};

export const SimpleCheckbox = forwardRef<HTMLInputElement, ComponentProps<'input'> & Props>(
  function bigCheckbox({ className, id, label, ...props }, ref) {
    return (
      <div className={`flex items-center space-x-5 ${className}`}>
        <input id={id} ref={ref} type="checkbox" {...props} />
        <label htmlFor={id}>{label}</label>
      </div>
    );
  }
);
