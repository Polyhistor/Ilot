// ESM shim for react/compiler-runtime that explicitly re-exports `c`.
// React's compiler-runtime entry is a CJS conditional require, which
// webpack cannot statically enumerate named exports from. Sanity's
// React-Compiler-built bundles do `import { c } from 'react/compiler-runtime'`
// and that import resolves to undefined without this shim.
import _runtime from 'react/compiler-runtime'

export const c = _runtime.c

export default _runtime
