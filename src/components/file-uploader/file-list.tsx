'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { File, FileImage, FileText, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FileWithPreview extends File {
  preview?: string;
}

interface FileListProps {
  files: FileWithPreview[];
  onRemove: (index: number) => void;
  className?: string;
}

export function FileList({ files, onRemove, className }: FileListProps) {
  if (files.length === 0) return null;

  // Format file size to human readable format
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file icon based on mime type
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <FileImage className="h-8 w-8 text-primary" />;
    if (file.type === 'application/pdf') return <FileText className="h-8 w-8 text-primary" />;
    return <File className="h-8 w-8 text-primary" />;
  };

  return (
    <div className={cn('grid gap-4', className)}>
      {files.map((file, index) => (
        <Card key={`${file.name}-${index}`} className="overflow-hidden">
          <CardContent className="p-3">
            <div className="flex items-center gap-4">
              {file.type.startsWith('image/') && file.preview ? (
                <div className="relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden">
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-md bg-primary/5">
                  {getFileIcon(file)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <button
                type="button"
                className="p-1 rounded-full hover:bg-primary/10 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(index);
                }}
                aria-label={`Remove ${file.name}`}
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
