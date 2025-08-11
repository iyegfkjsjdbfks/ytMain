
import { useState, useRef, FC } from 'react';

import { DocumentIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';

export interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in bytes
  onFileSelect: (files: File) => void;
  onFileRemove?: (index: number) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  description?: string;
  files?: File;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  accept,
  multiple = false,
  maxSize,
  onFileSelect,
  onFileRemove,
  disabled = false,
  className = '',
  label = 'Upload files',
  description = 'Drag and drop files here, or click to select',
  files = [],
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) {
return;
}

    const fileArray = Array.from(selectedFiles);

    // Validate file size
    if (maxSize) {
      const oversizedFiles = fileArray.filter((file) => file.size > maxSize);
      if (oversizedFiles.length > 0) {
        setError(`Some files exceed the maximum size of ${formatFileSize(maxSize)}`);
        return;
      }
    }

    setError(null);
    onFileSelect(fileArray);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (!disabled) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const formatFileSize = (bytes: any): string => {
    if (bytes === 0) {
return '0 Bytes';
}
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))  } ${  sizes[i]}`;
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          isDragOver
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/10'
            : 'border-neutral-300 dark:border-neutral-600'
        } ${
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer hover:border-neutral-400 dark:hover:border-neutral-500'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled}
        />

        <div className="text-center">
          <CloudArrowUpIcon className="mx-auto h-12 w-12 text-neutral-400" />
          <div className="mt-4">
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {label}
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              {description}
            </p>
            {maxSize && (
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                Maximum file size: {formatFileSize(maxSize)}
              </p>
            )}
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            Selected Files ({files.length})
          </h4>
          <div className="space-y-2">
            {files.map((file: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <DocumentIcon className="h-5 w-5 text-neutral-400" />
                  <div>
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {file.name}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                {onFileRemove && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onFileRemove(index);
                    }}
                    className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};