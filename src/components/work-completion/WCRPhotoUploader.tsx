"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { toast } from "@/components/ui/Toast";
import {
  PhotoStorageService,
  validatePhotoFile,
} from "@/lib/storage/photo-service";
import {
  MAX_PHOTOS_PER_REPORT,
  type WCRPhotoAttachment,
} from "@/lib/storage/types";
import {
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  AlertCircle,
  CheckCircle2,
  FileText,
} from "lucide-react";

interface WCRPhotoUploaderProps {
  category?: 'BEFORE' | 'AFTER';
  reportId: string;
  photos: WCRPhotoAttachment[];
  onChange: (photos: WCRPhotoAttachment[]) => void;
  disabled?: boolean;
}

export function WCRPhotoUploader({
  reportId,
  photos,
  onChange,
  disabled = false,
}: WCRPhotoUploaderProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [dragActive, setDragActive] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    if (photos.length + files.length > MAX_PHOTOS_PER_REPORT) {
      toast.error(
        `Maximum limit reached. You can only attach up to ${MAX_PHOTOS_PER_REPORT} photos per report.`
      );
      return;
    }

    setIsUploading(true);
    const newPhotos: WCRPhotoAttachment[] = [...photos];
    let addedCount = 0;
    let liveCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = validatePhotoFile(file);
      if (!validation.valid) {
        toast.error(`${file.name}: ${validation.error}`);
        continue;
      }

      const result = await PhotoStorageService.uploadWCRPhoto(
        file,
        category,
        reportId || "temp_report"
      );

      if (result.success && result.photo) {
        newPhotos.push(result.photo);
        addedCount++;
        if (result.isLiveStorage) liveCount++;
      } else {
        toast.error(`Failed to upload ${file.name}: ${result.error}`);
      }
    }

    setIsUploading(false);
    onChange(newPhotos);

    if (addedCount > 0) {
      if (liveCount > 0) {
        toast.success(
          `Attached ${addedCount} photo(s) (Stored securely in Supabase Storage).`
        );
      } else {
        toast.info(
          `Attached ${addedCount} photo(s) locally. Live Supabase Storage bucket verification is pending.`
        );
      }
    }
  };

  const handleCaptionChange = (id: string, caption: string) => {
    const updated = photos.map((p) => (p.id === id ? { ...p, caption } : p));
    onChange(updated);
  };

  const handleRemovePhoto = (id: string) => {
    const updated = photos.filter((p) => p.id !== id);
    onChange(updated);
    toast.success("Photo removed from report.");
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Drop Zone */}
      {!disabled && photos.length < MAX_PHOTOS_PER_REPORT && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragActive
              ? "border-[#2563EB] bg-slate-50"
              : "border-slate-300 hover:border-[#2563EB] bg-slate-50/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.jpg,.jpeg,.png,.webp,.jfif,.pjpeg,.pjp,.avif,.heic,.heif,.bmp,.tiff,.tif,.svg"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="p-3 bg-white rounded-full border border-slate-200 shadow-xs">
              <UploadCloud className="w-6 h-6 text-[#2563EB]" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-slate-800">
                Click to upload or drag & drop site inspection photos
              </p>
              <p className="text-[11px] text-slate-500">
                Supports all image formats: JPG, JPEG, PNG, WebP, JFIF, HEIC, etc. (Max 15MB each • Up to {MAX_PHOTOS_PER_REPORT} photos)
              </p>
            </div>
            {isUploading && (
              <Badge variant="warning" size="sm">
                Processing photos...
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Photo List & Metadata Grid */}
      {photos.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
            <span>Attached Photos ({photos.length}/{MAX_PHOTOS_PER_REPORT})</span>
            <span className="text-[11px] text-slate-400">
              Photos will be embedded in official WCR documentation
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                className="flex flex-col sm:flex-row gap-3 p-3 bg-white rounded-lg border border-slate-200 shadow-2xs hover:border-slate-300 transition-all"
              >
                {/* Thumbnail */}
                <div className="relative w-full sm:w-24 h-24 rounded-md overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                  {photo.dataUrl || photo.url ? (
                    <img
                      src={photo.dataUrl || photo.url}
                      alt={photo.caption || photo.fileName}
                      onError={(e) => {
                        if (photo.dataUrl && (e.currentTarget as HTMLImageElement).src !== photo.dataUrl) {
                          (e.currentTarget as HTMLImageElement).src = photo.dataUrl;
                        }
                      }}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-slate-400">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                  <span className="absolute top-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                    #{index + 1}
                  </span>
                </div>

                {/* Details & Caption */}
                <div className="flex-1 flex flex-col justify-between space-y-2 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate" title={photo.fileName}>
                        {photo.fileName}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {(photo.fileSize / 1024).toFixed(0)} KB • {photo.mimeType.split("/")[1]?.toUpperCase()}
                      </p>
                    </div>

                    {!disabled && (
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(photo.id)}
                        className="text-slate-400 hover:text-red-600 transition-colors p-1"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Caption Input */}
                  <div>
                    <input
                      type="text"
                      disabled={disabled}
                      value={photo.caption || ""}
                      onChange={(e) => handleCaptionChange(photo.id, e.target.value)}
                      placeholder="Add site photo caption / observation..."
                      className="w-full text-[11px] px-2.5 py-1.5 rounded bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#2563EB] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-4 bg-slate-50/50 rounded border border-dashed border-slate-200 text-slate-400 text-xs">
          No site inspection photos attached to this report.
        </div>
      )}
    </div>
  );
}

