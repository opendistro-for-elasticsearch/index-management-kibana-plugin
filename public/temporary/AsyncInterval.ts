// Code from https://github.com/elastic/eui
// Used under the Apache-2.0 license.

// This is from EUI library, but cannot be used until we are at 7.2+
// This is a temporary import for 7.0 and 7.1
export default class AsyncInterval {
  timeoutId: number | undefined;
  isStopped: boolean = false;
  __pendingFn: Function | undefined;

  constructor(fn: Function, refreshInterval: number) {
    this.setAsyncInterval(fn, refreshInterval);
  }

  setAsyncInterval = (fn: Function, ms: number) => {
    if (!this.isStopped) {
      this.timeoutId = window.setTimeout(async () => {
        if (document.visibilityState === "visible") {
          this.__pendingFn = await fn();
        }
        this.setAsyncInterval(fn, ms);
      }, ms);
    }
  };

  stop = () => {
    this.isStopped = true;
    window.clearTimeout(this.timeoutId);
  };
}
