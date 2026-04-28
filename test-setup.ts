import { Window } from 'happy-dom';

// Setup basic DOM environment for tests
const window = new Window();

// Use type assertion to avoid 'any' where possible or cast through unknown
const g = global as unknown as any;

g.window = window;
g.document = window.document;
g.navigator = window.navigator;
g.HTMLElement = window.HTMLElement;
g.Node = window.Node;
g.HTMLButtonElement = window.HTMLButtonElement;
g.HTMLInputElement = window.HTMLInputElement;
g.getComputedStyle = window.getComputedStyle.bind(window);

// Happy DOM global declarations
g.MouseEvent = window.MouseEvent;
g.PointerEvent = window.PointerEvent;
g.KeyboardEvent = window.KeyboardEvent;
g.ProgressEvent = window.ProgressEvent;
g.DragEvent = window.DragEvent;
g.TouchEvent = window.TouchEvent;
g.ClipboardEvent = window.ClipboardEvent;
g.FocusEvent = window.FocusEvent;
g.InputEvent = window.InputEvent;
g.UIEvent = window.UIEvent;
g.CustomEvent = window.CustomEvent;
g.Event = window.Event;
g.NodeList = window.NodeList;
g.HTMLCollection = window.HTMLCollection;
g.CharacterData = window.CharacterData;
g.Comment = window.Comment;
g.DocumentFragment = window.DocumentFragment;
g.Element = window.Element;
g.SVGElement = window.SVGElement;
g.Text = window.Text;
g.Attr = window.Attr;

// Mocking window.matchMedia
g.window.matchMedia = (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => true,
});

// Mock ResizeObserver
g.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver
g.IntersectionObserver = class IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
};
