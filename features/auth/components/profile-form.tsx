"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button, Spinner, toast } from "@heroui/react";
import { KeyRound } from "lucide-react";
import { TextField } from "@/components/ui/text-field";
import { useAuthStore } from "@/store/auth-store";
import { useLanguageStore } from "@/store/language-store";
import { AVATAR_OPTIONS } from "@/lib/constants/avatars";
import { AvatarPicker } from "./avatar-picker";
import { useUpdateProfile } from "../hooks/use-update-profile";
import {
  updateProfileSchema,
  type UpdateProfileFormValues,
} from "../schemas/update-profile.schema";

/**
 * Vista de "editar mi perfil", compartida entre STUDENT y TEACHER (mismas
 * reglas para ambos roles): nombre/apellido/avatar editables, correo
 * bloqueado (nunca viaja en el PATCH /auth/me, ver UpdateProfileDto en la
 * API) y un enlace directo al flujo existente de recuperación de
 * contraseña — el cambio de contraseña nunca se hace por edición directa.
 */
export function ProfileForm() {
  const language = useLanguageStore((state) => state.language);
  const user = useAuthStore((state) => state.user);
  const updateProfile = useUpdateProfile();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name ?? "",
      lastName: user?.lastName ?? "",
      avatarUrl: user?.avatarUrl ?? AVATAR_OPTIONS[0].src,
    },
  });

  function handleInvalid(formErrors: typeof errors) {
    const firstMessage = Object.values(formErrors)[0]?.message;

    toast.danger(
      firstMessage ??
        (language === "en"
          ? "Check the highlighted fields before submitting."
          : "Revisa los campos marcados antes de enviar."),
    );
  }

  if (!user) {
    return null;
  }

  return (
    <form
      onSubmit={handleSubmit((values) => updateProfile.mutate(values), handleInvalid)}
      className="flex flex-col gap-5"
      noValidate
    >
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            {language === "en" ? "Personal info" : "Información personal"}
          </h2>
          <p className="mt-0.5 text-xs text-muted">
            {language === "en"
              ? "Your name and avatar as shown across the app."
              : "Tu nombre y avatar tal como se ven en toda la app."}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <TextField
                {...field}
                label={language === "en" ? "First name" : "Nombre"}
                error={errors.name?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="lastName"
            render={({ field }) => (
              <TextField
                {...field}
                label={language === "en" ? "Last name" : "Apellido"}
                error={errors.lastName?.message}
              />
            )}
          />
        </div>

        <Controller
          control={control}
          name="avatarUrl"
          render={({ field }) => (
            <AvatarPicker
              value={field.value}
              onChange={field.onChange}
              isInvalid={!!errors.avatarUrl}
              label={language === "en" ? "Avatar" : "Avatar"}
            />
          )}
        />
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            {language === "en" ? "Account" : "Cuenta"}
          </h2>
          <p className="mt-0.5 text-xs text-muted">
            {language === "en"
              ? "Your email can't be changed from here."
              : "Tu correo no se puede modificar desde aquí."}
          </p>
        </div>

        <TextField
          label={language === "en" ? "Email" : "Correo"}
          value={user.email}
          disabled
          readOnly
        />

        <Link
          href="/forgot-password"
          className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-layer-hover"
        >
          <KeyRound className="h-4 w-4" aria-hidden="true" />
          {language === "en" ? "Change password" : "Cambiar contraseña"}
        </Link>
      </section>

      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          isDisabled={updateProfile.isPending}
        >
          {updateProfile.isPending ? (
            <Spinner size="sm" />
          ) : language === "en" ? (
            "Save changes"
          ) : (
            "Guardar cambios"
          )}
        </Button>
      </div>
    </form>
  );
}
