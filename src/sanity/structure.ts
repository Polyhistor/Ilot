import type { StructureResolver } from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Categories')
        .child(
          S.documentTypeList('category')
            .title('Categories')
            .child((categoryId) =>
              S.list()
                .title('Category')
                .items([
                  S.listItem()
                    .title('Edit category')
                    .child(S.document().documentId(categoryId).schemaType('category')),
                  S.listItem()
                    .title('Sub-Categories')
                    .child(
                      S.documentList()
                        .title('Sub-Categories')
                        .filter('_type == "subCategory" && category._ref == $categoryId')
                        .params({ categoryId })
                        .child((subCategoryId) =>
                          S.list()
                            .title('Sub-Category')
                            .items([
                              S.listItem()
                                .title('Edit sub-category')
                                .child(
                                  S.document()
                                    .documentId(subCategoryId)
                                    .schemaType('subCategory')
                                ),
                              S.listItem()
                                .title('Services')
                                .child(
                                  S.documentList()
                                    .title('Services')
                                    .filter(
                                      '_type == "service" && subCategory._ref == $subCategoryId'
                                    )
                                    .params({ subCategoryId })
                                ),
                            ])
                        )
                    ),
                  S.listItem()
                    .title('All services in this category')
                    .child(
                      S.documentList()
                        .title('Services')
                        .filter('_type == "service" && category._ref == $categoryId')
                        .params({ categoryId })
                    ),
                ])
            )
        ),
      S.divider(),
      S.listItem()
        .title('Blog Posts')
        .child(
          S.documentTypeList('post')
            .title('Blog Posts')
            .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])
        ),
      S.listItem()
        .title('Authors')
        .child(S.documentTypeList('author').title('Authors')),
      S.divider(),
      S.documentTypeListItem('subCategory').title('All Sub-Categories'),
      S.documentTypeListItem('service').title('All Services'),
    ])
