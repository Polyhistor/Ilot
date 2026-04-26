import { defineType, defineField } from 'sanity'

export const localizedText = defineType({
  name: 'localizedText',
  title: 'Localized Text',
  type: 'object',
  fields: [
    defineField({
      name: 'en',
      title: 'English',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'id',
      title: 'Bahasa Indonesia',
      type: 'text',
      rows: 4,
    }),
  ],
})
