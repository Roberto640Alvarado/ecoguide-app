# Rediseño de la llamada de speaking y arreglo de la voz de EcoGuía

## Objetivo

Que la práctica de speaking se vea y se sienta como una llamada real
(FaceTime/WhatsApp), responsive y a pantalla completa en móvil, y que la
voz de EcoGuía se escuche en cualquier navegador.

## Cambios realizados

- `features/speaking-results/components/call-screen.tsx`: reescrito con
  estética de videollamada: fondo oscuro (Ink Black) con el avatar
  desenfocado, barra superior con área y duración (`call-timer.tsx`),
  anillos de voz alrededor del avatar mientras EcoGuía habla, ondas de voz
  (`call-voice-wave.tsx`) que siguen el volumen real del micrófono al
  grabar, subtítulos y barra de controles circulares
  (`call-control-button.tsx`): Escuchar, Hablar/Enviar y Colgar
  (`hang-up-dialog.tsx`, AlertDialog de shadcn/ui).
- `hooks/use-call-recorder.ts`: expone un `AnalyserNode` del micrófono;
  `hooks/use-audio-level.ts` lo convierte en un MotionValue 0–1.
- `hooks/use-speech-audio.ts`: `speak` siempre resuelve (la llamada ya no
  se queda en "Hablando…"), reproduce con Web Audio sobre un AudioContext
  desbloqueado en el clic (`utils/audio-unlock.ts`), con respaldo a
  `<audio>` y a `speechSynthesis`.
- `app/student/protected-areas/[id]/speaking-practice/page.tsx`: pantalla
  previa con el mismo estilo y botón verde de llamar; la llamada ocupa todo
  el alto disponible y en móvil va de borde a borde (se oculta el título).
- ecoguide-api: la voz ahora usa la API oficial de OpenAI
  (`gpt-4o-mini-tts`, voz `marin`) en vez del servicio no oficial de
  Microsoft Edge, que responde 403 desde octubre de 2026.

## Razones del cambio

La voz no sonaba: Microsoft bloqueó el servicio de Edge, el desmontaje de
StrictMode cancelaba la reproducción en desarrollo y Safari bloqueaba el
audio que llega segundos después del clic. La vista además no transmitía
la sensación de llamada.

## Resultado final

La vista ya no usa componentes de HeroUI salvo `toast`. Todas las
animaciones respetan `prefers-reduced-motion`.

## Ajustes posteriores

- La llamada y la pantalla previa usan tokens del tema (`bg-background`,
  `text-foreground`, `accent`…) en vez de colores fijos: en tema claro el
  fondo es claro y en tema oscuro sigue siendo Ink Black. El fondo vive en
  `call-backdrop.tsx`.
- Nueva pantalla `call-summary.tsx` al colgar: "Llamada finalizada" con la
  duración, retroalimentación y calificación, y las acciones "Seguir
  practicando" (inicia otra llamada) y "Continuar con el recorrido"
  (`components/ui/session-complete-actions.tsx`, compartido con el
  chatbot). En móvil va de borde a borde con las acciones fijas abajo.
