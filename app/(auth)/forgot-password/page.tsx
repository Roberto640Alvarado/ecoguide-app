"use client";

import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Spinner } from "@heroui/react";
import { CheckCircle2, Mail } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { authContent } from "@/lib/i18n/auth-content";
import { useForgotPassword } from "@/features/auth/hooks/use-forgot-password";
import { TextField } from "@/components/ui/text-field";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/features/auth/schemas/forgot-password.schema";
import type { ApiError } from "@/lib/api/client";

export default function ForgotPasswordPage() {
  const language = useLanguageStore((state) => state.language);
  const t = authContent[language].forgotPassword;
  const forgotPassword = useForgotPassword();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  function onSubmit(values: ForgotPasswordFormValues) {
    forgotPassword.mutate(values);
  }

  const errorMessage = (forgotPassword.error as ApiError | null)?.message;

  if (forgotPassword.isSuccess) {
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
        <Link
          href="/reset-password"
          className="text-sm font-semibold text-accent hover:underline"
        >
          {t.resetLink}
        </Link>
        <Link
          href="/login"
          className="text-sm font-medium text-muted hover:text-foreground"
        >
          {t.backToLogin}
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
        <p className="text-sm text-muted">{t.subtitle}</p>
      </div>

      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger-soft-foreground"
          >
            {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
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

        <Button
          type="submit"
          variant="primary"
          fullWidth
          isDisabled={forgotPassword.isPending}
          className="mt-2"
        >
          {forgotPassword.isPending ? (
            <>
              <Spinner size="sm" />
              {t.submitting}
            </>
          ) : (
            t.submit
          )}
        </Button>
      </form>

      <div className="flex flex-col items-center gap-2">
        <Link
          href="/reset-password"
          className="text-sm font-semibold text-accent hover:underline"
        >
          {t.resetLink}
        </Link>
        <Link
          href="/login"
          className="text-sm font-medium text-muted hover:text-foreground"
        >
          {t.backToLogin}
        </Link>
      </div>
    </div>
  );
}
