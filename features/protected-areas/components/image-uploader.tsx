"use client";

import { useRef, useState, type ChangeEvent } from "react";
import Image from "next/image";
import { Spinner } from "@heroui/react";
import { ImagePlus, X } from "lucide-react";
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
 */
export function ImageUploader({ images, onChange }: ImageUploaderProps) {
  const language = useLanguageStore((state) => state.language);
  const uploadImage = useUploadProtectedAreaImage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

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

  function handleRemove(url: string) {
    onChange(images.filter((image) => image !== url));
  }

  const canAddMore = images.length < MAX_IMAGES;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-3">
        {images.map((url) => (
          <div
            key={url}
            className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-border"
          >
            <Image src={url} alt="" fill sizes="96px" className="object-cover" />
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

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      <p className="text-xs text-muted">
        {language === "en"
          ? `${images.length}/${MAX_IMAGES} images · JPEG, PNG or WEBP, up to 5 MB.`
          : `${images.length}/${MAX_IMAGES} imágenes · JPEG, PNG o WEBP, hasta 5 MB.`}
      </p>

      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
