class ResizeObserverMock {
  // Méthode appelée lors d'un redimensionnement du composant
  resizeCallback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.resizeCallback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverMock as any;

