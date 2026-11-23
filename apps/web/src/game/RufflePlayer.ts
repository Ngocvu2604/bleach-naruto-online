export interface RuffleAPI {
  load(options: Record<string, unknown>): Promise<void>;
  suspend(): void;
  resume(): void;
  volume: number;
  traceObserver: ((message: string) => void) | null;
}
export interface RuffleElement extends HTMLElement { ruffle(): RuffleAPI }
declare global { interface Window { RufflePlayer?: { newest(): { createPlayer(): RuffleElement } } } }

/** Owns only the emulator lifecycle. The SWF owns all game logic and timing. */
export class RufflePlayer {
  readonly element: RuffleElement;
  constructor(container: HTMLElement) {
    if (!window.RufflePlayer?.newest) throw new Error('Ruffle unavailable');
    this.element = window.RufflePlayer.newest().createPlayer();
    this.element.setAttribute('aria-label', 'Bleach vs Naruto 3.4');
    this.element.tabIndex = 0;
    container.replaceChildren(this.element);
  }
  async load(onTrace: (message: string) => void) {
    await this.element.ruffle().load({
      url: '/game/bvn-3.4-browser.swf', base: '/game/',
      autoplay: 'on', unmuteOverlay: 'visible', backgroundColor: '#000000',
      scale: 'showAll', letterbox: 'on', allowScriptAccess: false,
      warnOnUnsupportedContent: true, logLevel: 'warn',
    });
    if (!this.element.isConnected) return;
    this.element.ruffle().traceObserver = onTrace;
    this.element.focus();
  }
  setVolume(volume: number) { this.element.ruffle().volume = volume; }
  destroy() { this.element.ruffle().suspend(); this.element.ruffle().traceObserver = null; this.element.remove(); }
}

