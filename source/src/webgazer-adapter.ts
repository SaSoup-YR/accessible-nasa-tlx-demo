export const WEBGAZER_VERSION = '3.5.3';
export const WEBGAZER_SCRIPT_URL = `https://cdn.jsdelivr.net/npm/webgazer@${WEBGAZER_VERSION}/dist/webgazer.js`;
export const WEBGAZER_FACE_MESH_URL = `https://cdn.jsdelivr.net/npm/webgazer@${WEBGAZER_VERSION}/dist/mediapipe/face_mesh`;
export const WEBGAZER_SCRIPT_INTEGRITY =
  'sha384-N9TfYQEjUGiaDcITkzB/MtVHEfF2JtTWCwHG8NUhjOSvJ8zObGwfebHUFLBS+4Rb';

export interface GazePoint {
  x: number;
  y: number;
}

export interface WebGazerLike {
  params: { faceMeshSolutionPath: string };
  begin(onFail?: () => void): Promise<WebGazerLike> | WebGazerLike;
  clearData(): Promise<void> | void;
  clearGazeListener(): WebGazerLike;
  detectCompatibility(): boolean;
  end(): WebGazerLike;
  pause(): WebGazerLike;
  recordScreenPosition(x: number, y: number, eventType?: 'click' | 'move'): WebGazerLike;
  removeMouseEventListeners(): WebGazerLike;
  resume(): Promise<WebGazerLike> | WebGazerLike;
  saveDataAcrossSessions(value: boolean): WebGazerLike;
  setGazeListener(listener: (point: GazePoint | null, elapsedTime: number) => void): WebGazerLike;
  showFaceFeedbackBox(value: boolean): WebGazerLike;
  showFaceOverlay(value: boolean): WebGazerLike;
  showPredictionPoints(value: boolean): WebGazerLike;
  showVideoPreview(value: boolean): WebGazerLike;
  stopVideo(): WebGazerLike;
}

declare global {
  interface Window {
    webgazer?: WebGazerLike;
  }
}

let loadingPromise: Promise<WebGazerLike> | null = null;

export function isSecureGazeContext(location: Pick<Location, 'protocol' | 'hostname'>) {
  return location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
}

export function loadWebGazer(documentRef: Document = document): Promise<WebGazerLike> {
  if (window.webgazer) return Promise.resolve(window.webgazer);
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise<WebGazerLike>((resolve, reject) => {
    const existing = documentRef.querySelector<HTMLScriptElement>('#webgazer-loader');
    const script = existing ?? documentRef.createElement('script');

    const finish = () => {
      if (window.webgazer) resolve(window.webgazer);
      else reject(new Error('WebGazer loaded without exposing its browser API.'));
    };

    script.addEventListener('load', finish, { once: true });
    script.addEventListener(
      'error',
      () => {
        script.remove();
        reject(new Error('WebGazer could not be downloaded. Check the connection and content-blocking settings.'));
      },
      { once: true },
    );

    if (!existing) {
      script.id = 'webgazer-loader';
      script.src = WEBGAZER_SCRIPT_URL;
      script.integrity = WEBGAZER_SCRIPT_INTEGRITY;
      script.crossOrigin = 'anonymous';
      script.referrerPolicy = 'no-referrer';
      documentRef.head.append(script);
    }
  }).catch((error) => {
    loadingPromise = null;
    throw error;
  });

  return loadingPromise;
}

export interface DwellUpdate {
  progress: number;
  activated: boolean;
}

export class DwellTracker {
  private key: string | null = null;
  private startedAt = 0;

  constructor(private readonly durationMs: number) {}

  update(key: string | null, now: number): DwellUpdate {
    if (!key) {
      this.reset();
      return { progress: 0, activated: false };
    }
    if (key !== this.key) {
      this.key = key;
      this.startedAt = now;
      return { progress: 0, activated: false };
    }
    const progress = Math.min(1, Math.max(0, (now - this.startedAt) / this.durationMs));
    if (progress >= 1) {
      this.reset();
      return { progress: 1, activated: true };
    }
    return { progress, activated: false };
  }

  reset() {
    this.key = null;
    this.startedAt = 0;
  }
}

