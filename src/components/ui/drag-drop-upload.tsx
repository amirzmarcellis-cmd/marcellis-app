import * as React from "react";
import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Upload, File, X, FileText } from "lucide-react";
import { Button } from "./button";

interface DragDropUploadProps {
  accept?: string;
  value?: File | null;
  onChange?: (file: File | null) => void;
  className?: string;
}

export function DragDropUpload({
  accept = ".pdf,.doc,.docx",
  value,
  onChange,
  className,
}: DragDropUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        onChange?.(files[0]);
      }
    },
    [onChange]
  );

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange?.(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      {!value ? (
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-all duration-200",
            "hover:border-primary/50 hover:bg-primary/5",
            isDragging
              ? "border-primary bg-primary/10 shadow-[0_0_20px_hsl(var(--primary)/0.15)]"
              : "border-border/50 bg-background/50"
          )}
        >
          <div className="flex flex-col items-center gap-2">
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
                isDragging ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
              )}
            >
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {isDragging ? "Drop file here" : "Drag & drop or click to upload"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                PDF, DOC, DOCX up to 10MB
              </p>
            </div>
          </div>

          {/* Animated border on drag */}
          {isDragging && (
            <div className="pointer-events-none absolute inset-0 rounded-lg">
              <div className="absolute inset-0 animate-pulse rounded-lg border-2 border-primary/50" />
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-card/50 p-3 transition-all hover:border-border">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {value.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(value.size)}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
