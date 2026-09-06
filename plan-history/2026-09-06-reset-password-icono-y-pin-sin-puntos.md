# Restablecer contraseña: ícono en el botón + quitar los puntos del código

## Objetivo

El usuario mandó una captura de "Ingresa tu código" (reset-password, tema
oscuro) pidiendo ícono en el botón "Restablecer contraseña" y quitar el
punto/círculo (⚬) que aparecía como placeholder en cada casilla del
código de 6 dígitos.

## Cambios realizados

`app/(auth)/reset-password/page.tsx`: migrado de `Button`/`Spinner` de
`@heroui/react` a `Button` (shadcn) + `Loader2`, mismo patrón que login y
registro (ronda anterior). El submit ahora muestra el ícono `KeyRound`
junto al texto "Restablecer contraseña"; durante el envío, solo el
spinner. De paso se migró también el botón de la pantalla de éxito
("Volver a iniciar sesión", visible solo tras restablecer con éxito) al
mismo `Button` de shadcn — quedaba como el único uso de HeroUI en el
archivo y así el import queda limpio con un solo `Button`.

`components/ui/pin-code-input.tsx`: se quitó `placeholder="⚬"` de cada
casilla del código — ahora quedan vacías hasta que el usuario escribe,
sin el punto decorativo.

## Verificación

- `npm run lint`: 0 errores, mismas 5 advertencias preexistentes de
  `react-hooks/incompatible-library`.
- `npm run build`: compila, type-checkea y genera las 20 páginas sin
  errores.
