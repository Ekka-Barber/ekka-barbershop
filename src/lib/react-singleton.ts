import * as ReactNamespace from "react-original"

const GLOBAL_KEY = "__EKKA_REACT_SINGLETON__"

type ReactWithInternals = typeof ReactNamespace & {
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?: unknown
}

const globalObject = globalThis as typeof globalThis & {
  [GLOBAL_KEY]?: ReactWithInternals
}

const reactInstance = ReactNamespace as ReactWithInternals
const existingInstance = globalObject[GLOBAL_KEY]

if (!existingInstance) {
  globalObject[GLOBAL_KEY] = reactInstance
} else if (existingInstance !== reactInstance) {
  const internals = existingInstance.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
  if (internals) {
    reactInstance.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = internals
  }
}

const {
  Children,
  Component,
  Fragment,
  Profiler,
  PureComponent,
  StrictMode,
  Suspense,
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
  act,
  cloneElement,
  createContext,
  createElement,
  createFactory,
  createRef,
  forwardRef,
  isValidElement,
  lazy,
  memo,
  startTransition,
  unstable_act,
  useCallback,
  useContext,
  useDebugValue,
  useDeferredValue,
  useEffect,
  useId,
  useImperativeHandle,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
  version,
} = reactInstance

export {
  Children,
  Component,
  Fragment,
  Profiler,
  PureComponent,
  StrictMode,
  Suspense,
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
  act,
  cloneElement,
  createContext,
  createElement,
  createFactory,
  createRef,
  forwardRef,
  isValidElement,
  lazy,
  memo,
  startTransition,
  unstable_act,
  useCallback,
  useContext,
  useDebugValue,
  useDeferredValue,
  useEffect,
  useId,
  useImperativeHandle,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
  version,
}

export * from "react-original"
export default reactInstance
