import { localizedString } from './objects/localizedString'
import { localizedText } from './objects/localizedText'
import { seoFields } from './objects/seoFields'
import { category } from './documents/category'
import { subCategory } from './documents/subCategory'
import { service } from './documents/service'

export const schemaTypes = [
  // objects
  localizedString,
  localizedText,
  seoFields,
  // documents
  category,
  subCategory,
  service,
]
