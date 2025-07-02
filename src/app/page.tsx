import { FileUploader } from '@/components/file-uploader/file-uploader';
import { v4 as uuidv4 } from 'uuid';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster } from 'sonner';

export default function Home() {
  // Generate a CSRF token that will be included in the HTML
  // and sent with requests via a header
  const csrfToken = uuidv4();
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 md:p-8">
      <main className="container mx-auto max-w-3xl">
        {/* CSRF token meta tag for client-side use */}
        <meta name="csrf-token" content={csrfToken} />
        
        {/* Toaster component for notifications */}
        <Toaster position="top-center" richColors />
        
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">Secure File Uploader</h1>
            <p className="mt-2 text-muted-foreground">
              Upload your files securely with drag-and-drop functionality
            </p>
          </div>
          
          <Card className="border-muted/30 shadow-md">
            <CardHeader>
              <CardTitle>Upload Files</CardTitle>
              <CardDescription>
                Drag and drop files or click to select. Supported formats: PDF, JPG, PNG (Max: 10MB per file)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUploader maxFiles={5} maxSize={10 * 1024 * 1024} />
            </CardContent>
          </Card>
          
          <div className="text-center text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} Secure File Uploader. Built with Next.js 15.3.4, TailwindCSS, and shadcn/ui.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
