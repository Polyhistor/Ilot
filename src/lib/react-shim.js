'use strict';

// React shim: explicitly re-exports all React named exports so webpack's
// static analysis can resolve named imports like useEffectEvent from
// Sanity's ESM bundles. React's own CJS conditional require() prevents
// webpack from statically enumerating named exports.
//
// Load React via the normal package resolution.
var _react = require('react');

exports.__esModule = true;
exports.default = _react;

exports.Activity = _react.Activity;
exports.Children = _react.Children;
exports.Component = _react.Component;
exports.Fragment = _react.Fragment;
exports.Profiler = _react.Profiler;
exports.PureComponent = _react.PureComponent;
exports.StrictMode = _react.StrictMode;
exports.Suspense = _react.Suspense;
exports.act = _react.act;
exports.cache = _react.cache;
exports.cacheSignal = _react.cacheSignal;
exports.captureOwnerStack = _react.captureOwnerStack;
exports.cloneElement = _react.cloneElement;
exports.createContext = _react.createContext;
exports.createElement = _react.createElement;
exports.createRef = _react.createRef;
exports.forwardRef = _react.forwardRef;
exports.isValidElement = _react.isValidElement;
exports.lazy = _react.lazy;
exports.memo = _react.memo;
exports.startTransition = _react.startTransition;
exports.unstable_useCacheRefresh = _react.unstable_useCacheRefresh;
exports.use = _react.use;
exports.useActionState = _react.useActionState;
exports.useCallback = _react.useCallback;
exports.useContext = _react.useContext;
exports.useDebugValue = _react.useDebugValue;
exports.useDeferredValue = _react.useDeferredValue;
exports.useEffect = _react.useEffect;
exports.useEffectEvent = _react.useEffectEvent;
exports.useId = _react.useId;
exports.useImperativeHandle = _react.useImperativeHandle;
exports.useInsertionEffect = _react.useInsertionEffect;
exports.useLayoutEffect = _react.useLayoutEffect;
exports.useMemo = _react.useMemo;
exports.useOptimistic = _react.useOptimistic;
exports.useReducer = _react.useReducer;
exports.useRef = _react.useRef;
exports.useState = _react.useState;
exports.useSyncExternalStore = _react.useSyncExternalStore;
exports.useTransition = _react.useTransition;
exports.version = _react.version;
