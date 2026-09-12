/**
 * Audio synthesis (TTS) & Player controller for Audiobooks
 */

export class SpeechEngine {
  private static synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private static utterance: SpeechSynthesisUtterance | null = null;
  private static isSpeaking = false;
  private static isPaused = false;
  private static currentVoice: SpeechSynthesisVoice | null = null;

  public static getVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }

  public static speak(
    text: string,
    options: {
      lang?: string;
      rate?: number;
      pitch?: number;
      onStart?: () => void;
      onEnd?: () => void;
      onBoundary?: (charIndex: number) => void;
      onError?: (err: unknown) => void;
    } = {}
  ): void {
    if (!this.synth) return;

    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    this.utterance = utterance;

    const lang = options.lang || 'ar-SA';
    utterance.lang = lang;
    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;

    const voices = this.synth.getVoices();
    const matchedVoice = voices.find((v) => v.lang.startsWith(lang.substring(0, 2)) || v.lang === lang);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
      this.currentVoice = matchedVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.isPaused = false;
      options.onStart?.();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.isPaused = false;
      options.onEnd?.();
    };

    utterance.onboundary = (e) => {
      options.onBoundary?.(e.charIndex);
    };

    utterance.onerror = (e) => {
      this.isSpeaking = false;
      this.isPaused = false;
      options.onError?.(e);
    };

    this.synth.speak(utterance);
  }

  public static pause(): void {
    if (this.synth && this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
      this.isPaused = true;
    }
  }

  public static resume(): void {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
      this.isPaused = false;
    }
  }

  public static stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
      this.isPaused = false;
    }
  }

  public static getStatus(): { isSpeaking: boolean; isPaused: boolean } {
    return {
      isSpeaking: !!this.synth?.speaking,
      isPaused: !!this.synth?.paused,
    };
  }
}
