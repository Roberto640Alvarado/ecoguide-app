"use client";

import type { ReactNode } from "react";
import {
  ModalRoot,
  ModalBackdrop,
  ModalContainer,
  ModalDialog,
  ModalHeader,
  ModalHeading,
  ModalBody,
  ModalCloseTrigger,
} from "@heroui/react";
import { X } from "lucide-react";

interface FormModalRenderProps {
  close: () => void;
}

interface FormModalProps {
  trigger: ReactNode;
  title: string;
  description?: string;
  size?: "sm" | "md" | "lg" | "xl";
  children: (helpers: FormModalRenderProps) => ReactNode;
}

export function FormModal({
  trigger,
  title,
  description,
  size = "lg",
  children,
}: FormModalProps) {
  return (
    <ModalRoot>
      {trigger}
      <ModalBackdrop>
        <ModalContainer size={size === "xl" ? "lg" : size}>
          <ModalDialog>
            {({ close }) => (
              <>
                <ModalHeader>
                  <ModalHeading>{title}</ModalHeading>
                  <ModalCloseTrigger>
                    <X className="h-4 w-4" aria-hidden="true" />
                  </ModalCloseTrigger>
                </ModalHeader>
                <ModalBody>
                  {description && (
                    <p className="-mt-1 mb-4 text-sm text-muted">{description}</p>
                  )}
                  {children({ close })}
                </ModalBody>
              </>
            )}
          </ModalDialog>
        </ModalContainer>
      </ModalBackdrop>
    </ModalRoot>
  );
}
