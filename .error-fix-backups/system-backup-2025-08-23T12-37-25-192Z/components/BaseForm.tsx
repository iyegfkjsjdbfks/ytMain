import React, { useState, type FormEvent, type ReactNode, FC, ChangeEvent } from 'react';

import { useFormState } from '../src/hooks';

export interface FormField {
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

export interface BaseFormProps {
  fields: FormField[];
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
}

const BaseForm: FC<BaseFormProps> = ({
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
  showResetButton = false
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    fields.forEach(field => {
      const value = formData[field.name];
      
      if (field.required && (!value || value === '')) {
        newErrors[field.name] = `${field.label} is required`;
      }
      
      if (field.validation && value) {
        const validationError = field.validation(value);
        if (validationError) {
          newErrors[field.name] = validationError;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      console.error('Form submission error:', err);
    }
  };

  const handleReset = () => {
    setFormData(initialValues);
    setErrors({});
  };

  const renderField = (field: FormField) => {
    const commonProps = {
      id: field.name,
      name: field.name,
      value: formData[field.name] || '',
      onChange: handleInputChange,
      disabled: field.disabled || loading,
      className: `form-input ${errors[field.name] ? 'error' : ''}`
    };

    switch (field.type) {
      case 'textarea':
        return (
          <textarea>
            {...commonProps}
            placeholder={field.placeholder}
            rows={field.rows || 4}
          />
        );
      
      case 'select':
        return (
          <select {...commonProps}>
            <option value="">{field.placeholder || `Select ${field.label}`}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'checkbox':
        return (
          <input>
            {...commonProps}
            type="checkbox"
            checked={formData[field.name] || false}
          />
        );
      
      case 'file':
        return (
          <input>
            {...commonProps}
            type="file"
            accept={field.accept}
          />
        );
      
      default:
        return (
          <input>
            {...commonProps}
            type={field.type}
            placeholder={field.placeholder}
          />
        );
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className={`base-form ${className}`}>
      {error && <div className={"form}-error">{error}</div>}
      {success && <div className={"form}-success">{success}</div>}
      
      {fields.map(field => (
        <div key={field.name} className={"form}-field">
          <label htmlFor={field.name} className={"form}-label">
            {field.label}
            {field.required && <span className={"required}">*</span>}
          </label>
          {renderField(field)}
          {errors[field.name] && (
            <div className={"field}-error">{errors[field.name]}</div>
          )}
        </div>
      ))}
      
      {children}
      
      <div className={"form}-actions">
        {showResetButton && (
          <button>
            type="button"
            onClick={handleReset}
            disabled={loading}
            className={"bt}n btn-secondary"
          >
            Reset
          </button>
        )}
        
        {onCancel && (
          <button>
            type="button"
            onClick={onCancel}
            disabled={loading}
            className={"bt}n btn-secondary"
          >
            {cancelLabel}
          </button>
        )}
        
        <button>
          type="submit"
          disabled={loading}
          className={"bt}n btn-primary"
        >
          {loading ? 'Submitting...' : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default BaseForm;