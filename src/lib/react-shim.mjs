// ESM shim for React that explicitly re-exports all named exports.
// This allows webpack to statically resolve named imports like useEffectEvent
// from Sanity's ESM bundles, which React's CJS conditional exports prevent.
import _React from 'react'

export const Activity = _React.Activity
export const Children = _React.Children
export const Component = _React.Component
export const Fragment = _React.Fragment
export const Profiler = _React.Profiler
export const PureComponent = _React.PureComponent
export const StrictMode = _React.StrictMode
export const Suspense = _React.Suspense
export const act = _React.act
export const cache = _React.cache
export const cacheSignal = _React.cacheSignal
export const captureOwnerStack = _React.captureOwnerStack
export const cloneElement = _React.cloneElement
export const createContext = _React.createContext
export const createElement = _React.createElement
export const createRef = _React.createRef
export const forwardRef = _React.forwardRef
export const isValidElement = _React.isValidElement
export const lazy = _React.lazy
export const memo = _React.memo
export const startTransition = _React.startTransition
export const unstable_useCacheRefresh = _React.unstable_useCacheRefresh
export const use = _React.use
export const useActionState = _React.useActionState
export const useCallback = _React.useCallback
export const useContext = _React.useContext
export const useDebugValue = _React.useDebugValue
export const useDeferredValue = _React.useDeferredValue
export const useEffect = _React.useEffect
export const useEffectEvent = _React.useEffectEvent
export const useId = _React.useId
export const useImperativeHandle = _React.useImperativeHandle
export const useInsertionEffect = _React.useInsertionEffect
export const useLayoutEffect = _React.useLayoutEffect
export const useMemo = _React.useMemo
export const useOptimistic = _React.useOptimistic
export const useReducer = _React.useReducer
export const useRef = _React.useRef
export const useState = _React.useState
export const useSyncExternalStore = _React.useSyncExternalStore
export const useTransition = _React.useTransition
export const version = _React.version

export default _React
