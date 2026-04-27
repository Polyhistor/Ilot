import { createClient } from '@sanity/client'
import { apiVersion, dataset, projectId, useCdn } from '../env'

// Server-side read token — required because the Sanity dataset is private.
// Never expose this in env vars prefixed with NEXT_PUBLIC_.
const token = process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_WRITE_TOKEN

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn,
  perspective: 'published',
  token,
})
