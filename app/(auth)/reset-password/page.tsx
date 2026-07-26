"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Button, Spinner } from "@heroui/react";
import { CheckCircle2 } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { authContent } from "@/lib/i18n/auth-content";
import { useResetPassword } from "@/features/auth/hooks/use-reset-password";
import { PasswordField } from "@/features/auth/components/password-field";
import { PinCodeInput } from "@/components/ui/pin-code-input";
import { FormErrorBanner } from "@/components/ui/form-error-banner";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/features/auth/schemas/reset-password.schema";
import type { ApiError } from "@/lib/api/client";

export default function ResetPasswordPage() {
  const language = useLanguageStore((state) => state.language);
  const t = authContent[language].resetPassword;
  const resetPassword = useResetPassword();
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { code: "", newPassword: "", confirmPassword: "" },
  });

  function onSubmit(values: ResetPasswordFormValues) {
    resetPassword.mutate(values);
  }

  const errorMessage = (resetPassword.error as ApiError | null)?.message;

  if (resetPassword.isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-4 text-center"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success-soft text-success-soft-foreground">
          <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
        </span>
        <h1 className="text-xl font-bold text-foreground">{t.title}</h1>
        <p className="text-sm text-muted">{t.success}</p>
        <Button variant="primary" onPress={() => router.push("/login")}>
          {t.backToLogin}
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
        <p className="text-sm text-muted">{t.subtitle}</p>
      </div>

      <FormErrorBanner message={errorMessage} />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
        noValidate
      >
        <Controller
          control={control}
          name="code"
          render={({ field }) => (
            <div className="flex flex-col items-center gap-2">
              <label className="text-sm font-medium text-foreground">
                {t.code}
              </label>
              <PinCodeInput
                length={6}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                isInvalid={!!errors.code}
              />
              <p className="text-xs text-muted-foreground-1">{t.codeHint}</p>
              {errors.code?.message && (
                <span className="text-xs text-danger">
                  {errors.code.message}
                </span>
              )}
            </div>
          )}
        />

        <Controller
          control={control}
          name="newPassword"
          render={({ field }) => (
            <PasswordField
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={field.name}
              label={t.newPassword}
              placeholder={t.newPasswordPlaceholder}
              isInvalid={!!errors.newPassword}
              errorMessage={errors.newPassword?.message}
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
          isDisabled={resetPassword.isPending}
        >
          {resetPassword.isPending ? (
            <>
              <Spinner size="sm" />
              {t.submitting}
            </>
          ) : (
            t.submit
          )}
        </Button>
      </form>

      <p className="text-center">
        <Link
          href="/login"
          className="text-sm font-medium text-muted hover:text-foreground"
        >
          {t.backToLogin}
        </Link>
      </p>
    </div>
  );
}
