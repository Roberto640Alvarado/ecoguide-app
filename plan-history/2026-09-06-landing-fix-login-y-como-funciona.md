# Landing page: diferenciar los caminos de login y agregar "Cómo funciona"

## Objetivo

El usuario señaló, viendo "Elige tu camino", que las dos tarjetas
"tienen el mismo inicio de sesión" — la de docente ("Acceder como
docente") va a `/login`, pero la de estudiante solo ofrecía
"Crear cuenta gratis" (`/register`) sin ninguna forma de entrar si ya
tenía cuenta, así que en la práctica ambos caminos terminaban
dependiendo del mismo `/login` genérico sin que la tarjeta lo reflejara.
También pidió, con libertad de criterio ("tú ya conoces la app, mira qué
más puedo agregar y que sea bonito"), sumar más contenido a la landing.

## Cambios realizados

`lib/i18n/landing-content.ts`: `LandingPathContent` ahora admite
`footnote` (nota informativa) y `secondaryCta`/`secondaryHref` (link
secundario). La tarjeta de estudiante agrega
"¿Ya tienes cuenta? Inicia sesión" → `/login`; la de docente agrega la
nota "Las cuentas de docente las crea un administrador." — así cada
tarjeta explica su propio flujo en vez de dar la sensación de que ambas
llevan al mismo lado. Se agregó también la sección `howItWorks` (nueva
interfaz `LandingStep`) con copy en inglés y español.

`components/landing/choose-path-section.tsx`: `PathCard` ahora renderiza,
debajo del CTA principal, el link secundario (estudiante) o la nota
(docente).

`components/landing/how-it-works-section.tsx` (nueva sección, entre Hero
y Features): 4 pasos numerados con ícono — Crear cuenta → Elegir área
protegida → Practicar (chatbot, quizzes y speaking) → Seguir progreso y
ganar insignias — conectados por una línea que se "dibuja" (scaleX) al
entrar en vista en desktop, apilados en mobile. Contenido basado en el
flujo real de la app (no se inventó nada: cada paso corresponde a una
función que ya existe — chatbot por área, quiz, práctica de speaking,
insignias). No se intentó traer datos en vivo de áreas protegidas o
insignias a la landing porque esos endpoints requieren autenticación
(`ProtectedAreasController`/`BadgesController` verificados en
`ecoguide-api` — ninguno es público); habría requerido exponer un
endpoint nuevo, fuera del alcance de este ajuste de landing.

`app/page.tsx`: se inserta `<HowItWorksSection />` entre `HeroSection` y
`FeaturesSection`.

## Verificación

- `npm run lint`: 0 errores, mismas 5 advertencias preexistentes de
  `react-hooks/incompatible-library`.
- `npm run build`: compila, type-checkea y genera las 20 páginas sin
  errores.
