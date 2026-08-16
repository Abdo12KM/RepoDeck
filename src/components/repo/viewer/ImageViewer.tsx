"use client";

import { useState, useRef, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getMimeTypeFromPath } from "@/lib/utils/diff";
import { ZoomIn, ZoomOut, RotateCcw, Grid } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageViewerProps {
  content: string; // base64
  fileName: string;
  filePath: string;
  downloadUrl?: string; // GitHub direct download URL (internal fallback)
  src?: string; // direct proxy URL
}

export function ImageViewer({
  content,
  fileName,
  filePath,
  downloadUrl,
  src,
}: ImageViewerProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [showCheckerboard, setShowCheckerboard] = useState(true);
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // mime type detection
  const mimeType = getMimeTypeFromPath(filePath);
  const cleanContent = content ? content.replace(/\s/g, "") : "";
  const dataUri = `data:${mimeType};base64,${cleanContent}`;

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    setDimensions({
      width: target.naturalWidth,
      height: target.naturalHeight,
    });
  };

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    const target = e.target as HTMLImageElement;

    // 1. If direct proxy URL failed, try base64 data URI (if valid)
    const currentUrl = target.src;
    const isProxyUrl =
      currentUrl.includes("/api/github/file") &&
      currentUrl.includes("raw=true");

    if (isProxyUrl) {
      if (cleanContent && cleanContent.length > 0) {
        target.src = dataUri;
      } else if (downloadUrl) {
        target.src = downloadUrl;
      }
      return;
    }

    // 2. If data URI failed, try GitHub download URL
    if (!currentUrl.startsWith("http") && downloadUrl) {
      target.src = downloadUrl;
    }
  };

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 4));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.25));
  const handleResetZoom = () => setZoom(1);

  // Reset zoom on file path change
  useEffect(() => {
    setZoom(1);
    setDimensions(null);
  }, [filePath]);

  return (
    <div className="bg-background relative flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      {/* Top Media Info & Controls Toolbar */}
      <div className="bg-muted/30 flex shrink-0 items-center justify-between border-b px-4 py-2 text-xs">
        <div className="flex items-center gap-2">
          {dimensions && (
            <Badge variant="outline" className="font-mono text-[10px]">
              {dimensions.width} × {dimensions.height} px
            </Badge>
          )}
          <span className="text-muted-foreground font-mono text-[11px] uppercase">
            {mimeType.split("/")[1] || "image"}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setShowCheckerboard(!showCheckerboard)}
            className={cn(
              "h-7 gap-1 px-2 text-xs",
              showCheckerboard && "text-primary",
            )}
            title="Toggle transparency grid"
          >
            <Grid className="h-3.5 w-3.5" />
            <span className="hidden text-[11px] sm:inline">Grid</span>
          </Button>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleZoomOut}
            disabled={zoom <= 0.25}
            className="h-7 w-7"
            title="Zoom out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>

          <span className="text-muted-foreground min-w-10 text-center font-mono text-[11px]">
            {Math.round(zoom * 100)}%
          </span>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleZoomIn}
            disabled={zoom >= 4}
            className="h-7 w-7"
            title="Zoom in"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>

          {zoom !== 1 && (
            <Button
              variant="ghost"
              size="xs"
              onClick={handleResetZoom}
              className="h-7 px-1.5 text-[11px]"
              title="Reset Zoom"
            >
              <RotateCcw className="mr-1 h-3 w-3" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Image Display Surface */}
      <div
        ref={containerRef}
        className={cn(
          "relative flex flex-1 items-center justify-center overflow-auto p-4 select-none sm:p-8",
          showCheckerboard && "bg-checkerboard",
        )}
      >
        <div
          className="transition-transform duration-150 ease-out"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={src || dataUri}
            alt={fileName}
            onLoad={handleImageLoad}
            onError={handleImageError}
            className="max-h-[70vh] max-w-full rounded-md shadow-lg transition-all"
            style={{
              objectFit: "contain",
              display: "block",
            }}
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}

export function ImageSkeleton() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-8">
      <Skeleton className="aspect-video w-full max-w-lg rounded-xl shadow-xs" />
    </div>
  );
}
