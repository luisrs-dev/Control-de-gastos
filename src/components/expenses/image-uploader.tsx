"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";
import { Camera, Upload, X, Loader2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { analyzeExpenseImage } from "@/actions/ai.actions";
import type { AiExtractedData } from "@/types";

interface ImageUploaderProps {
  onImageUploaded: (url: string) => void;
  onAiDataExtracted: (data: AiExtractedData) => void;
  currentImageUrl?: string;
}

export function ImageUploader({
  onImageUploaded,
  onAiDataExtracted,
  currentImageUrl,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentImageUrl ?? null);
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "analyzing" | "done">(
    "idle"
  );
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Solo se permiten imágenes (JPG, PNG, WebP, HEIC)");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("La imagen no puede superar los 10MB");
        return;
      }

      // Local preview
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      setUploadState("uploading");

      try {
        // 1. Upload to Vercel Blob
        const formData = new FormData();
        formData.append("file", file);

        const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

        const uploadRes = await fetch(`${basePath}/api/upload`, {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) throw new Error("Error al subir la imagen");

        const { url } = (await uploadRes.json()) as { url: string };
        onImageUploaded(url);

        // 2. Analyze with Gemini
        setUploadState("analyzing");
        toast.info("🤖 Analizando comprobante con IA...", { duration: 3000 });

        const result = await analyzeExpenseImage(url);

        if (result.data) {
          onAiDataExtracted(result.data);
          setUploadState("done");
          toast.success("✅ Datos extraídos automáticamente. Verifica y ajusta si es necesario.");
        } else {
          setUploadState("done");
          toast.warning("No se pudieron extraer los datos. Completa el formulario manualmente.");
        }
      } catch {
        setUploadState("idle");
        toast.error("Error al procesar la imagen. Inténtalo de nuevo.");
      }
    },
    [onImageUploaded, onAiDataExtracted]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleRemove = () => {
    setPreview(null);
    setUploadState("idle");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const isLoading = uploadState === "uploading" || uploadState === "analyzing";

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-[var(--foreground)]">
        Foto del Comprobante
      </label>

      {preview ? (
        /* Preview */
        <div className="relative rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--muted)]">
          <Image
            src={preview}
            alt="Vista previa del comprobante"
            width={400}
            height={300}
            className="w-full h-48 object-cover"
            unoptimized={preview.startsWith("blob:") || preview.startsWith("/")}
          />

          {/* Status overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
              <p className="text-white text-sm font-medium">
                {uploadState === "uploading" ? "Subiendo imagen..." : "Analizando con IA..."}
              </p>
            </div>
          )}

          {uploadState === "done" && (
            <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
          )}

          {/* Remove button */}
          {!isLoading && (
            <button
              type="button"
              id="remove-image-btn"
              onClick={handleRemove}
              className="absolute top-2 left-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
              aria-label="Eliminar imagen"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        /* Drop zone */
        <div
          role="button"
          tabIndex={0}
          aria-label="Zona de carga de imagen"
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
          }}
          className={cn(
            "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all",
            isDragging
              ? "border-[var(--primary)] bg-[var(--primary)]/5"
              : "border-[var(--border)] hover:border-[var(--primary)]/50 hover:bg-[var(--accent)]"
          )}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[var(--accent)] flex items-center justify-center">
              <Upload className="w-6 h-6 text-[var(--muted-foreground)]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--foreground)]">
                Arrastra la imagen aquí
              </p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                JPG, PNG, WebP o HEIC — máximo 10MB
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-2 w-full mt-2">
              {/* Camera (mobile) */}
              <button
                type="button"
                id="take-photo-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  cameraInputRef.current?.click();
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:bg-[var(--primary)]/90 transition-colors"
              >
                <Camera className="w-4 h-4" />
                Tomar Foto
              </button>

              {/* File picker */}
              <button
                type="button"
                id="pick-file-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--border)] text-sm font-medium hover:bg-[var(--accent)] transition-colors"
              >
                <Upload className="w-4 h-4" />
                Seleccionar Archivo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden inputs */}
      {/* Camera input — activates rear camera on mobile */}
      <input
        ref={cameraInputRef}
        id="camera-input"
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={handleFileChange}
        aria-label="Tomar foto con cámara"
      />
      {/* File picker — no capture attribute for desktop drag&drop */}
      <input
        ref={fileInputRef}
        id="file-input"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        className="sr-only"
        onChange={handleFileChange}
        aria-label="Seleccionar archivo de imagen"
      />
    </div>
  );
}
