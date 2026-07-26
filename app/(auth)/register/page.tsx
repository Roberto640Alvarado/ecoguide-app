"use client";

import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Spinner } from "@heroui/react";
import { Mail, User, UserPlus } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { authContent } from "@/lib/i18n/auth-content";
import { useRegister } from "@/features/auth/hooks/use-register";
import { PasswordField } from "@/features/auth/components/password-field";
import { AvatarPicker } from "@/features/auth/components/avatar-picker";
import { TextField } from "@/components/ui/text-field";
import { FormErrorBanner } from "@/components/ui/form-error-banner";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/features/auth/schemas/register.schema";
import type { ApiError } from "@/lib/api/client";

export default function RegisterPage() {
  const language = useLanguageStore((state) => state.language);
  const t = authContent[language].register;
  const register = useRegister();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      avatarUrl: "",
    },
  });

  function onSubmit(values: RegisterFormValues) {
    register.mutate(values);
  }

  const errorMessage = (register.error as ApiError | null)?.message;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent-soft-foreground">
          <UserPlus className="h-6 w-6" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
          <p className="mt-1 text-sm text-muted">{t.subtitle}</p>
        </div>
      </div>

      <FormErrorBanner message={errorMessage} />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
        noValidate
      >
        <Controller
          control={control}
          name="avatarUrl"
          render={({ field }) => (
            <AvatarPicker
              value={field.value}
              onChange={field.onChange}
              isInvalid={!!errors.avatarUrl}
              label={
                language === "en" ? "Choose your avatar" : "Elige tu avatar"
              }
            />
          )}
        />

        <p className="-mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
          {language === "en" ? "Personal details" : "Datos personales"}
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <TextField
                {...field}
                label={t.name}
                icon={User}
                placeholder={t.namePlaceholder}
                autoComplete="given-name"
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
                label={t.lastName}
                icon={User}
                placeholder={t.lastNamePlaceholder}
                autoComplete="family-name"
                error={errors.lastName?.message}
              />
            )}
          />
        </div>

        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <TextField
              {...field}
              label={t.email}
              icon={Mail}
              type="email"
              placeholder={t.emailPlaceholder}
              autoComplete="email"
              error={errors.email?.message}
            />
          )}
        />

        <p className="-mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
          {language === "en" ? "Security" : "Seguridad"}
        </p>

        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <PasswordField
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              label={t.password}
              placeholder={t.passwordPlaceholder}
              isInvalid={!!errors.password}
              errorMessage={errors.password?.message}
              autoComplete="new-password"
              showRequirements
            />
          )}
        />

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field }) => (
            <PasswordField
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              label={t.confirmPassword}
              placeholder={t.confirmPasswordPlaceholder}
              isInvalid={!!errors.confirmPassword}
              errorMessage={errors.confirmPassword?.message}
              autoComplete="new-password"
            />
          )}
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          isDisabled={register.isPending}
          className="mt-2"
        >
          {register.isPending ? (
            <>
              <Spinner size="sm" />
              {t.submitting}
            </>
          ) : (
            t.submit
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted">
        {t.hasAccount}{" "}
        <Link
          href="/login"
          className="font-semibold text-accent hover:underline"
        >
          {t.loginLink}
        </Link>
      </p>
    </div>
  );
}
