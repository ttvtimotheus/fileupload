'use client';

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { FileWithPreview } from './file-list';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Check, FileIcon, Loader2 } from 'lucide-react';

interface UploadProgressProps {
  files: FileWithPreview[];
  progress: Record<string, number>;
  completed: Record<string, boolean>;
  errors: Record<string, string>;
  fileUrls: Record<string, string>;
  shareableUrls: Record<string, string>;
  className?: string;
}

export function UploadProgress({
  files,
  progress,
  completed,
  errors,
  fileUrls,
  shareableUrls,
  className
}: UploadProgressProps) {
  if (files.length === 0) return null;

  return (
    <div className={cn('space-y-2', className)}>
      {files.map((file, index) => {
        const key = `${file.name}-${index}`;
        const fileProgress = progress[key] || 0;
        const isCompleted = completed[key] || false;
        const error = errors[key];

        return (
          <Card key={key} className="overflow-hidden">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate" title={file.name}>
                    {file.name}
                  </p>
                  <div className="mt-2">
                    <Progress value={fileProgress} className="h-2" />
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary" />
                    </div>
                  ) : error ? (
                    <div className="text-xs text-destructive">Failed</div>
                  ) : (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </div>
              {error && (
                <p className="mt-2 text-xs text-destructive">{error}</p>
              )}
              
              {isCompleted && shareableUrls[key] && (
                <div className="mt-2 text-xs">
                  <p className="text-muted-foreground mb-1">Shareable link:</p>
                  <a 
                    href={shareableUrls[key]} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline break-all"
                  >
                    {shareableUrls[key]}
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(shareableUrls[key]);
                      toast.success("Link copied to clipboard");
                    }}
                    className="ml-2 text-xs text-primary hover:underline"
                  >
                    Copy
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
