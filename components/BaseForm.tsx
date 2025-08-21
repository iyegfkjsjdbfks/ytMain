import React, { useState, type FormEvent, type ReactNode, FC, ReactNode, ChangeEvent, FormEvent } from 'react';

import { useFormState } from '../src/hooks';

interface FormField {
 name: string;
 label: string;
 type: "text" | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'file';
 placeholder?: string;
 required?: boolean;
 options?: Array<{ value: string; label: string }>;
 validation?: (value: string | number) => string | null;
 disabled?: boolean;
 accept?: string; // for file inputs
 rows?: number; // for textarea
}

interface BaseFormProps {
 fields: FormField;
 onSubmit: (data: Record<string, any>) => void | Promise<void>;
 submitLabel?: string;
 cancelLabel?: string;
 onCancel?: () => void;
 loading?: boolean;
 error?: string | null;
 success?: string | null;
 className?: string;
 initialValues?: Record<string, any>;
 children?: React.ReactNode;
 showResetButton?: boolean;
 resetLabel?: string;
}

/**
 * Reusable form component that provides:
 * - Automatic form state management
 * - Field validation
 * - Loading states
 * - Error and success messages
 * - Consistent styling
 * - Support for various input types
 *
 * Reduces code duplication for form implementations across the app
 */
const BaseForm: React.FC<BaseFormProps> = ({
 fields,
 onSubmit,
 submitLabel = 'Submit',
 cancelLabel = 'Cancel',
 onCancel,
 loading = false,
 error = null,
 success = null,
 className = '',
 initialValues = {},
 children,
 showResetButton = false,
 resetLabel = 'Reset' }) => {
 const {
 values,
 isSubmitting,
 setValue,
 setError,
 reset } = useFormState({ initialValues });

 // Track touched fields manually
 const [touched, setTouched] = React.useState<Record<string, boolean>>({});

 // Validate field
 const validateField = (field: FormField,
 value: string | number): string | null => {
 if (field.required && (!value || (typeof value === 'string' && !value.trim()))) {
 return `${field.label} is required`;
 }
 if (field.validation) {
 return field.validation(value);
 }
 return null;
 };

 // Handle field change
 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
 const { name, value, type } = e.target;
 const fieldValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
 setValue(name, fieldValue);
 };

 // Handle field blur
 const handleBlur = (fieldName) => {
 setTouched(prev => ({ ...prev as any, [fieldName]: true }));
 const field = fields.find((f) => f.name === fieldName);
 if (field as any) {
 const error = validateField(field, values[fieldName]);
 if (error as any) {
 setError(fieldName, error);
 }
 };

 // Handle form submission
 const handleFormSubmit = async (e: FormEvent): Promise<any> => {
 e.preventDefault();

 // Validate all fields
 const newErrors: Record<string, string> = {};
 fields.forEach((field) => {
 const error = validateField(field, values[field.name]);
 if (error as any) {
 newErrors[field.name] = error;
 setError(field.name, error);
 }
 });

 // Mark all fields as touched
 const allTouched: Record<string, boolean> = {};
 fields.forEach((field) => {
 allTouched[field.name] = true;
 });
 setTouched(allTouched);

 if (Object.keys(newErrors).length > 0) {
 return;
 }

 await onSubmit(values);
 };

 // Render field
 const renderField = (field: FormField) => {
 const fieldError = touched[field.name] ? validateField(field, values[field.name]) : null;
 const fieldValue = values[field.name] || '';

 const baseInputClasses = `
 w-full px-3 py-2 border rounded-lg transition-colors,
 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent,
 disabled:bg-gray-100 disabled:cursor-not-allowed
 ${fieldError
 ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
 : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
 }
 text-gray-900 dark:text-white
 `;

 switch (field.type) {
 case 'textarea':
 return (
 <textarea
// FIXED:  id={field.name}
// FIXED:  name={field.name}
// FIXED:  value={fieldValue} />
// FIXED:  onChange={(e) => handleChange(e)}
 onBlur={() => handleBlur(field.name)}
// FIXED:  placeholder={field.placeholder}
 required={field.required}
// FIXED:  disabled={field.disabled || loading}
 rows={field.rows || 4}
// FIXED:  className={baseInputClasses}
 />
 );

 case 'select':
 return (
 <select
// FIXED:  id={field.name}
// FIXED:  name={field.name}
// FIXED:  value={fieldValue} />
// FIXED:  onChange={(e) => handleChange(e)}
 onBlur={() => handleBlur(field.name)}
 required={field.required}
// FIXED:  disabled={field.disabled || loading}
// FIXED:  className={baseInputClasses}
 >
 <option value="">{field.placeholder || `Select ${field.label}`}</option>
 {field.options?.map((option) => (
 <option key={option.value} value={option.value}>
 {option.label}
// FIXED:  </option>
 ))}
// FIXED:  </select>
 );

 case 'checkbox':
 return (
 <div className="flex items-center">
 <input
// FIXED:  id={field.name}
// FIXED:  name={field.name}
// FIXED:  type="checkbox"
// FIXED:  checked={!!fieldValue} />
// FIXED:  onChange={(e) => handleChange(e)}
 onBlur={() => handleBlur(field.name)}
 required={field.required}
// FIXED:  disabled={field.disabled || loading}
// FIXED:  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
 />
 <label htmlFor={field.name} className="ml-2 text-sm text-gray-900 dark:text-white">
 {field.label}
// FIXED:  </label>
// FIXED:  </div>
 );

 case 'file':
 return (
 <input
// FIXED:  id={field.name}
// FIXED:  name={field.name}
// FIXED:  type="file" />
// FIXED:  onChange={(e) => setValue(field.name, e.target.files?.[0] || null)}
 onBlur={() => handleBlur(field.name)}
 required={field.required}
// FIXED:  disabled={field.disabled || loading}
 accept={field.accept}
// FIXED:  className={baseInputClasses}
 />
 );

 default:
 return (
 <input
// FIXED:  id={field.name}
// FIXED:  name={field.name}
// FIXED:  type={field.type}
// FIXED:  value={fieldValue} />
// FIXED:  onChange={(e) => handleChange(e)}
 onBlur={() => handleBlur(field.name)}
// FIXED:  placeholder={field.placeholder}
 required={field.required}
// FIXED:  disabled={field.disabled || loading}
// FIXED:  className={baseInputClasses}
 />
 );
 };

 return (
 <form onSubmit={(e) => handleFormSubmit(e)} className={`space-y-6 ${className}`}>
 {/* Error message */}
 {error && (
 <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
 <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
// FIXED:  </div>
 )}

 {/* Success message */}
 {success && (
 <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
 <p className="text-green-600 dark:text-green-400 text-sm">{success}</p>
// FIXED:  </div>
 )}

 {/* Form fields */}
 {fields.map((field) => {
 const fieldError = touched[field.name] ? validateField(field, values[field.name]) : null;

 return (
 <div key={field.name} className="space-y-2">
 {field.type !== 'checkbox' && (
 <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
 {field.label}
 {field.required && <span className="text-red-500 ml-1">*</span>}
// FIXED:  </label>
 )}

 {renderField(field)}

 {fieldError && (
 <p className="text-red-500 text-sm">{fieldError}</p>
 )}
// FIXED:  </div>
 );
 })}

 {/* Custom children */}
 {children}

 {/* Form actions */}
 <div className="flex gap-3 pt-4">
 <button
// FIXED:  type="submit"
// FIXED:  disabled={loading || isSubmitting}
// FIXED:  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" />
 >
 {loading || isSubmitting ? 'Loading...' : submitLabel}
// FIXED:  </button>

 {onCancel && (
 <button
// FIXED:  type="button" />
// FIXED:  onClick={(e) => onCancel(e)}
// FIXED:  disabled={loading}
// FIXED:  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
 >
 {cancelLabel}
// FIXED:  </button>
 )}

 {showResetButton && (
 <button
// FIXED:  type="button" />
// FIXED:  onClick={() => {
 reset();
 setTouched({});
 }
// FIXED:  disabled={loading}
// FIXED:  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
 >
 {resetLabel}
// FIXED:  </button>
 )}
// FIXED:  </div>
// FIXED:  </form>
 );
};

export default BaseForm;