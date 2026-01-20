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
  const query = {
    from: mock(() => query),
    where: mock(() => query),
    values: mock(() => query),
    returning: mock(() => query),
    execute: mock(() => Promise.resolve([])),
    orderBy: mock(() => query),
    limit: mock(() => query),
    offset: mock(() => query),
    leftJoin: mock(() => query),
    innerJoin: mock(() => query),
    rightJoin: mock(() => query),
    fullJoin: mock(() => query),
    // Make it awaitable - resolves to empty array
    then: mock((resolve: any) => resolve([])),
    // Also support array methods directly
    filter: mock(() => []),
    map: mock(() => []),
    forEach: mock(() => {}),
    [Symbol.iterator]: function* () {},
  };
  return query;
};

const createMockDelete = () => {
  const del = {
    where: mock(() => del),
    returning: mock(() => del),
    execute: mock(() => Promise.resolve()),
    then: mock((resolve: any) => resolve()),
  };
  return del;
};

mock.module("./src/db/index.ts", () => ({
  db: {
    insert: mock(() => ({
      values: mock(() => ({
        returning: mock(() => createMockQuery()),
        onConflictDoNothing: mock(() => createMockQuery()),
        execute: mock(() => Promise.resolve()),
      })),
    })),
    select: mock(() => createMockQuery()),
    update: mock(() => createMockQuery()),
    delete: mock(() => createMockDelete()),
  },
}));
