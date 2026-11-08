# Lista de vocabulario con pronunciación en inglés y español

## Objetivo

Que las flashcards de tipo Vocabulario manejen una lista de palabras
(inglés + español) y que el estudiante pueda escuchar la pronunciación de
cada una en ambos idiomas, sin que cada clic genere un costo de IA.

## Cambios realizados

### ecoguide-api

- `prisma/schema.prisma`: tipo compuesto `VocabularyItem { wordEn, wordEs,
  audioEnUrl?, audioEsUrl? }` y `FlashCard.vocabularyItems`. Requiere
  `npx prisma generate`.
- Nuevo módulo `src/flash-card-audio/` (independiente de
  `speaking-results`, que no se tocó):
  - `POST /flash-cards/pronunciations` (TEACHER): genera el MP3 de una
    palabra y devuelve su URL, para escucharla/regenerarla desde el
    formulario antes de guardar.
  - `OpenAIPronunciationStrategy`: `gpt-4o-mini-tts`, voz `marin` (la de la
    llamada de speaking), con `instructions` que fijan el acento de cada
    idioma.
  - `PronunciationAudioStorageService`: sube el MP3 a Cloudinary
    (`flash-cards/pronunciations`).
  - `FlashCardAudioService.fillMissingAudios`: al guardar genera solo los
    audios que falten, de 3 palabras a la vez; si falla alguno queda en
    `null` y la flashcard se guarda igual.
- `flash-cards`: `vocabularyItems` (1 a 30 palabras, máx. 100 caracteres)
  requerido en VOCABULARY; `content` pasa a ser opcional en VOCABULARY. Al
  cambiar a otro tipo se vacía la lista.
- Pruebas nuevas en `flash-card-audio.service.spec.ts` y
  `flash-cards.service.spec.ts`.

### ecoguide-app

- Formulario del docente (`vocabulary-items-field.tsx`,
  `vocabulary-audio-control.tsx`): filas inglés/español con botón Generar,
  escuchar y regenerar por idioma; "Agregar palabra"; "Generar audios
  faltantes"; si se edita una palabra se descarta su audio. Para las
  flashcards antiguas detecta la lista escrita en el contenido
  ("Inglés: Español") y ofrece importarla.
- El contenido se vuelve "Descripción (opcional)" en Vocabulario.
- Vista del estudiante (`flash-card-vocabulary-list.tsx`): tarjetas por
  palabra con el inglés como protagonista, la traducción debajo y un botón
  de escuchar por idioma (verde inglés, azul español); entrada escalonada
  que respeta `prefers-reduced-motion` y corta el audio al cambiar de
  tarjeta.
- `use-pronunciation-player.ts`: reproduce el MP3 guardado, uno a la vez,
  con `speechSynthesis` como respaldo si falta o falla.

## Razones del cambio

- Una tarjeta de vocabulario agrupa varias palabras; el modelo anterior de
  una sola palabra no lo reflejaba.
- Generar una vez y guardar el MP3 cuesta una llamada por palabra e idioma,
  en vez de una por clic de cada estudiante.
- El docente decide cuándo generar y puede regenerar si la pronunciación no
  le convence.

## Resultado final

El docente arma la lista de palabras, escucha cada pronunciación y la
regenera si hace falta; lo que no genere se crea al guardar. El estudiante
ve la lista y escucha cada palabra en inglés y en español. Las flashcards
de vocabulario anteriores siguen mostrando su contenido hasta que se editen
e importen sus palabras.
