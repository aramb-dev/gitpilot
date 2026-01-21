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

// Mock database for tests that need it
// This mock supports the drizzle ORM chaining pattern
const createMockQuery = () => {
  const query: any = {};
  
  const methods = [
    'from', 'where', 'values', 'returning', 'onConflictDoNothing', 
    'onConflictDoUpdate', 'limit', 'offset', 'orderBy', 'set', 
    'leftJoin', 'innerJoin', 'rightJoin', 'fullJoin'
  ];
  
  methods.forEach(method => {
    query[method] = mock(() => query);
  });
  
  query.execute = mock(() => Promise.resolve([]));
  query.then = mock((resolve: any) => {
    if (typeof resolve === 'function') {
      return Promise.resolve([]).then(resolve);
    }
    return Promise.resolve([]);
  });
  query.catch = mock((reject: any) => {
    if (typeof reject === 'function') {
      return Promise.resolve([]).catch(reject);
    }
    return Promise.resolve([]);
  });
  
  // Also support array methods directly if awaited
  query.filter = mock(() => []);
  query.map = mock(() => []);
  query.forEach = mock(() => { });
  
  return query;
};

const mockDb = {
  select: mock(() => createMockQuery()),
  insert: mock(() => createMockQuery()),
  update: mock(() => createMockQuery()),
  delete: mock(() => createMockQuery()),
  query: {
    findFirst: mock(() => Promise.resolve(null)),
    findMany: mock(() => Promise.resolve([])),
  },
};

// Apply mock to multiple possible import paths
const dbPaths = [
  "@/db",
  "@/db/index",
  "/Volumes/T5 EVOexFAT/GitHub/gitpilot/src/db/index.ts",
];

dbPaths.forEach(path => {
  mock.module(path, () => ({
    db: mockDb,
  }));
});
