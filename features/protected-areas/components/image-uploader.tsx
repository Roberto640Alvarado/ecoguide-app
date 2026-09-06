"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import Image from "next/image";
import { Spinner } from "@heroui/react";
import { ImagePlus, UploadCloud, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguageStore } from "@/store/language-store";
import { useUploadProtectedAreaImage } from "../hooks/use-upload-protected-area-image";

const MAX_IMAGES = 10;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
}

/**
 * Sube imágenes a Cloudinary una por una (vía /upload-files) y mantiene el
 * arreglo de URLs resultante. El componente que lo usa (ProtectedAreaForm)
 * solo recibe URLs ya subidas, nunca archivos crudos.
 *
 * Antes de este rediseño, el único punto de entrada era un botón "+"
 * discreto de 96x96 sin ninguna instrucción — nada indicaba que se podía
 * hacer click ahí, ni el formato/tamaño permitido hasta después de subir
 * algo. Ahora, mientras no haya imágenes, se muestra una dropzone completa
 * con instrucciones explícitas y soporte real de arrastrar-y-soltar.
 */
export function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const language = useLanguageStore((state) => state.language);
  const uploadImage = useUploadProtectedAreaImage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  function processFile(file: File | undefined) {
    if (!file) {
      return;
    }

    setError(null);

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setError(
        language === "en"
          ? "Only JPEG, PNG or WEBP images are allowed."
          : "Solo se permiten imágenes JPEG, PNG o WEBP.",
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError(
        language === "en"
          ? "The image must be smaller than 5 MB."
          : "La imagen debe pesar menos de 5 MB.",
      );
      return;
    }

    uploadImage.mutate(file, {
      onSuccess: ({ url }) => onChange([...images, url]),
    });
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    processFile(file);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDraggingOver(false);

    if (!canAddMore || uploadImage.isPending) {
      return;
    }

    processFile(event.dataTransfer.files?.[0]);
  }

  function handleRemove(url: string) {
    onChange(images.filter((image) => image !== url));
  }

  const canAddMore = images.length < MAX_IMAGES;
  const hint =
    language === "en"
      ? `${images.length}/${MAX_IMAGES} images · JPEG, PNG or WEBP, up to 5 MB.`
      : `${images.length}/${MAX_IMAGES} imágenes · JPEG, PNG o WEBP, hasta 5 MB.`;

  return (
    <div className="flex flex-col gap-3">
      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {images.map((url) => (
            <div
              key={url}
              className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-border"
            >
              <Image
                src={url}
                alt=""
                fill
                sizes="96px"
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(url)}
                aria-label={language === "en" ? "Remove image" : "Quitar imagen"}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          ))}

          {canAddMore && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploadImage.isPending}
              aria-label={
                language === "en" ? "Add another image" : "Agregar otra imagen"
              }
              className="flex h-24 w-24 shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-border text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-60"
            >
              {uploadImage.isPending ? (
                <Spinner size="sm" />
              ) : (
                <>
                  <ImagePlus className="h-5 w-5" aria-hidden="true" />
                  <span className="text-[11px] font-medium">
                    {language === "en" ? "Add" : "Agregar"}
                  </span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {images.length === 0 && canAddMore && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingOver(true);
          }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={handleDrop}
          className={cn(
            "flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-8 text-center transition-colors",
            isDraggingOver
              ? "border-accent bg-accent-soft/40"
              : "border-border hover:border-accent hover:bg-surface-secondary",
          )}
        >
          {uploadImage.isPending ? (
            <Spinner size="sm" />
          ) : (
            <>
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-default-soft text-muted-foreground">
                <UploadCloud className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="text-sm font-medium text-foreground">
                {language === "en"
                  ? "Drag your images here or click to browse"
                  : "Arrastra tus imágenes aquí o haz clic para seleccionarlas"}
              </p>
              <p className="text-xs text-muted">{hint}</p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {images.length > 0 && <p className="text-xs text-muted">{hint}</p>}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
