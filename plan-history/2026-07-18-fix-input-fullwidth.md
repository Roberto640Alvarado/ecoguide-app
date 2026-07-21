# Fix real: inputs "cortos" en Login/Register/Forgot/Reset Password

## Objetivo

Tras el fix anterior de `--field-border` (que hizo visible el borde de los inputs), el usuario
reportó que los campos se veían "cortos": el borde recién visible reveló que el `<input>` real
no ocupaba el ancho completo de su contenedor, dejando texto largo (ej. un correo) cortado.

## Diagnóstico

No era un problema de ancho de tarjeta ni de CSS de marca — era una prop de HeroUI v3 nunca
utilizada:

- `@heroui/react`'s `Input` y `TextField` exponen un prop `fullWidth` que activa la clase
  `input--full-width` / `textfield--full-width` (`@apply w-full`).
- Ese prop es `false` por defecto (`defaultVariants: { fullWidth: false }` en
  `inputVariants`/`textFieldVariants`). Sin pasarlo explícitamente, el `<input>` nativo se
  renderiza con su ancho intrínseco de navegador (similar al atributo `size` por defecto, ~170px),
  sin importar que su `div` contenedor sea más ancho.
- Antes del fix de `--field-border`, el input no tenía borde visible, así que ese límite angosto
  se perdía visualmente contra el fondo blanco de la tarjeta — el bug ya existía, pero era
  invisible. Al agregar el borde, el límite real (angosto) del campo quedó expuesto.

## Cambios realizados

Se agregó el prop `fullWidth` a **todos** los `TextField`/`Input` de los flujos de autenticación
(los únicos lugares del proyecto donde se usan estos componentes, confirmado por búsqueda en todo
el repo):

- `app/(auth)/login/page.tsx`: campo de email.
- `app/(auth)/register/page.tsx`: nombre, apellido, email.
- `app/(auth)/forgot-password/page.tsx`: email.
- `features/auth/components/password-field.tsx`: usado por login, register y reset-password para
  contraseña/confirmar contraseña — un solo fix aquí cubre las tres vistas.

`InputOTP` (usado en reset-password para el código de 6 dígitos) no se ve afectado: es un
componente distinto con su propio layout de slots fijos.

## Razones del cambio

- Es la forma idiomática de HeroUI v3 de declarar intención de ancho completo (vs. un hack de CSS
  forzando `width: 100%` globalmente, que podría afectar inputs compactos que la librería
  necesite en otros contextos, como `InputOTP` o campos numéricos pequeños).
- Al arreglarlo en `password-field.tsx` una sola vez, se respeta el principio DRY del proyecto:
  no se duplicó la corrección en cada vista que usa contraseña.

## Resultado final

- `npx tsc --noEmit` y `npx eslint app components store lib features middleware.ts` sin errores
  ni warnings.
- Todos los inputs de Login, Register, Forgot Password y Reset Password ahora ocupan el ancho
  completo de su contenedor, mostrando el texto ingresado (ej. correos largos) sin cortarse.
