import { defineType, defineField } from 'sanity'

export const subCategory = defineType({
  name: 'subCategory',
  title: 'Sub-Category',
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
      title: 'Parent Category',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: (r) => r.required(),
    }),
    defineField({ name: 'sortOrder', title: 'Sort Order', type: 'number', initialValue: 0 }),
    defineField({ name: 'isActive', title: 'Active', type: 'boolean', initialValue: true }),
  ],
  preview: {
    select: { title: 'name.en', subtitle: 'category.name.en' },
  },
})
