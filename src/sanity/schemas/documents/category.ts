import { defineType, defineField } from 'sanity'

export const category = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: (doc: any) => doc?.name?.en ?? '',
        maxLength: 96,
      },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'name', title: 'Name', type: 'localizedString', validation: (r) => r.required() }),
    defineField({ name: 'tagline', title: 'Tagline', type: 'localizedString' }),
    defineField({
      name: 'iconName',
      title: 'Icon (Lucide name)',
      type: 'string',
      description: 'Exact name from lucide.dev — e.g. "Plane", "Scale", "Building2".',
    }),
    defineField({ name: 'coverImage', title: 'Cover Image', type: 'image', options: { hotspot: true } }),
    defineField({
      name: 'accentColor',
      title: 'Accent Color (hex)',
      type: 'string',
      description: 'Dark accent hex, e.g. #1e3a8a',
      validation: (r) =>
        r.regex(/^#[0-9a-fA-F]{6}$/, { name: 'hex color' }).warning('Should be a 6-digit hex like #1e3a8a'),
    }),
    defineField({ name: 'tintColor', title: 'Tint Color (hex, optional)', type: 'string' }),
    defineField({ name: 'midColor', title: 'Mid Color (hex, optional)', type: 'string' }),
    defineField({ name: 'sortOrder', title: 'Sort Order', type: 'number', initialValue: 0 }),
    defineField({ name: 'isActive', title: 'Active', type: 'boolean', initialValue: true }),
  ],
  preview: {
    select: { title: 'name.en', subtitle: 'slug.current' },
  },
  orderings: [
    { title: 'Sort order', name: 'sortOrderAsc', by: [{ field: 'sortOrder', direction: 'asc' }] },
  ],
})
