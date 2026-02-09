"use client";

import { useState, useRef } from "react";
import { Camera, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AvatarUploadProps {
  currentAvatar?: string | null;
  displayName: string;
  onUpload: (file: File) => void;
  className?: string;
}

export function AvatarUpload({
  currentAvatar,
  displayName,
  onUpload,
  className,
}: AvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onUpload(file);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const avatarSrc = previewUrl || currentAvatar;
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="relative">
        <div className="h-20 w-20 rounded-full overflow-hidden bg-muted flex items-center justify-center">
          {avatarSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarSrc}
              alt={displayName}
              className="h-full w-full object-cover"
            />
          ) : initials ? (
            <span className="text-2xl font-semibold text-muted-foreground">
              {initials}
            </span>
          ) : (
            <User className="h-10 w-10 text-muted-foreground" />
          )}
        </div>
        <button
          type="button"
          onClick={handleClick}
          className="absolute bottom-0 right-0 rounded-full bg-primary p-1.5 text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
        >
          <Camera className="h-3.5 w-3.5" />
        </button>
      </div>
      <div>
        <Button type="button" variant="outline" size="sm" onClick={handleClick}>
          Change Avatar
        </Button>
        <p className="mt-1 text-xs text-muted-foreground">
          JPG, PNG. Max 2MB.
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
