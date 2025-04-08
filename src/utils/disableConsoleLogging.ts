/**
 * Disables all console logging by replacing console methods with no-op functions
 */
export const disableConsoleLogging = () => {
  // Store original console methods to restore them if needed
  const originalConsole = {
    log: console.log,
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error,
    group: console.group,
    groupCollapsed: console.groupCollapsed,
    groupEnd: console.groupEnd,
    trace: console.trace,
    dir: console.dir,
    dirxml: console.dirxml,
    table: console.table,
    count: console.count,
    countReset: console.countReset,
    time: console.time,
    timeLog: console.timeLog,
    timeEnd: console.timeEnd,
    timeStamp: console.timeStamp,
    assert: console.assert,
  };

  // Create no-op function
  const noop = () => {};

  // Override all console methods with no-op function
  console.log = noop;
  console.debug = noop;
  console.info = noop;
  console.info = noop;
  console.warn = noop;
  console.error = noop;
  console.group = noop;
  console.groupCollapsed = noop;
  console.groupEnd = noop;
  console.trace = noop;
  console.dir = noop;
  console.dirxml = noop;
  console.table = noop;
  console.count = noop;
  console.countReset = noop;
  console.time = noop;
  console.timeLog = noop;
  console.timeEnd = noop;
  console.timeStamp = noop;
  console.assert = noop;

  // Return function to restore original console if needed
  return () => {
    Object.assign(console, originalConsole);
  };
}; 
