"use client";

import { UserX } from "lucide-react";
import { StatusToggle } from "@/components/ui/status-toggle";
import { useLanguageStore } from "@/store/language-store";
import { useDeactivateUser } from "../hooks/use-deactivate-user";
import { useUpdateUser } from "../hooks/use-update-user";
import type { User } from "../types/user.types";

interface UserStatusToggleProps {
  user: User;
}

// Reemplaza al antiguo botón "Desactivar" (de una sola vía) por un switch
// bidireccional: activa o desactiva según el estado actual, pero nunca
// aplica el cambio sin antes pedir confirmación (Cancelar/Confirmar).
// A diferencia de AI Providers, el endpoint de Users no admite payload
// parcial: reactivar requiere reenviar el objeto completo (name, lastName,
// email, role) junto con isActive: true.
export function UserStatusToggle({ user }: UserStatusToggleProps) {
  const language = useLanguageStore((state) => state.language);
  const deactivateUser = useDeactivateUser();
  const updateUser = useUpdateUser(user.id);

  const isLoading = deactivateUser.isPending || updateUser.isPending;

  return (
    <StatusToggle
      isActive={user.isActive}
      isLoading={isLoading}
      activateLabel={language === "en" ? "Activate" : "Activar"}
      deactivateLabel={language === "en" ? "Deactivate" : "Desactivar"}
      icon={<UserX className="h-5 w-5" aria-hidden="true" />}
      confirmTitle={(next) =>
        next
          ? language === "en"
            ? "Activate user?"
            : "¿Activar usuario?"
          : language === "en"
            ? "Deactivate user?"
            : "¿Desactivar usuario?"
      }
      confirmDescription={(next) => (
        <>
          <strong className="font-semibold text-foreground">
            {user.name} {user.lastName}
          </strong>{" "}
          {next
            ? language === "en"
              ? "will be able to log in again."
              : "podrá iniciar sesión de nuevo."
            : language === "en"
              ? "will no longer be able to log in."
              : "ya no podrá iniciar sesión."}
        </>
      )}
      confirmNote={(next) =>
        !next &&
        (language === "en"
          ? "This is reversible: you can reactivate the account anytime from this panel."
          : "Esto es reversible: puedes reactivar la cuenta cuando quieras desde este panel.")
      }
      confirmLabel={(next) =>
        next
          ? language === "en"
            ? "Activate"
            : "Activar"
          : language === "en"
            ? "Deactivate"
            : "Desactivar"
      }
      onConfirm={(next) => {
        if (next) {
          updateUser.mutate({
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            isActive: true,
          });
        } else {
          deactivateUser.mutate(user.id);
        }
      }}
    />
  );
}
