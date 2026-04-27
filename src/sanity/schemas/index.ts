import { localizedString } from './objects/localizedString'
import { localizedText } from './objects/localizedText'
import { localizedRichText } from './objects/localizedRichText'
import { seoFields } from './objects/seoFields'
import { category } from './documents/category'
import { subCategory } from './documents/subCategory'
import { service } from './documents/service'
import { author } from './documents/author'
import { post } from './documents/post'
import { update } from './documents/update'

export const schemaTypes = [
  // objects
  localizedString,
  localizedText,
  localizedRichText,
  seoFields,
  // documents
  category,
  subCategory,
  service,
  author,
  post,
  update,
]
