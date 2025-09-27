// Simple global audio manager
type SfxMap = { [key: string]: HTMLAudioElement };

class AudioManager {
  private static _instance: AudioManager;
  private sfx: SfxMap = {};
  private music?: HTMLAudioElement;
  private _soundEnabled = true;
  private _musicEnabled = false;

  static get instance() {
    if (!this._instance) this._instance = new AudioManager();
    return this._instance;
  }

  init(options: { soundEnabled: boolean; musicEnabled: boolean; musicSrc?: string } = {
    soundEnabled: true,
    musicEnabled: false,
  }) {
    this._soundEnabled = options.soundEnabled;
    this._musicEnabled = options.musicEnabled;

    // Lazy create music element
    if (!this.music && options.musicSrc) {
      this.music = new Audio(options.musicSrc);
      this.music.loop = true;
      this.music.volume = 0.35; // safe default
    }

    // Try to reflect initial state
    if (this._musicEnabled && this.music) {
      this.music.play().catch(() => {/* user gesture may be required */});
    } else {
      this.music?.pause();
      if (this.music) this.music.currentTime = 0;
    }
  }

  // Preload a sound effect once (call early in app bootstrap)
  registerSfx(key: string, src: string) {
    if (this.sfx[key]) return;
    const a = new Audio(src);
    a.preload = 'auto';
    this.sfx[key] = a;
  }

  // Play a short effect, respecting setting
  play(key: string) {
    if (!this._soundEnabled) return;
    const a = this.sfx[key];
    if (!a) return;
    try {
      // clone for overlapping plays
      const c = a.cloneNode(true) as HTMLAudioElement;
      c.play();
    } catch (_) {}
  }

  setSoundEnabled(val: boolean) {
    this._soundEnabled = val;
  }
  setMusicEnabled(val: boolean) {
    this._musicEnabled = val;
    if (this._musicEnabled) {
      this.music?.play().catch(() => {/* needs gesture */});
    } else {
      this.music?.pause();
      if (this.music) this.music.currentTime = 0;
    }
  }

  get soundEnabled() { return this._soundEnabled; }
  get musicEnabled() { return this._musicEnabled; }
}

export const audio = AudioManager.instance;
