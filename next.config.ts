import type { NextConfig } from 'next'
import path from 'path'
import { sep } from 'path'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { NormalModuleReplacementPlugin } = require('webpack')

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  webpack: (config) => {
    // Sanity's ESM chunks do `import { useEffectEvent } from 'react'`.
    // React 19's index.js is a CJS conditional-require shim that webpack
    // cannot statically enumerate named exports from (including useEffectEvent).
    //
    // Fix: when a Sanity file resolves 'react', redirect it to our .mjs shim.
    // The shim does explicit `export const useEffectEvent = _React.useEffectEvent`
    // so webpack can find the named export at build time.  The shim itself
    // imports from 'react' outside the sanity context, so it gets the real
    // React module — preserving module identity and React context.
    config.plugins.push(
      new NormalModuleReplacementPlugin(
        /^react$/,
        (resource: { context?: string; request: string }) => {
          const isSanityContext =
            resource.context &&
            (resource.context.includes(`node_modules${sep}sanity`) ||
              resource.context.includes(`node_modules${sep}@sanity`))
          if (isSanityContext) {
            resource.request = path.resolve('./src/lib/react-shim.mjs')
          }
        }
      )
    )
    return config
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
}

export default nextConfig
