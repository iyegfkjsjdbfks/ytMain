import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  id,
  className = '',
  containerClassName = '',
  rows = 3,
  ...props
}) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        className={`block w-full px-3 py-2 border rounded-md text-sm
          ${error ? 'border-red-500 dark:border-red-400 focus:ring-red-500 focus:border-red-500'
                   : 'border-neutral-300 dark:border-neutral-600 focus:ring-sky-500 focus:border-sky-500'}
          bg-white dark:bg-neutral-700/30 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500
          focus:outline-none transition duration-150 ease-in-out resize-vertical ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-xs text-red-600 dark:text-red-400" id={`${textareaId}-error`}>
          {error}
        </p>
      )}
    </div>
  );
};

export default Textarea;