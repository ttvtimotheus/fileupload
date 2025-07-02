'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Copy, FileIcon, FileImage, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface FileData {
  name: string;
  type: string;
  url: string;
}

export default function SharedFilePage() {
  const params = useParams();
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fileId = params.id as string;
  
  useEffect(() => {
    // Reconstruct the file URL based on the ID
    const filename = fileId;
    const fileUrl = `/uploads/${filename}`;
    
    // For demo, we'll just check if the file exists by trying to fetch it
    fetch(fileUrl, { method: 'HEAD' })
      .then(response => {
        if (response.ok) {
          // Extract file type from URL
          const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl);
          const isPdf = /\.pdf$/i.test(fileUrl);
          
          const type = isImage ? 'image' : isPdf ? 'pdf' : 'file';
          
          setFileData({
            name: filename,
            type: type,
            url: fileUrl
          });
        } else {
          setError('File not found');
        }
      })
      .catch(() => {
        setError('Could not access the file');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [fileId]);
  
  // Handle copy link to clipboard
  const handleCopyLink = () => {
    const fullUrl = `${window.location.origin}/shared/${fileId}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success('Link copied to clipboard');
  };
  
  // Render file preview based on type
  const renderFilePreview = () => {
    if (!fileData) return null;
    
    if (fileData.type === 'image') {
      return (
        <div className="flex justify-center overflow-hidden rounded-md max-h-96">
          <img 
            src={fileData.url} 
            alt={fileData.name} 
            className="object-contain w-full h-full"
          />
        </div>
      );
    } else if (fileData.type === 'pdf') {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-muted/20 rounded-md">
          <FileText size={64} className="text-primary mb-2" />
          <p className="text-lg font-medium">{fileData.name}</p>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-muted/20 rounded-md">
          <FileIcon size={64} className="text-primary mb-2" />
          <p className="text-lg font-medium">{fileData.name}</p>
        </div>
      );
    }
  };
  
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-muted-foreground">Loading file...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-xl text-center">File Not Found</CardTitle>
          </CardHeader>
          <CardContent className="py-6 text-center">
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
          <CardFooter className="flex justify-center pb-6">
            <Link href="/">
              <Button>Return to Home</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-xl text-center">Shared File</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderFilePreview()}
        </CardContent>
        <CardFooter className="flex flex-wrap gap-3 justify-center pb-6">
          <Button 
            variant="outline" 
            onClick={handleCopyLink}
          >
            <Copy size={16} className="mr-2" /> 
            Copy Link
          </Button>
          <Button asChild>
            <a href={fileData?.url} download>
              <Download size={16} className="mr-2" /> 
              Download
            </a>
          </Button>
          <Link href="/">
            <Button variant="ghost">Return to Uploader</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
