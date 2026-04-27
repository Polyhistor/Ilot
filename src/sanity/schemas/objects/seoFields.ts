import { defineType, defineField } from 'sanity'

export const seoFields = defineType({
  name: 'seoFields',
  title: 'SEO',
  type: 'object',
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: 'metaTitle',
      title: 'Meta Title (overrides default)',
      type: 'localizedString',
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta Description (overrides default)',
      type: 'localizedText',
    }),
  ],
})
