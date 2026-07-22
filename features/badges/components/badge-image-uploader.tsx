"use client";

import { useRef, type ChangeEvent } from "react";
import Image from "next/image";
import { Spinner } from "@heroui/react";
import { ImagePlus, X } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { useUploadBadgeImage } from "../hooks/use-upload-badge-image";

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/png"];

interface BadgeImageUploaderProps {
  image: string | undefined;
  onChange: (image: string | undefined) => void;
  error?: string;
}

/**
 * Variante de FlashCardImageUploader restringida a PNG: la imagen de una
 * insignia debe ser PNG (requisito explícito del maestro), tanto en el
 * accept del input como en la validación previa al envío, en espejo de la
 * whitelist ALLOWED_BADGE_IMAGE_MIME_TYPES del backend.
 */
export function BadgeImageUploader({
  image,
  onChange,
  error,
}: BadgeImageUploaderProps) {
  const language = useLanguageStore((state) => state.language);
  const uploadImage = useUploadBadgeImage();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return;
    }

    uploadImage.mutate(file, {
      onSuccess: ({ url }) => onChange(url),
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-start gap-3">
        {image ? (
          <div className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-border bg-default-soft">
            <Image
              src={image}
              alt=""
              fill
              sizes="96px"
              className="object-contain"
            />
            <button
              type="button"
              onClick={() => onChange(undefined)}
              aria-label={language === "en" ? "Remove image" : "Quitar imagen"}
              className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        ) : (
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
        accept="image/png"
        onChange={handleFileChange}
        className="hidden"
      />

      <p className="text-xs text-muted">
        {language === "en"
          ? "Required · PNG only, up to 2 MB."
          : "Requerido · Solo PNG, hasta 2 MB."}
      </p>

      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
