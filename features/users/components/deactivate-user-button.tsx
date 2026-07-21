"use client";

import { Button } from "@heroui/react";
import { UserX } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useLanguageStore } from "@/store/language-store";
import { useDeactivateUser } from "../hooks/use-deactivate-user";
import type { User } from "../types/user.types";

interface DeactivateUserButtonProps {
  user: User;
}

export function DeactivateUserButton({ user }: DeactivateUserButtonProps) {
  const language = useLanguageStore((state) => state.language);
  const deactivateUser = useDeactivateUser();

  if (!user.isActive) {
    return null;
  }

  return (
    <ConfirmDialog
      trigger={
        <Button
          variant="outline"
          size="sm"
          aria-label={language === "en" ? "Deactivate" : "Desactivar"}
        >
          <UserX className="h-4 w-4" aria-hidden="true" />
        </Button>
      }
      icon={<UserX className="h-5 w-5" aria-hidden="true" />}
      title={language === "en" ? "Deactivate user?" : "¿Desactivar usuario?"}
      description={
        language === "en" ? (
          <>
            <strong className="font-semibold text-foreground">
              {user.name} {user.lastName}
            </strong>{" "}
            will no longer be able to log in.
          </>
        ) : (
          <>
            <strong className="font-semibold text-foreground">
              {user.name} {user.lastName}
            </strong>{" "}
            ya no podrá iniciar sesión.
          </>
        )
      }
      note={
        language === "en"
          ? "This is reversible: you can reactivate the account anytime from this panel."
          : "Esto es reversible: puedes reactivar la cuenta cuando quieras desde este panel."
      }
      confirmLabel={language === "en" ? "Deactivate" : "Desactivar"}
      isLoading={deactivateUser.isPending}
      onConfirm={() => deactivateUser.mutate(user.id)}
    />
  );
}
