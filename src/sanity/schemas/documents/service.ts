import { defineType, defineField } from 'sanity'

export const service = defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  fields: [
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: (doc: any) => doc?.name?.en ?? '', maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'name', title: 'Name', type: 'localizedString', validation: (r) => r.required() }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'subCategory',
      title: 'Sub-Category',
      type: 'reference',
      to: [{ type: 'subCategory' }],
    }),
    defineField({ name: 'description', title: 'Description', type: 'localizedText' }),
    defineField({ name: 'targetClient', title: 'Target Client', type: 'localizedString' }),
    defineField({ name: 'keyDeliverables', title: 'Key Deliverables / Outcome', type: 'localizedText' }),
    defineField({ name: 'estimatedTimeline', title: 'Estimated Timeline', type: 'localizedString' }),
    defineField({ name: 'realTimeWork', title: 'Real-Time Work', type: 'localizedString' }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'string',
      description: 'Free-text price as shown on the service detail page. Examples: "Rp22,000,000", "18.000.000 +$600", "Start Rp.55.000.000". Leave empty for "Contact us for pricing".',
    }),
    defineField({
      name: 'requiredDocsUrl',
      title: 'Required Documents URL',
      type: 'url',
      description: 'Google Docs link to the required-documents file. The site renders a "Download PDF" button that uses /export?format=pdf on this URL. The doc must be set to "Anyone with link can view".',
      validation: (r) =>
        r.uri({ scheme: ['http', 'https'] }).custom((v: string | undefined) => {
          if (!v) return true
          if (!/docs\.google\.com\/document/.test(v)) {
            return 'Expected a Google Docs URL (docs.google.com/document/...). Other URLs may not export to PDF correctly.'
          }
          return true
        }),
    }),
    defineField({ name: 'whatsappMessage', title: 'WhatsApp Pre-filled Message', type: 'localizedText' }),
    defineField({ name: 'seo', title: 'SEO', type: 'seoFields' }),
    defineField({ name: 'note', title: 'Note', type: 'localizedText' }),
    defineField({ name: 'sortOrder', title: 'Sort Order', type: 'number', initialValue: 0 }),
    defineField({ name: 'isActive', title: 'Active', type: 'boolean', initialValue: true }),
    defineField({
      name: 'lastVerifiedAt',
      title: 'Last Verified At',
      type: 'datetime',
      description: 'Date when the information for this service was last confirmed current by the Ilot team.',
    }),
  ],
  preview: {
    select: { title: 'name.en' },
  },
})
