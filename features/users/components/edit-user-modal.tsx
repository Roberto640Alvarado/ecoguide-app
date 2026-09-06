"use client";

import type { ReactElement } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock, Save, User as UserIcon, X, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormModal } from "@/components/ui/form-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { UserAvatar } from "@/components/ui/user-avatar";
import { cn } from "@/lib/utils";
import { useLanguageStore } from "@/store/language-store";
import { useUpdateUser } from "../hooks/use-update-user";
import {
  updateUserSchema,
  type UpdateUserFormValues,
} from "../schemas/update-user.schema";
import type { User } from "../types/user.types";

interface EditUserModalProps {
  user: User;
  trigger: ReactElement;
}

// Input con ícono a la izquierda, sobre el <Input> de shadcn — mismo patrón
// visual que el buscador de ColumnFilter, para que los campos de este modal
// se sientan parte del mismo sistema de diseño que el resto de las tablas.
function FieldInput({
  icon: Icon,
  className,
  ...props
}: { icon: LucideIcon } & React.ComponentProps<typeof Input>) {
  return (
    <div className="relative">
      <Icon
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input className={cn("pl-9", className)} {...props} />
    </div>
  );
}

export function EditUserModal({ user, trigger }: EditUserModalProps) {
  const language = useLanguageStore((state) => state.language);
  const updateUser = useUpdateUser(user.id);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    },
  });

  return (
    <FormModal
      trigger={trigger}
      title={language === "en" ? "Edit user" : "Editar usuario"}
    >
      {({ close }) => {
        const onSubmit = (values: UpdateUserFormValues) => {
          // El correo es de solo lectura en este formulario (ver campo más
          // abajo, deshabilitado) — se reenvía tal cual llegó, nunca algo
          // que el usuario pudiera haber escrito.
          updateUser.mutate(
            { ...values, email: user.email },
            { onSuccess: () => close() },
          );
        };

        return (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
            noValidate
          >
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface-secondary/60 px-4 py-3">
              <UserAvatar name={user.name} avatarUrl={user.avatarUrl} size="md" />
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">
                  {user.name} {user.lastName}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Controller
                control={control}
                name="name"
                render={({ field }) => (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="edit-user-name">
                      {language === "en" ? "First name" : "Nombre"}
                    </Label>
                    <FieldInput
                      {...field}
                      id="edit-user-name"
                      icon={UserIcon}
                      autoComplete="given-name"
                      aria-invalid={!!errors.name}
                    />
                    {errors.name?.message && (
                      <p className="text-xs text-destructive">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                )}
              />

              <Controller
                control={control}
                name="lastName"
                render={({ field }) => (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="edit-user-last-name">
                      {language === "en" ? "Last name" : "Apellido"}
                    </Label>
                    <FieldInput
                      {...field}
                      id="edit-user-last-name"
                      icon={UserIcon}
                      autoComplete="family-name"
                      aria-invalid={!!errors.lastName}
                    />
                    {errors.lastName?.message && (
                      <p className="text-xs text-destructive">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-user-email">
                {language === "en" ? "Email" : "Correo electrónico"}
              </Label>
              <FieldInput
                id="edit-user-email"
                icon={Lock}
                value={user.email}
                disabled
                readOnly
              />
              <p className="text-xs text-muted-foreground">
                {language === "en"
                  ? "The email can't be changed from here."
                  : "El correo no se puede modificar desde aquí."}
              </p>
            </div>

            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-user-role">
                    {language === "en" ? "Role" : "Rol"}
                  </Label>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="edit-user-role" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STUDENT">
                        {language === "en" ? "Student" : "Estudiante"}
                      </SelectItem>
                      <SelectItem value="TEACHER">
                        {language === "en" ? "Teacher" : "Docente"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.role?.message && (
                    <p className="text-xs text-destructive">
                      {errors.role.message}
                    </p>
                  )}
                </div>
              )}
            />

            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <label
                  htmlFor="edit-user-active"
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-border bg-surface-secondary px-4 py-3"
                >
                  <span className="text-sm font-medium text-foreground">
                    {language === "en" ? "Active account" : "Cuenta activa"}
                  </span>
                  <Switch
                    id="edit-user-active"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </label>
              )}
            />

            <div className="mt-1 flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={close}>
                <X className="h-4 w-4" aria-hidden="true" />
                {language === "en" ? "Cancel" : "Cancelar"}
              </Button>
              <Button type="submit" disabled={updateUser.isPending}>
                {updateUser.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <>
                    <Save className="h-4 w-4" aria-hidden="true" />
                    {language === "en" ? "Save changes" : "Guardar cambios"}
                  </>
                )}
              </Button>
            </div>
          </form>
        );
      }}
    </FormModal>
  );
}
