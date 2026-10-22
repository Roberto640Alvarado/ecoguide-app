/**
 * Los navegadores (Safari sobre todo) solo dejan reproducir audio si el
 * usuario acaba de interactuar con la página. La voz de la IA llega del
 * backend varios segundos después del clic, así que para entonces ese
 * permiso ya expiró.
 *
 * La solución estándar: crear y "desbloquear" un AudioContext dentro del
 * gesto del usuario (clic en iniciar llamada, micrófono, escuchar de
 * nuevo). Una vez desbloqueado, ese contexto puede reproducir audio en
 * cualquier momento posterior, en cualquier navegador.
 */

let sharedAudioContext: AudioContext | null = null;

type AudioContextConstructor = typeof AudioContext;

export function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (sharedAudioContext) {
    return sharedAudioContext;
  }

  const AudioContextClass: AudioContextConstructor | undefined =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: AudioContextConstructor })
      .webkitAudioContext;

  if (!AudioContextClass) {
    return null;
  }

  sharedAudioContext = new AudioContextClass();

  return sharedAudioContext;
}

/**
 * Debe llamarse de forma síncrona dentro de un manejador de clic/toque
 * (antes de cualquier `await`), o el navegador no lo cuenta como gesto.
 */
export function unlockAudio(): void {
  const context = getAudioContext();

  if (context) {
    void context.resume().catch(() => undefined);

    // Reproducir un buffer silencioso de 1 muestra termina de desbloquear
    // el contexto en Safari/iOS.
    const silentSource = context.createBufferSource();
    silentSource.buffer = context.createBuffer(1, 1, 22_050);
    silentSource.connect(context.destination);
    silentSource.start(0);
  }

  // También "calienta" la voz del navegador, que se usa como respaldo y
  // tiene la misma restricción en Safari.
  if ("speechSynthesis" in window) {
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(""));
  }
}
