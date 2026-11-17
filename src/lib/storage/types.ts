export interface WCRPhotoAttachment {
  id: string;
  reportId: string;
  fileName: string;
  storagePath: string;
  url: string; // Base64 or signed/public URL
  dataUrl?: string; // Compressed base64 string for PDFs
  category?: 'BEFORE' | 'AFTER';
  mimeType: string;
  fileSize: number; // In bytes
  caption?: string;
  uploadedAt: string;
  uploadedBy?: string;
}

export interface PhotoUploadResult {
  success: boolean;
  photo?: WCRPhotoAttachment;
  error?: string;
  isLiveStorage: boolean;
}

export const ALLOWED_PHOTO_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".jfif",
  ".pjpeg",
  ".pjp",
  ".avif",
  ".heic",
  ".heif",
  ".bmp",
  ".tiff",
  ".tif",
  ".svg",
  ".gif",
];

export const ALLOWED_PHOTO_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/jfif",
  "image/pjpeg",
  "image/avif",
  "image/heic",
  "image/heif",
  "image/bmp",
  "image/tiff",
  "image/svg+xml",
  "image/gif",
];

export const MAX_PHOTO_FILE_SIZE = 15 * 1024 * 1024; // 15MB
export const MAX_PHOTOS_PER_REPORT = 20;

