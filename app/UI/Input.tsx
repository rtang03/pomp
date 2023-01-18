'use client';

import clsx from 'clsx';
import { ErrorMessage, Field } from 'formik';
import { motion } from 'framer-motion';
import { type ComponentProps, forwardRef } from 'react';
import { ReactNode } from 'react';

interface Props extends Omit<ComponentProps<'input'>, 'prefix'> {
  label?: string | ReactNode;
  prefix?: string | ReactNode;
  className?: string;
  error?: boolean;
  noborder?: boolean;
  setFieldValue?: any;
}

const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { setFieldValue, noborder, label, prefix, type = 'text', error, className = '', ...props },
  ref
) {
  return (
    <label className="w-full">
      {label && (
        <div className="mb-1 flex font-medium text-gray-800 dark:text-gray-200">
          <div className="mr-4">{label}</div>
        </div>
      )}
      <div className="flex">
        {prefix && (
          <span className="inline-flex items-center rounded-l-xl border border-r-0 border-gray-300 bg-gray-100 px-3 text-gray-500 dark:border-gray-700 dark:bg-gray-900">
            {prefix}
          </span>
        )}
        <Field
          className={clsx(
            { '!border-red-500 placeholder:text-red-500': error },
            { 'rounded-r-xl': prefix },
            { 'rounded-xl': !prefix },
            `${
              !noborder
                ? 'focus:border-brand-500 focus:ring-brand-400 border border-gray-300 dark:border-gray-700'
                : 'border-0'
            } w-full bg-white outline-none focus:ring-0 disabled:bg-gray-500/20 disabled:opacity-60 dark:bg-transparent`,
            className
          )}
          type={type}
          ref={ref}
          {...props}
        />
        {setFieldValue && (
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            className="-ml-10 h-5 rounded-b-lg bg-gray-200 px-2 text-[10px] text-gray-700 dark:bg-gray-600/30 dark:text-gray-400 md:-ml-24 md:px-5 md:text-xs"
            onClick={() =>
              navigator.clipboard.readText().then((text) => setFieldValue(props.id, text))
            }
          >
            paste
          </motion.button>
        )}
      </div>
      {props?.name && (
        <div className="mt-1 text-sm font-bold text-red-500">
          <ErrorMessage name={props.name} />
        </div>
      )}
    </label>
  );
});

export default Input;
