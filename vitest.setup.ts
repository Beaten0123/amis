import { vi, beforeAll, afterAll } from 'vitest';
import { JSDOM } from 'jsdom';

// Create a basic JSDOM environment with canvas support
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
  runScripts: 'dangerously'
});

// Copy canvas to global
(global as any).HTMLCanvasElement = dom.window.HTMLCanvasElement;
(global as any).CanvasRenderingContext2D = dom.window.CanvasRenderingContext2D;
(global as any).CanvasGradient = dom.window.CanvasGradient;
(global as any).CanvasPattern = dom.window.CanvasPattern;
(global as any).ImageData = dom.window.ImageData;

// ResizeObserver polyfill for tests
if (!(global as any).ResizeObserver) {
  (global as any).ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// DragEvent polyfill
if (!(dom.window as any).DragEvent) {
  Object.defineProperty(dom.window, 'DragEvent', {
    value: class DragEvent {}
  });
}

// BroadcastChannel polyfill
if (!(global as any).BroadcastChannel) {
  (global as any).BroadcastChannel = class {
    channelName: string;
    listeners: any[] = [];
    constructor(channelName: string) {
      this.channelName = channelName;
    }
    postMessage(message: any) {
      this.listeners.forEach(listener => listener({data: message}));
    }
    addEventListener(event: string, listener: any) {
      if (event === 'message') {
        this.listeners.push(listener);
      }
    }
    removeEventListener(event: string, listener: any) {
      if (event === 'message') {
        this.listeners = this.listeners.filter(l => l !== listener);
      }
    }
    close() {
      this.listeners = [];
    }
  };
}

// Build version
(global as any).__buildVersion = '';

// localStorage mock for amis-formula tests
const localStorageMock = (function() {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (i: number) => {
      const keys = Object.keys(store);
      return keys[i] || null;
    }
  };
})();
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true
});

// Provide Jest globals using Vitest's vi
const jestFn = vi.fn();
const jest = {
  fn: jestFn,
  fns: {},
  mocks: {},
  mock: vi.mock,
  doMock: vi.mock,
  dontMock: vi.unmock,
  setMock: () => {},
  require: () => {},
  requireActual: vi.importOriginal,
  requireMock: vi.mock,
  clearAllMocks: vi.clearAllMocks,
  resetAllMocks: vi.resetAllMocks,
  restoreAllMocks: vi.restoreAllMocks,
  setTimeout: setTimeout as any,
  clearTimeout: clearTimeout as any,
  advanceTimersByTime: vi.advanceTimersByTime,
  useFakeTimers: vi.useFakeTimers,
  useRealTimers: vi.useRealTimers,
  spyOn: vi.spyOn
} as any;

(globalThis as any).jest = jest;
