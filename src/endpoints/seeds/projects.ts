import type { Media, Tenant, User } from '@/payload-types'
import { RequiredDataFromCollectionSlug } from 'payload'

export type PostArgs = {
    heroImage: Media
    blockImage: Media
    author: User
    tenant: Tenant
}

export const project1: (args: PostArgs) => RequiredDataFromCollectionSlug<'posts'> = ({
    heroImage,
    blockImage,
    author,
    tenant,
}) => {
    return {
        slug: 'digital-horizons',
        tenant: tenant,
        _status: 'published',
        authors: [author],
        content: {
            root: {
                type: "root",
                children: [
                    {
                        type: "paragraph",
                        children: [
                            {
                                type: "text",
                                detail: 0,
                                format: 0,
                                mode: "normal",
                                style: "",
                                text: "You can create, edit and delete projects by adding, modifying or removing *.mdx files in the src/app/work/projects directory."
                            }
                        ],
                        direction: "ltr",
                        format: "",
                        indent: 0,
                        version: 1
                    }
                ],
                direction: "ltr",
                format: "",
                indent: 0,
                version: 1
            }
        },
        heroImage: heroImage.id,
        meta: {
            description:
                'Dive into the marvels of modern innovation, where the only constant is change. A journey where pixels and data converge to craft the future.',
            image: heroImage.id,
            title: 'Digital Horizons: A Glimpse into Tomorrow',
        },
        relatedPosts: [], // this is populated by the seed script
        title: 'Digital Horizons: A Glimpse into Tomorrow',
    }
}
