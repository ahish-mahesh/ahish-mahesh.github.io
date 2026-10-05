interface NavigatorExtras extends Navigator {
  connection?: { saveData?: boolean };
  deviceMemory?: number;
}

/** True when a WebGL context can be created. The probe context is released straight away. */
export function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/** Heuristic for devices where the ASCII hero is not worth the battery. */
export function isSlowDevice(nav: Navigator = navigator): boolean {
  const n = nav as NavigatorExtras;
  if (n.connection?.saveData === true) return true;
  if (typeof n.hardwareConcurrency === 'number' && n.hardwareConcurrency <= 2) return true;
  return typeof n.deviceMemory === 'number' && n.deviceMemory < 4;
}
