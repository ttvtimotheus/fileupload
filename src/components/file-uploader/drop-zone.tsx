'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Cloud, File, FileImage, FileText, Plus } from 'lucide-react';

// Define accepted file types and size limit
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'application/pdf': ['.pdf']
};

interface DropZoneProps {
  onFilesAdded: (files: File[]) => void;
  maxFiles?: number;
  className?: string;
}

export function DropZone({ onFilesAdded, maxFiles = 5, className }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: any[]) => {
      // Handle file rejections
      if (fileRejections.length > 0) {
        fileRejections.forEach((rejection) => {
          const { file, errors } = rejection;
          if (errors[0]?.code === 'file-too-large') {
            toast.error(`"${file.name}" is too large (max: 10MB)`);
          } else if (errors[0]?.code === 'file-invalid-type') {
            toast.error(`"${file.name}" is not an accepted file type (jpg, png, pdf)`);
          } else {
            toast.error(`"${file.name}": ${errors[0]?.message}`);
          }
        });
        return;
      }

      onFilesAdded(acceptedFiles);
    },
    [onFilesAdded]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_SIZE,
    maxFiles,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false)
  });

  // Get file icon based on mime type
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <FileImage className="h-8 w-8 text-primary" />;
    if (fileType === 'application/pdf') return <FileText className="h-8 w-8 text-primary" />;
    return <File className="h-8 w-8 text-primary" />;
  };

  return (
    <div
      {...getRootProps()}
      className={cn(
        'relative rounded-lg border-2 border-dashed border-primary/20 p-6 transition-colors',
        isDragActive || isDragging ? 'bg-primary/5' : 'bg-card hover:bg-primary/5',
        className
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center space-y-2 text-center">
        <Cloud className="h-10 w-10 text-primary/80" />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Drag files here or click to upload</h3>
          <p className="text-sm text-muted-foreground">
            Upload up to {maxFiles} files (PDF, JPG, PNG) - Max 10MB each
          </p>
        </div>
        <Button type="button" variant="secondary" size="sm" className="mt-2">
          <Plus className="mr-2 h-4 w-4" />
          Select Files
        </Button>
      </div>
    </div>
  );
}
