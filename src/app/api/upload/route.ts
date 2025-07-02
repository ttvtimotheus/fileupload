import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { existsSync } from 'fs';
import { headers } from 'next/headers';

// Define accepted file types and size limit
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'application/pdf'
];

// Get the uploads directory from env or use default
const getUploadDir = () => {
  return process.env.UPLOAD_DIR || 'public/uploads';
};

// Ensure upload directory exists
async function ensureUploadDirExists() {
  const uploadDir = getUploadDir();
  
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true });
  }
  
  return uploadDir;
}

export async function POST(request: NextRequest) {
  try {
    // Simple CSRF validation (compare header token with form token)
    const csrfHeader = request.headers.get('X-CSRF-Token');
    const formData = await request.formData();
    const csrfFormToken = formData.get('csrfToken') as string | null;
    
    // If tokens don't match or are missing, reject the request
    if (!csrfHeader || !csrfFormToken || csrfHeader !== csrfFormToken) {
      return NextResponse.json(
        { error: 'Invalid or missing CSRF token' },
        { status: 403 }
      );
    }

    // Get file from form data
    const file = formData.get('file') as File | null;

    // Validate file exists
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed. Allowed types: JPEG, PNG, PDF' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds the 10MB limit' },
        { status: 400 }
      );
    }

    // Prepare the file buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate a unique filename to prevent overwriting
    const originalName = file.name;
    const fileExtension = originalName.split('.').pop();
    const uniqueFilename = `${uuidv4()}.${fileExtension}`;

    // Ensure upload directory exists
    const uploadDir = await ensureUploadDirExists();
    const filePath = join(uploadDir, uniqueFilename);
    
    // Write the file
    await writeFile(filePath, buffer);

    // Get the base URL from headers or environment variables
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    
    // Generate direct file URL and shareable URL
    const directFileUrl = `/uploads/${uniqueFilename}`;
    const shareableUrl = `${protocol}://${host}/shared/${uniqueFilename}`;
    const fullFileUrl = `${protocol}://${host}${directFileUrl}`;
      
    // Log details for debugging
    console.log('File uploaded successfully:', {
      fileName: originalName,
      uniqueFilename,
      fullFileUrl,
      shareableUrl
    });
    
    // Return success response with URLs
    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      fileName: originalName,
      fileSize: file.size,
      fileType: file.type,
      fileUrl: fullFileUrl,     // Full direct URL to file
      shareableUrl: shareableUrl, // URL to sharing page
      uniqueFilename: uniqueFilename
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
