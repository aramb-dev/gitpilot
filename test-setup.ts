import { Window } from "happy-dom";

const window = new Window();
global.window = window as any;
global.document = window.document as any;
global.navigator = window.navigator as any;
global.HTMLElement = window.HTMLElement as any;
global.Node = window.Node as any;
global.HTMLButtonElement = window.HTMLButtonElement as any;
global.HTMLInputElement = window.HTMLInputElement as any;
// Add other globals as needed
