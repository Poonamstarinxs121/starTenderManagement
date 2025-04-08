import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface FileUploaderProps {
  accept?: string;
  maxSize?: number;
  onUpload: (file: File) => void;
  className?: string;
}

export function FileUploader({
  accept,
  maxSize,
  onUpload,
  className,
}: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setFile(file);
      setError(null);
      onUpload(file);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept ? { [accept]: [] } : undefined,
    maxSize,
    multiple: false,
  });

  const removeFile = () => {
    setFile(null);
    setError(null);
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          error && "border-destructive"
        )}
      >
        <input {...getInputProps()} />
        {file ? (
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm">{file.name}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                removeFile();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div className="text-sm">
              {isDragActive ? (
                <p>Drop the file here</p>
              ) : (
                <p>Drag & drop a file here, or click to select</p>
              )}
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 