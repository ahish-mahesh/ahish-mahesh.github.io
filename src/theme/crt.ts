export const CRT_STORAGE_KEY = 'crt';

/** Off unless the visitor turned it on before. */
export function readStoredCrt(): boolean {
  try {
    return localStorage.getItem(CRT_STORAGE_KEY) === 'on';
  } catch {
    return false;
  }
}

export function writeStoredCrt(on: boolean): void {
  try {
    localStorage.setItem(CRT_STORAGE_KEY, on ? 'on' : 'off');
  } catch {
    // storage unavailable; the choice just will not persist
  }
}

/** `data-crt="on"` on <html> turns the layer on (see crt.css); no attribute means off. */
export function applyCrt(on: boolean): void {
  if (on) document.documentElement.dataset.crt = 'on';
  else delete document.documentElement.dataset.crt;
}
