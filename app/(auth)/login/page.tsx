"use client";

import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Spinner } from "@heroui/react";
import { LogIn, Mail } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { authContent } from "@/lib/i18n/auth-content";
import { useLogin } from "@/features/auth/hooks/use-login";
import { PasswordField } from "@/features/auth/components/password-field";
import { TextField } from "@/components/ui/text-field";
import {
  loginSchema,
  type LoginFormValues,
} from "@/features/auth/schemas/login.schema";
import type { ApiError } from "@/lib/api/client";

export default function LoginPage() {
  const language = useLanguageStore((state) => state.language);
  const t = authContent[language].login;
  const login = useLogin();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: LoginFormValues) {
    login.mutate(values);
  }

  const errorMessage = (login.error as ApiError | null)?.message;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent-soft-foreground">
          <LogIn className="h-6 w-6" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t.title}</h1>
          <p className="mt-1 text-sm text-muted">{t.subtitle}</p>
        </div>
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
        className="flex flex-col gap-5"
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
              autoComplete="current-password"
            />
          )}
        />

        <Link
          href="/forgot-password"
          className="-mt-2 self-end text-xs font-medium text-accent hover:underline"
        >
          {t.forgotLink}
        </Link>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          isDisabled={login.isPending}
          className="mt-2"
        >
          {login.isPending ? (
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
        {t.noAccount}{" "}
        <Link
          href="/register"
          className="font-semibold text-accent hover:underline"
        >
          {t.registerLink}
        </Link>
      </p>
    </div>
  );
}
