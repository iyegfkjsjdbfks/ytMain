import React, { ChangeEvent, FormEvent, ReactNode, FC, useState, useCallback, useContext, createContext, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

import { cn } from '../../utils/cn';
import { UnifiedButton } from '../ui/UnifiedButton';

// Form Context Types
interface FormContextValue {
 errors: Record<string, string>;
 touched: Record<string, boolean>;
 values: Record<string, any>;
 setFieldValue: (name,
 value: string | number) => void;
 setFieldError: (name,
 error: Error) => void;
 setFieldTouched: (name,
 touched) => void;
 validateField: (name) => void
}

const FormContext = createContext<FormContextValue | null>(null);

// Form Provider Component
interface FormProviderProps {
 children: React.ReactNode;
 initialValues?: Record<string, any>;
 validationSchema?: Record<string(value: string | number) => string | undefined>;
 onSubmit?: (values: Record<string, any>) => void | Promise<void>;
}

export const FormProvider: React.FC<FormProviderProps> = ({
 children,
 initialValues = {},
 validationSchema = {} }) => {
 const [values, setValues] = useState(initialValues);
 const [errors, setErrors] = useState<Record<string, string>>({});
 const [touched, setTouched] = useState<Record<string, boolean>>({});

 const setFieldValue = useCallback((name,
 value: string | number) => {
 setValues(prev => ({ ...prev as any, [name]: value }));
 // Clear error when user starts typing
 if (errors[name]) {
 setErrors(prev => ({ ...prev as any, [name]: '' }));
 }
 }, [errors]);

 const setFieldError = useCallback((name,
 error: Error) => {
 setErrors(prev => ({ ...prev as any, [name]: error }));
 }, []);

 const setFieldTouched = useCallback((name,
 touched) => {
 setTouched(prev => ({ ...prev as any, [name]: touched }));
 }, []);

 const validateField = useCallback((name) => {
 const validator = validationSchema[name];
 if (validator as any) {
 const error = validator(values[name]);
 if (error as any) {
 setFieldError(name, error);
 }
 }, [validationSchema, values, setFieldError]);

 const contextValue: FormContextValue = {
 errors,
 touched,
 values,
 setFieldValue,
 setFieldError,
 setFieldTouched,
 validateField };

 return (
 <FormContext.Provider value={contextValue}>
 {children}
// FIXED:  </FormContext.Provider>
 );
};

// Hook to use form context
export const useFormContext = () => {
 const context = useContext<any>(FormContext);
 if (!context) {
 throw new Error('useFormContext must be used within a FormProvider');
 }
 return context;
};

// Field Wrapper Component
interface FormFieldProps {
 name: string;
 label?: string;
 required?: boolean;
 helpText?: string;
 children: React.ReactNode;
 className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
 name,
 label,
 required,
 helpText,
 children,
 className }) => {
 const { errors, touched } = useFormContext();
 const error = touched[name] ? errors[name] : undefined;

 return (
 <div className={cn('space-y-1', className)}>
 {label && (
 <label
// FIXED:  htmlFor={name}
// FIXED:  className="block text-sm font-medium text-neutral-700 dark:text-neutral-300" />
 >
 {label}
 {required && <span className="text-red-500 ml-1">*</span>}
// FIXED:  </label>
 )}

 {children}

 {error && (
 <p className="text-sm text-red-600 dark:text-red-400">
 {error}
// FIXED:  </p>
 )}

 {helpText && !error && (
 <p className="text-sm text-neutral-500 dark:text-neutral-400">
 {helpText}
// FIXED:  </p>
 )}
// FIXED:  </div>
 );
};

// Enhanced Input Component
interface UnifiedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement> 'onChange'> {
 name: string;
 label?: string;
 required?: boolean;
 helpText?: string;
 leftIcon?: React.ReactNode;
 rightIcon?: React.ReactNode;
 variant?: 'default' | 'filled' | 'outline';
 inputSize?: 'sm' | 'md' | 'lg';
 onChange?: (value: string | number) => void
}

const inputVariantClasses = {
 default: 'border-neutral-300 dark:border-neutral-600 focus:border-sky-500 focus:ring-sky-500',
 filled: 'border-transparent bg-neutral-100 dark:bg-neutral-800 focus:border-sky-500 focus:ring-sky-500',
 outline: 'border-2 border-neutral-300 dark:border-neutral-600 focus:border-sky-500 focus:ring-sky-500' };

const inputSizeClasses = {
 sm: 'px-3 py-2 text-sm',
 md: 'px-4 py-2.5 text-sm',
 lg: 'px-4 py-3 text-base' };

export const UnifiedInput: React.FC<UnifiedInputProps> = ({
 name,
 label,
 required,
 helpText,
 leftIcon,
 rightIcon,
 variant = 'default',
 inputSize = 'md',
 onChange,
 className,
 ...props
}) => {
 const { values, errors, touched, setFieldValue, setFieldTouched, validateField } = useFormContext();
 const error = touched[name] ? errors[name] : undefined;
 const value = values[name] || '';

 const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
 const newValue = e.target.value;
 setFieldValue(name, newValue);
 onChange?.(newValue);
 }, [name, setFieldValue, onChange]);

 const handleBlur = useCallback(() => {
 setFieldTouched(name, true);
 validateField(name);
 }, [name, setFieldTouched, validateField]);

 const inputClasses = cn(
 'block w-full rounded-lg border transition-colors duration-200',
 'focus:outline-none focus:ring-2 focus:ring-opacity-50',
 'disabled:opacity-50 disabled:cursor-not-allowed',
 'dark:bg-neutral-900 dark:text-neutral-100',
 inputVariantClasses[variant],
 inputSizeClasses[inputSize],
 {
 'border-red-500 focus:border-red-500 focus:ring-red-500': error,
 'pl-10': leftIcon,
 'pr-10': rightIcon },
 className);

 const input = (
 <div className="relative">
 {leftIcon && (
 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
 <span className="text-neutral-400 dark:text-neutral-500">
 {leftIcon}
// FIXED:  </span>
// FIXED:  </div>
 )}

 <input
 {...props}
// FIXED:  id={name}
// FIXED:  name={name}
// FIXED:  value={value} />
// FIXED:  onChange={(e) => handleChange(e)}
 onBlur={handleBlur}
// FIXED:  className={inputClasses}
 />

 {rightIcon && (
 <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
 <span className="text-neutral-400 dark:text-neutral-500">
 {rightIcon}
// FIXED:  </span>
// FIXED:  </div>
 )}
// FIXED:  </div>
 );

 if (label || helpText) {
 return (
 <FormField
// FIXED:  name={name}
 {...(label && { label })}
 {...(required !== undefined && { required })}
 {...(helpText && { helpText })} />
 >
 {input}
// FIXED:  </FormField>
 );
 }

 return input;
};

// Enhanced Textarea Component
interface UnifiedTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement> 'onChange'> {
 name: string;
 label?: string;
 required?: boolean;
 helpText?: string;
 variant?: 'default' | 'filled' | 'outline';
 textareaSize?: 'sm' | 'md' | 'lg';
 resize?: 'none' | 'vertical' | 'horizontal' | 'both';
 onChange?: (value: string | number) => void
}

const textareaSizeClasses = {
 sm: 'px-3 py-2 text-sm min-h-[80px]',
 md: 'px-4 py-2.5 text-sm min-h-[100px]',
 lg: 'px-4 py-3 text-base min-h-[120px]' };

const resizeClasses = {
 none: 'resize-none',
 vertical: 'resize-y',
 horizontal: 'resize-x',
 both: 'resize' };

export const UnifiedTextarea: React.FC<UnifiedTextareaProps> = ({
 name,
 label,
 required,
 helpText,
 variant = 'default',
 textareaSize = 'md',
 resize = 'vertical',
 onChange,
 className,
 ...props
}) => {
 const { values, errors, touched, setFieldValue, setFieldTouched, validateField } = useFormContext();
 const error = touched[name] ? errors[name] : undefined;
 const value = values[name] || '';

 const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
 const newValue = e.target.value;
 setFieldValue(name, newValue);
 onChange?.(newValue);
 }, [name, setFieldValue, onChange]);

 const handleBlur = useCallback(() => {
 setFieldTouched(name, true);
 validateField(name);
 }, [name, setFieldTouched, validateField]);

 const textareaClasses = cn(
 'block w-full rounded-lg border transition-colors duration-200',
 'focus:outline-none focus:ring-2 focus:ring-opacity-50',
 'disabled:opacity-50 disabled:cursor-not-allowed',
 'dark:bg-neutral-900 dark:text-neutral-100',
 inputVariantClasses[variant],
 textareaSizeClasses[textareaSize],
 resizeClasses[resize],
 {
 'border-red-500 focus:border-red-500 focus:ring-red-500': error },
 className);

 const textarea = (
 <textarea
 {...props}
// FIXED:  id={name}
// FIXED:  name={name}
// FIXED:  value={value} />
// FIXED:  onChange={(e) => handleChange(e)}
 onBlur={handleBlur}
// FIXED:  className={textareaClasses}
 />
 );

 if (label || helpText) {
 return (
 <FormField
// FIXED:  name={name}
 {...(label && { label })}
 {...(required !== undefined && { required })}
 {...(helpText && { helpText })} />
 >
 {textarea}
// FIXED:  </FormField>
 );
 }

 return textarea;
};

// Select Component
interface UnifiedSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement> 'onChange'> {
 name: string;
 label?: string;
 required?: boolean;
 helpText?: string;
 options: Array<{ value: string; label: string; disabled?: boolean }>;
 placeholder?: string;
 variant?: 'default' | 'filled' | 'outline';
 selectSize?: 'sm' | 'md' | 'lg';
 onChange?: (value: string | number) => void
}

export const UnifiedSelect: React.FC<UnifiedSelectProps> = ({
 name,
 label,
 required,
 helpText,
 options,
 placeholder,
 variant = 'default',
 selectSize = 'md',
 onChange,
 className,
 ...props
}) => {
 const { values, errors, touched, setFieldValue, setFieldTouched, validateField } = useFormContext();
 const error = touched[name] ? errors[name] : undefined;
 const value = values[name] || '';

 const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
 const newValue = e.target.value;
 setFieldValue(name, newValue);
 onChange?.(newValue);
 }, [name, setFieldValue, onChange]);

 const handleBlur = useCallback(() => {
 setFieldTouched(name, true);
 validateField(name);
 }, [name, setFieldTouched, validateField]);

 const selectClasses = cn(
 'block w-full rounded-lg border transition-colors duration-200',
 'focus:outline-none focus:ring-2 focus:ring-opacity-50',
 'disabled:opacity-50 disabled:cursor-not-allowed',
 'dark:bg-neutral-900 dark:text-neutral-100',
 'appearance-none bg-no-repeat bg-right bg-[length:16px_16px] pr-10',
 inputVariantClasses[variant],
 inputSizeClasses[selectSize],
 {
 'border-red-500 focus:border-red-500 focus:ring-red-500': error },
 className);

 const select = (
 <div className="relative">
 <select
 {...props}
// FIXED:  id={name}
// FIXED:  name={name}
// FIXED:  value={value} />
// FIXED:  onChange={(e) => handleChange(e)}
 onBlur={handleBlur}
// FIXED:  className={selectClasses}
// FIXED:  style={{
 backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'m6 8 4 4 4-4\'/%3e%3c/svg%3e")' 

 }
 >
 {placeholder && (
 <option value="" disabled>
 {placeholder}
// FIXED:  </option>
 )}
 {options.map((option) => (
 <option
 key={option.value}
// FIXED:  value={option.value}
// FIXED:  disabled={option.disabled} />
 >
 {option.label}
// FIXED:  </option>
 ))}
// FIXED:  </select>
// FIXED:  </div>
 );

 if (label || helpText) {
 return (
 <FormField
// FIXED:  name={name}
 {...(label && { label })}
 {...(required !== undefined && { required })}
 {...(helpText && { helpText })} />
 >
 {select}
// FIXED:  </FormField>
 );
 }

 return select;
};

// Form Component
interface UnifiedFormProps {
 children: React.ReactNode;
 onSubmit?: (values: Record<string, any>) => void | Promise<void>;
 initialValues?: Record<string, any>;
 validationSchema?: Record<string(value: string | number) => string | undefined>;
 className?: string;
}

export const UnifiedForm: React.FC<UnifiedFormProps> = ({
 children,
 onSubmit,
 initialValues,
 validationSchema,
 className }) => {
 const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

 const handleSubmit = useCallback(async (e: React.FormEvent): Promise<any> => {
 e.preventDefault();
 if (!onSubmit) {
return;
}

 setIsSubmitting(true);
 try {
 // Get form data from context would be handled here
 // For now, we'll pass empty object
 await onSubmit({});
 } catch (error) {
 (console as any).error('Form submission error:', error);
 } finally {
 setIsSubmitting(false);
 }
 }, [onSubmit]);

 return (
 <FormProvider
 {...(initialValues && { initialValues })}
 {...(validationSchema && { validationSchema })} />
 >
 <form />
// FIXED:  onSubmit={(e) => handleSubmit(e)}
// FIXED:  className={cn('space-y-6', className)}
 noValidate
 >
 {children}

 {onSubmit && (
 <div className="flex justify-end">
 <UnifiedButton
// FIXED:  type="submit"
 loading={isSubmitting}
// FIXED:  disabled={isSubmitting} />
 >
 {isSubmitting ? 'Submitting...' : 'Submit'}
// FIXED:  </UnifiedButton>
// FIXED:  </div>
 )}
// FIXED:  </form>
// FIXED:  </FormProvider>
 );
};

// Type exports
export type {
 FormContextValue,
 FormProviderProps,
 FormFieldProps,
 UnifiedInputProps,
 UnifiedTextareaProps,
 UnifiedSelectProps,
 UnifiedFormProps };
export default FormProvider;