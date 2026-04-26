import { createClient } from '@sanity/client'
import { apiVersion, dataset, projectId, useCdn } from '../env'

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn,
  perspective: 'published',
})
