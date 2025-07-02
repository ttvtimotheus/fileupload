'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { DropZone } from './drop-zone';
import { FileList, FileWithPreview } from './file-list';
import { UploadProgress } from './upload-progress';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploaderProps {
  className?: string;
  maxFiles?: number;
  maxSize?: number; // in bytes
}

export function FileUploader({ 
  className,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024 // 10MB default
}: FileUploaderProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fileUrls, setFileUrls] = useState<Record<string, string>>({});
  
  // Generate preview URLs for image files
  useEffect(() => {
    // Clean up preview URLs when component unmounts
    return () => {
      files.forEach(file => {
        if (file.preview) URL.revokeObjectURL(file.preview);
      });
    };
  }, []);

  const handleFilesAdded = useCallback((newFiles: File[]) => {
    if (files.length + newFiles.length > maxFiles) {
      toast.error(`You can only upload a maximum of ${maxFiles} files`);
      return;
    }

    const filesToAdd: FileWithPreview[] = newFiles.map(file => {
      // Generate preview for image files
      if (file.type.startsWith('image/')) {
        return Object.assign(file, {
          preview: URL.createObjectURL(file)
        });
      }
      return file as FileWithPreview;
    });

    setFiles(prevFiles => [...prevFiles, ...filesToAdd]);
  }, [files.length, maxFiles]);

  const handleRemoveFile = (index: number) => {
    setFiles(prevFiles => {
      const newFiles = [...prevFiles];
      const file = newFiles[index];
      
      // Clean up preview URL if it exists
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select at least one file to upload');
      return;
    }

    setIsUploading(true);
    setProgress({});
    setCompleted({});
    setErrors({});

    try {
      // Create a new FormData instance to send files
      const formData = new FormData();
      
      // Get CSRF token from meta tag
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
      
      // Upload each file with progress tracking
      const uploadPromises = files.map((file, index) => {
        const fileKey = `${file.name}-${index}`;
        
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          
          // Track upload progress
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const percentComplete = Math.round((event.loaded / event.total) * 100);
              setProgress(prev => ({ ...prev, [fileKey]: percentComplete }));
            }
          });
          
          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              console.log('Upload successful for:', file.name, 'Response:', xhr.response);
              setCompleted(prev => ({ ...prev, [fileKey]: true }));
              
              // Get the file URL from response
              const response = xhr.response;
              if (response && response.fileUrl) {
                console.log('File URL received:', response.fileUrl);
                setFileUrls(prev => ({
                  ...prev,
                  [fileKey]: response.fileUrl
                }));
                // Show success toast with link
                toast("File uploaded successfully", {
                  description: (
                    <a 
                      href={response.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      View file
                    </a>
                  ),
                  action: {
                    label: "Copy link",
                    onClick: () => {
                      navigator.clipboard.writeText(response.fileUrl);
                      toast.success("Link copied to clipboard");
                    }
                  }
                });
              } else {
                console.error('No file URL in response:', response);
              }
              
              resolve(xhr.response);
            } else {
              setErrors(prev => ({ ...prev, [fileKey]: `Upload failed (${xhr.status})` }));
              reject(new Error(`Upload failed: ${xhr.statusText}`));
            }
          });
          
          xhr.addEventListener('error', () => {
            setErrors(prev => ({ ...prev, [fileKey]: 'Network error' }));
            reject(new Error('Network error'));
          });
          
          // Start the upload
          xhr.open('POST', '/api/upload');
          xhr.responseType = 'json'; // Set response type to JSON
          xhr.setRequestHeader('X-CSRF-Token', csrfToken);
          
          // Create individual form data for this file
          const singleFileData = new FormData();
          singleFileData.append('file', file);
          singleFileData.append('csrfToken', csrfToken); // Add CSRF token to form data
          
          xhr.send(singleFileData);
        });
      });
      
      // Wait for all uploads to complete
      await Promise.allSettled(uploadPromises);
      
      // Check if any uploads failed
      const hasErrors = Object.keys(errors).length > 0;
      if (!hasErrors) {
        toast.success(`Successfully uploaded ${files.length} file${files.length === 1 ? '' : 's'}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('An unexpected error occurred during upload');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      <DropZone 
        onFilesAdded={handleFilesAdded}
        maxFiles={maxFiles}
        className="min-h-[200px]"
      />
      
      {files.length > 0 && (
        <>
          <FileList 
            files={files} 
            onRemove={handleRemoveFile}
          />
          
          {isUploading && (
            <UploadProgress 
              files={files}
              progress={progress}
              completed={completed}
              errors={errors}
              fileUrls={fileUrls}
              className="mt-6"
            />
          )}
          
          <div className="flex justify-end">
            <Button 
              type="button"
              onClick={handleUpload}
              disabled={isUploading || files.length === 0}
              className="mt-2"
            >
              <UploadCloud className="mr-2 h-4 w-4" />
              {isUploading ? 'Uploading...' : 'Upload Files'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
