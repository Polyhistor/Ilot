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
