/**
 * Tipos mínimos para la Web Speech API (SpeechRecognition), no incluida en
 * lib.dom.d.ts por ser no estándar (soportada vía prefijo webkit en Chrome,
 * Edge y Safari; sin soporte en Firefox). Solo se declara lo que
 * useSpeechRecorder necesita, para evitar `any`.
 *
 * Todo vive dentro de `declare global` (con `export {}` al final para que
 * el archivo sea un módulo, requisito de TypeScript para usar
 * `declare global`) — de lo contrario estas interfaces quedarían con scope
 * de módulo en vez de globales, y `SpeechRecognition` no sería visible
 * fuera de este archivo.
 */
declare global {
  interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
  }

  interface SpeechRecognitionResult {
    readonly length: number;
    isFinal: boolean;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
  }

  interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }

  interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message: string;
  }

  interface SpeechRecognition extends EventTarget {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    maxAlternatives: number;
    start(): void;
    stop(): void;
    abort(): void;
    onresult:
      | ((this: SpeechRecognition, event: SpeechRecognitionEvent) => void)
      | null;
    onerror:
      | ((this: SpeechRecognition, event: SpeechRecognitionErrorEvent) => void)
      | null;
    onend: ((this: SpeechRecognition, event: Event) => void) | null;
  }

  interface SpeechRecognitionConstructor {
    new (): SpeechRecognition;
  }

  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export {};
