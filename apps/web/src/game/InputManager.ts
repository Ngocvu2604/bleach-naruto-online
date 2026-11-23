/** Native keyboard input goes directly to Ruffle; no synthetic combat or remapping. */
export function guardGameKeys(container: HTMLElement): () => void {
  const preventScroll = (event: KeyboardEvent) => {
    if (event.composedPath().includes(container) && ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(event.key)) event.preventDefault();
  };
  window.addEventListener('keydown', preventScroll);
  return () => window.removeEventListener('keydown', preventScroll);
}
