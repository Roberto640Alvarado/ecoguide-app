"use client";

import type { ReactNode } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, FieldError, Input, Label, Spinner, TextField } from "@heroui/react";
import { Mail, User as UserIcon } from "lucide-react";
import { FormModal } from "@/components/ui/form-modal";
import { ToggleField } from "@/components/ui/toggle-field";
import { useLanguageStore } from "@/store/language-store";
import { useUpdateUser } from "../hooks/use-update-user";
import {
  updateUserSchema,
  type UpdateUserFormValues,
} from "../schemas/update-user.schema";
import type { User } from "../types/user.types";

interface EditUserModalProps {
  user: User;
  trigger: ReactNode;
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
          updateUser.mutate(values, { onSuccess: () => close() });
        };

        return (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
            noValidate
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Controller
                control={control}
                name="name"
                render={({ field }) => (
                  <TextField
                    isInvalid={!!errors.name}
                    fullWidth
                    className="flex flex-col gap-1.5"
                  >
                    <Label className="text-sm font-medium text-foreground">
                      {language === "en" ? "First name" : "Nombre"}
                    </Label>
                    <div className="relative">
                      <UserIcon
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                        aria-hidden="true"
                      />
                      <Input
                        {...field}
                        fullWidth
                        className="pl-9"
                        autoComplete="given-name"
                      />
                    </div>
                    <FieldError className="text-xs">
                      {errors.name?.message}
                    </FieldError>
                  </TextField>
                )}
              />

              <Controller
                control={control}
                name="lastName"
                render={({ field }) => (
                  <TextField
                    isInvalid={!!errors.lastName}
                    fullWidth
                    className="flex flex-col gap-1.5"
                  >
                    <Label className="text-sm font-medium text-foreground">
                      {language === "en" ? "Last name" : "Apellido"}
                    </Label>
                    <div className="relative">
                      <UserIcon
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                        aria-hidden="true"
                      />
                      <Input
                        {...field}
                        fullWidth
                        className="pl-9"
                        autoComplete="family-name"
                      />
                    </div>
                    <FieldError className="text-xs">
                      {errors.lastName?.message}
                    </FieldError>
                  </TextField>
                )}
              />
            </div>

            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <TextField
                  isInvalid={!!errors.email}
                  fullWidth
                  className="flex flex-col gap-1.5"
                >
                  <Label className="text-sm font-medium text-foreground">
                    {language === "en" ? "Email" : "Correo electrónico"}
                  </Label>
                  <div className="relative">
                    <Mail
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                      aria-hidden="true"
                    />
                    <Input
                      {...field}
                      fullWidth
                      type="email"
                      className="pl-9"
                      autoComplete="email"
                    />
                  </div>
                  <FieldError className="text-xs">
                    {errors.email?.message}
                  </FieldError>
                </TextField>
              )}
            />

            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm font-medium text-foreground">
                    {language === "en" ? "Role" : "Rol"}
                  </Label>
                  <select {...field} className="input">
                    <option value="STUDENT">
                      {language === "en" ? "Student" : "Estudiante"}
                    </option>
                    <option value="TEACHER">
                      {language === "en" ? "Teacher" : "Docente"}
                    </option>
                  </select>
                  {errors.role?.message && (
                    <span className="text-xs text-danger">
                      {errors.role.message}
                    </span>
                  )}
                </div>
              )}
            />

            <Controller
              control={control}
              name="isActive"
              render={({ field }) => (
                <ToggleField
                  label={language === "en" ? "Active account" : "Cuenta activa"}
                  checked={field.value}
                  onChange={field.onChange}
                />
              )}
            />

            <div className="mt-2 flex justify-end gap-2">
              <Button variant="outline" type="button" onPress={close}>
                {language === "en" ? "Cancel" : "Cancelar"}
              </Button>
              <Button
                type="submit"
                variant="primary"
                isDisabled={updateUser.isPending}
              >
                {updateUser.isPending ? (
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
      }}
    </FormModal>
  );
}
