import { metadata, viewport } from 'next-sanity/studio'
import StudioClient from './studio-client'

export { metadata, viewport }

export const dynamic = 'force-dynamic'

export default function StudioPage() {
  return <StudioClient />
}
