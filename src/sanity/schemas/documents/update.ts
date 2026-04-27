import { defineType, defineField } from 'sanity'

export const update = defineType({
  name: 'update',
  title: 'Regulatory Update',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'localizedString',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: (doc: any) => doc?.title?.en ?? '', maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'localizedText',
      description: 'Short description shown on listing cards and the service banner.',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'localizedRichText',
      description: 'Full regulation detail in plain language. If brief, the Summary field alone is enough.',
    }),
    defineField({
      name: 'severity',
      title: 'Severity',
      type: 'string',
      options: {
        list: [
          { title: 'Info', value: 'info' },
          { title: 'Warning', value: 'warning' },
          { title: 'Critical', value: 'critical' },
        ],
        layout: 'radio',
      },
      initialValue: 'info',
      description: 'Critical = immediate client action required; Warning = monitor closely; Info = awareness only.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'effectiveDate',
      title: 'Effective Date',
      type: 'date',
      description: 'When the regulation change takes effect (YYYY-MM-DD).',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'affectedServices',
      title: 'Affected Services',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'service' }],
          options: {
            // Use a GROQ filter so the picker queries directly instead of
            // relying on the full-text search index (which lags after bulk import).
            filter: ({ searchQuery }: { searchQuery: string }) => ({
              filter: searchQuery
                ? 'isActive == true && name.en match $q'
                : 'isActive == true',
              params: searchQuery ? { q: `*${searchQuery}*` } : {},
            }),
          },
        },
      ],
      description: 'Services impacted by this regulatory change. Used to surface this update on service detail pages.',
    }),
    defineField({
      name: 'sourceUrl',
      title: 'Source URL',
      type: 'url',
      description: 'Link to official government regulation or announcement.',
    }),
    defineField({
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
      description: 'Uncheck to hide this update site-wide. Use when a regulation has been superseded or reversed.',
    }),
  ],
  orderings: [
    { title: 'Newest first', name: 'publishedAtDesc', by: [{ field: 'publishedAt', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'title.en', subtitle: 'severity' },
  },
})
