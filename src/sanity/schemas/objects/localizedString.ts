import { defineType, defineField } from 'sanity'

export const localizedString = defineType({
  name: 'localizedString',
  title: 'Localized String',
  type: 'object',
  fields: [
    defineField({
      name: 'en',
      title: 'English',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'id',
      title: 'Bahasa Indonesia',
      type: 'string',
    }),
  ],
})
