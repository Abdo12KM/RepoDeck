"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { File, Folder, FolderOpen } from "lucide-react";
import { getFileIconPath, getFolderIconPath } from "@/lib/icons/resolver";

interface FileIconProps {
  name: string;
  isFolder?: boolean;
  isOpen?: boolean;
  className?: string;
}

export const FileIcon = React.memo(
  ({
    name,
    isFolder = false,
    isOpen = false,
    className = "w-4 h-4",
  }: FileIconProps) => {
    const { resolvedTheme } = useTheme();
    const [error, setError] = useState(false);

    // Cast resolvedTheme to our expected type
    const currentTheme = resolvedTheme === "light" ? "light" : "dark";

    // Reset error state if the theme or name changes
    useEffect(() => {
      setError(false);
    }, [name, currentTheme]);

    // If image fails to load, use Lucide fallback
    if (error) {
      if (isFolder) {
        return isOpen ? (
          <FolderOpen className={className} />
        ) : (
          <Folder className={className} />
        );
      }
      return <File className={className} />;
    }

    const src = isFolder
      ? getFolderIconPath(name, isOpen, currentTheme)
      : getFileIconPath(name, currentTheme);

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        key={src} // Key helps force re-render on theme change to avoid "flicker" of wrong icon
        src={src}
        alt={`${name} icon`}
        title={name}
        className={className}
        onError={() => setError(true)}
        loading="lazy"
        // Prevent dragging the icon image
        onDragStart={(e) => e.preventDefault()}
      />
    );
  },
);

FileIcon.displayName = "FileIcon";
