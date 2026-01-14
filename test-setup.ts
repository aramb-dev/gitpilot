console.log("Running test-setup.ts");
import { mock } from "bun:test";
import { Window } from "happy-dom";

const window = new Window();
global.window = window as any;
global.document = window.document as any;
global.navigator = window.navigator as any;
global.HTMLElement = window.HTMLElement as any;
global.Node = window.Node as any;
global.HTMLButtonElement = window.HTMLButtonElement as any;
global.HTMLInputElement = window.HTMLInputElement as any;
global.getComputedStyle = window.getComputedStyle.bind(window) as any;

// Happy DOM global declarations
global.MouseEvent = window.MouseEvent as any;
global.PointerEvent = window.PointerEvent as any;
global.KeyboardEvent = window.KeyboardEvent as any;
global.ProgressEvent = window.ProgressEvent as any;
global.DragEvent = window.DragEvent as any;
global.TouchEvent = window.TouchEvent as any;
global.ClipboardEvent = window.ClipboardEvent as any;
global.FocusEvent = window.FocusEvent as any;
global.InputEvent = window.InputEvent as any;
global.UIEvent = window.UIEvent as any;
global.WheelEvent = window.WheelEvent as any;
global.AnimationEvent = window.AnimationEvent as any;
global.TransitionEvent = window.TransitionEvent as any;
global.SubmitEvent = window.SubmitEvent as any;
global.MessageEvent = window.MessageEvent as any;
global.Event = window.Event as any;

// @ts-ignore
global.Image = window.Image;
// @ts-ignore
global.CSSStyleDeclaration = window.CSSStyleDeclaration;





// localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();

global.localStorage = localStorageMock as any;
