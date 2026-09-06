# Login/Registro: íconos en el botón principal + etiqueta correcta de contraseña

## Objetivo

El usuario mandó capturas de login y registro (tema oscuro) pidiendo:
1. Ícono en el botón "Iniciar sesión" y en el botón "Crear cuenta".
2. En las validaciones de contraseña, aclarar que el check requiere una
   letra **minúscula**, porque solo decía "letra" — en la captura, la
   contraseña autogenerada "3F6EB2D8" (todo mayúsculas) mostraba el check
   "Contiene una letra" en rojo aunque visualmente sí tiene letras
   (F, E, B, D), lo que confunde.

## Cambios realizados

`app/(auth)/login/page.tsx` y `app/(auth)/register/page.tsx`: migrados de
`Button`/`Spinner` de `@heroui/react` a `Button` (shadcn) + `Loader2`
(lucide), mismo patrón ya usado en el resto de formularios de la app
(chatbot, speaking practice, tests, perfil, etc.). El botón de login
ahora muestra el ícono `LogIn` junto al texto; el de registro, `UserPlus`
(mismo ícono que ya usa el badge del encabezado). Durante el envío se
muestra solo el spinner (`Loader2` girando), sin ícono ni texto extra —
igual que en los demás formularios ya migrados.

`features/auth/components/password-field.tsx`: investigado el porqué del
check "Contiene una letra" — el comentario del archivo ya documentaba que
es, en realidad, el check `lowercase` del plugin hs-strong-password de
Preline (el esquema zod real solo exige una letra sin distinguir
mayúsculas/minúsculas, pero el plugin no tiene una regla así, así que se
reusa `lowercase` como aproximación). El texto visible decía solo "letra"
sin aclarar que específicamente busca una minúscula — causa exacta de la
confusión en la captura. Se corrigió la etiqueta a "Contiene una letra
minúscula." / "Contains a lowercase letter." (sin tocar el esquema zod
real ni el comportamiento de envío del formulario — solo se pidió
corregir el texto). El comentario explicativo del componente también se
actualizó para reflejar la etiqueta nueva.

## Verificación

- `npm run lint`: 0 errores, mismas 5 advertencias preexistentes de
  `react-hooks/incompatible-library`.
- `npm run build`: compila, type-checkea y genera las 20 páginas sin
  errores.
