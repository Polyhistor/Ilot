import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getServiceBySlug, getRelatedServices, getAllServiceSlugs } from '@/lib/db/services'
import { ServiceDetail } from '@/components/services/ServiceDetail'
import { RelatedServices } from '@/components/services/RelatedServices'
import { UpdatesBanner } from '@/components/updates/UpdatesBanner'
import { CTABanner } from '@/components/home/CTABanner'

export const revalidate = 60

interface Props {
  params: Promise<{ category: string; slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getAllServiceSlugs()
  return slugs.map(({ category, slug }) => ({ category, slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const service = await getServiceBySlug(slug)
  if (!service) return {}

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ilotlegal.com'

  return {
    title: service.meta_title ?? service.name,
    description:
      service.meta_description ??
      service.description ??
      `${service.name}: professional service by Ilot in Indonesia.`,
    alternates: {
      canonical: `${siteUrl}/${service.category.slug}/${service.slug}`,
    },
  }
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params
  const service = await getServiceBySlug(slug)
  if (!service) notFound()

  const related = service.sub_category_id
    ? await getRelatedServices(service.sub_category_id, service.slug)
    : []

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description ?? '',
    provider: {
      '@type': 'Organization',
      name: 'Ilot',
      url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ilotlegal.com',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ServiceDetail service={service} />
      <UpdatesBanner updates={service.recent_updates} />
      <RelatedServices services={related} categorySlug={service.category.slug} />
      <CTABanner />
    </>
  )
}
