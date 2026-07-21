import type { Language } from "@/store/language-store";

export interface AuthContent {
  backHome: string;
  login: {
    title: string;
    subtitle: string;
    email: string;
    emailPlaceholder: string;
    password: string;
    passwordPlaceholder: string;
    submit: string;
    submitting: string;
    noAccount: string;
    registerLink: string;
    forgotLink: string;
  };
  forgotPassword: {
    title: string;
    subtitle: string;
    email: string;
    emailPlaceholder: string;
    submit: string;
    submitting: string;
    success: string;
    backToLogin: string;
    resetLink: string;
  };
  resetPassword: {
    title: string;
    subtitle: string;
    code: string;
    codeHint: string;
    newPassword: string;
    newPasswordPlaceholder: string;
    confirmPassword: string;
    confirmPasswordPlaceholder: string;
    submit: string;
    submitting: string;
    success: string;
    backToLogin: string;
  };
  register: {
    title: string;
    subtitle: string;
    name: string;
    namePlaceholder: string;
    lastName: string;
    lastNamePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    password: string;
    passwordPlaceholder: string;
    confirmPassword: string;
    confirmPasswordPlaceholder: string;
    submit: string;
    submitting: string;
    hasAccount: string;
    loginLink: string;
  };
}

export const authContent: Record<Language, AuthContent> = {
  en: {
    backHome: "Back to home",
    login: {
      title: "Welcome back",
      subtitle: "Log in to keep practicing your tour guide English.",
      email: "Email",
      emailPlaceholder: "you@example.com",
      password: "Password",
      passwordPlaceholder: "Your password",
      submit: "Log in",
      submitting: "Logging in...",
      noAccount: "Don't have an account?",
      registerLink: "Register",
      forgotLink: "Forgot your password?",
    },
    forgotPassword: {
      title: "Reset your password",
      subtitle:
        "Enter your email and we'll send you a 6-digit code to reset your password.",
      email: "Email",
      emailPlaceholder: "you@example.com",
      submit: "Send code",
      submitting: "Sending...",
      success:
        "If that email is registered, you'll receive a recovery code shortly.",
      backToLogin: "Back to login",
      resetLink: "Already have a code? Reset password",
    },
    resetPassword: {
      title: "Enter your code",
      subtitle: "Enter the 6-digit code we sent you and choose a new password.",
      code: "Verification code",
      codeHint: "6-digit code sent to your email",
      newPassword: "New password",
      newPasswordPlaceholder: "At least 8 characters",
      confirmPassword: "Confirm new password",
      confirmPasswordPlaceholder: "Repeat your new password",
      submit: "Reset password",
      submitting: "Resetting...",
      success: "Password updated successfully. You can now log in.",
      backToLogin: "Back to login",
    },
    register: {
      title: "Create your account",
      subtitle: "Join EcoGuide Training and start practicing today.",
      name: "First name",
      namePlaceholder: "Ana",
      lastName: "Last name",
      lastNamePlaceholder: "Martínez",
      email: "Email",
      emailPlaceholder: "you@example.com",
      password: "Password",
      passwordPlaceholder: "At least 8 characters",
      confirmPassword: "Confirm password",
      confirmPasswordPlaceholder: "Repeat your password",
      submit: "Create account",
      submitting: "Creating account...",
      hasAccount: "Already have an account?",
      loginLink: "Log in",
    },
  },
  es: {
    backHome: "Volver al inicio",
    login: {
      title: "Bienvenido de nuevo",
      subtitle: "Inicia sesión para seguir practicando tu inglés de guía turístico.",
      email: "Correo electrónico",
      emailPlaceholder: "tucorreo@ejemplo.com",
      password: "Contraseña",
      passwordPlaceholder: "Tu contraseña",
      submit: "Iniciar sesión",
      submitting: "Iniciando sesión...",
      noAccount: "¿No tienes una cuenta?",
      registerLink: "Regístrate",
      forgotLink: "¿Olvidaste tu contraseña?",
    },
    forgotPassword: {
      title: "Recupera tu contraseña",
      subtitle:
        "Ingresa tu correo y te enviaremos un código de 6 dígitos para restablecer tu contraseña.",
      email: "Correo electrónico",
      emailPlaceholder: "tucorreo@ejemplo.com",
      submit: "Enviar código",
      submitting: "Enviando...",
      success:
        "Si el correo está registrado, recibirás un código de recuperación en breve.",
      backToLogin: "Volver a iniciar sesión",
      resetLink: "¿Ya tienes un código? Restablece tu contraseña",
    },
    resetPassword: {
      title: "Ingresa tu código",
      subtitle:
        "Ingresa el código de 6 dígitos que te enviamos y elige una nueva contraseña.",
      code: "Código de verificación",
      codeHint: "Código de 6 dígitos enviado a tu correo",
      newPassword: "Nueva contraseña",
      newPasswordPlaceholder: "Al menos 8 caracteres",
      confirmPassword: "Confirmar nueva contraseña",
      confirmPasswordPlaceholder: "Repite tu nueva contraseña",
      submit: "Restablecer contraseña",
      submitting: "Restableciendo...",
      success: "Contraseña actualizada correctamente. Ya puedes iniciar sesión.",
      backToLogin: "Volver a iniciar sesión",
    },
    register: {
      title: "Crea tu cuenta",
      subtitle: "Únete a EcoGuide Training y empieza a practicar hoy mismo.",
      name: "Nombre",
      namePlaceholder: "Ana",
      lastName: "Apellido",
      lastNamePlaceholder: "Martínez",
      email: "Correo electrónico",
      emailPlaceholder: "tucorreo@ejemplo.com",
      password: "Contraseña",
      passwordPlaceholder: "Al menos 8 caracteres",
      confirmPassword: "Confirmar contraseña",
      confirmPasswordPlaceholder: "Repite tu contraseña",
      submit: "Crear cuenta",
      submitting: "Creando cuenta...",
      hasAccount: "¿Ya tienes una cuenta?",
      loginLink: "Inicia sesión",
    },
  },
};
