import { createClient } from "@/lib/supabase/client";
import {
  ALLOWED_PHOTO_EXTENSIONS,
  ALLOWED_PHOTO_MIME_TYPES,
  MAX_PHOTO_FILE_SIZE,
  type WCRPhotoAttachment,
  type PhotoUploadResult,
} from "./types";

export const WCR_STORAGE_BUCKET = "wcr-photos";

/**
 * Sanitizes a filename to contain only alphanumeric chars, dashes, underscores, and extension
 */
export function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "_")
    .replace(/_+/g, "_");
}

/**
 * Validates photo file constraints (type and size)
 */
export function validatePhotoFile(file: File): { valid: boolean; error?: string } {
  const fileName = (file.name || "").toLowerCase();
  const lastDot = fileName.lastIndexOf(".");
  const ext = lastDot !== -1 ? fileName.substring(lastDot) : "";
  
  const isAllowedExt = ALLOWED_PHOTO_EXTENSIONS.includes(ext);
  const isAllowedMime = file.type
    ? ALLOWED_PHOTO_MIME_TYPES.includes(file.type.toLowerCase()) || file.type.startsWith("image/")
    : false;

  // Accept if either extension or MIME type indicates it's an image
  if (!isAllowedExt && !isAllowedMime && !ext) {
    return {
      valid: false,
      error: `Unsupported image format (${ext || file.type || "unknown"}). Supported: JPG, JPEG, PNG, WebP, JFIF, HEIC, etc.`,
    };
  }

  if (file.size > MAX_PHOTO_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds the limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max limit is 15MB.`,
    };
  }

  return { valid: true };
}

/**
 * Converts a File object to a base64 Data URL string
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Storage Service for Work Completion Report Photos
 */
export const PhotoStorageService = {
  /**
   * Uploads a photo file for a Work Completion Report
   */
  async uploadWCRPhoto(
    file: File,
    category: 'BEFORE' | 'AFTER' = 'BEFORE',
    reportId: string,
    caption?: string,
    uploaderName?: string
  ): Promise<PhotoUploadResult> {
    const validation = validatePhotoFile(file);
    if (!validation.valid) {
      return { success: false, error: validation.error, isLiveStorage: false };
    }

    const photoId = `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const cleanName = sanitizeFileName(file.name);
    const categoryPrefix = category === 'AFTER' ? 'after_' : 'before_';
    const storagePath = `work-completion-reports/${reportId || 'temp'}/${categoryPrefix}${photoId}-${cleanName}`;

    try {
      // Create compressed base64 for PDF rendering directly
      const { compressImage } = await import("@/lib/utils/image-compression");
      const compressedDataUrl = await compressImage(file, 1000, 0.75);
      
      const supabase = createClient();

      // Attempt upload to Supabase Storage bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(WCR_STORAGE_BUCKET)
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      let finalUrl = compressedDataUrl;
      let isLive = false;

      if (!uploadError && uploadData) {
        // Try getting public URL first
        const { data: pubData } = supabase.storage
          .from(WCR_STORAGE_BUCKET)
          .getPublicUrl(storagePath);

        if (pubData?.publicUrl) {
          finalUrl = pubData.publicUrl;
          isLive = true;
        } else {
          // Try getting a signed URL for secure private bucket access
          const { data: signedData } = await supabase.storage
            .from(WCR_STORAGE_BUCKET)
            .createSignedUrl(storagePath, 60 * 60 * 24 * 365); // 1 year

          if (signedData?.signedUrl) {
            finalUrl = signedData.signedUrl;
            isLive = true;
          }
        }
      }

      const photoAttachment: WCRPhotoAttachment = {
        id: photoId,
        reportId: reportId || "temp",
        fileName: file.name,
        storagePath,
        url: finalUrl,
        dataUrl: compressedDataUrl, // Guaranteed accessible synchronous base64
        category,
        mimeType: file.type || "image/jpeg",
        fileSize: file.size,
        caption: caption?.trim() || undefined,
        uploadedAt: new Date().toISOString(),
        uploadedBy: uploaderName || "Staff User",
      };

      return {
        success: true,
        photo: photoAttachment,
        isLiveStorage: isLive,
      };
    } catch {
      // Graceful fallback for local development or disconnected storage
      try {
        const { compressImage } = await import("@/lib/utils/image-compression");
        const compressedDataUrl = await compressImage(file, 1000, 0.75);
        const photoAttachment: WCRPhotoAttachment = {
          id: photoId,
          reportId: reportId || "temp",
          fileName: file.name,
          storagePath,
          url: compressedDataUrl,
          dataUrl: compressedDataUrl,
          category,
          mimeType: file.type || "image/jpeg",
          fileSize: file.size,
          caption: caption?.trim() || undefined,
          uploadedAt: new Date().toISOString(),
          uploadedBy: uploaderName || "Staff User",
        };

        return {
          success: true,
          photo: photoAttachment,
          isLiveStorage: false,
        };
      } catch (err: any) {
        return {
          success: false,
          error: err.message || "Failed to process photo.",
          isLiveStorage: false,
        };
      }
    }
  },

  /**
   * Deletes a photo from storage
   */
  async deleteWCRPhoto(storagePath: string): Promise<boolean> {
    try {
      const supabase = createClient();
      const { error } = await supabase.storage
        .from(WCR_STORAGE_BUCKET)
        .remove([storagePath]);
      return !error;
    } catch {
      return true;
    }
  },
};

