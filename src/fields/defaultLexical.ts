import { Config, type TextFieldSingleValidation } from 'payload'
import {
  AlignFeature,
  BlockquoteFeature,
  BoldFeature,
  ChecklistFeature,
  EXPERIMENTAL_TableFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  IndentFeature,
  InlineCodeFeature,
  InlineToolbarFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  RelationshipFeature,
  StrikethroughFeature,
  SubscriptFeature,
  SuperscriptFeature,
  UnderlineFeature,
  UnorderedListFeature,
  UploadFeature,
  lexicalEditor,
  type LinkFields,
} from '@payloadcms/richtext-lexical'

export const defaultLexical: Config['editor'] = lexicalEditor({
  features: () => {
    return [
      ParagraphFeature(),
      UnderlineFeature(),
      BoldFeature(),
      ItalicFeature(),
      StrikethroughFeature(),
      InlineCodeFeature(),
      SubscriptFeature(),
      SuperscriptFeature(),
      BlockquoteFeature(),
      OrderedListFeature(),
      UnorderedListFeature(),
      ChecklistFeature(),
      AlignFeature(),
      IndentFeature(),
      HorizontalRuleFeature(),
      UploadFeature({
        collections: {
          media: {
            fields: [
              {
                name: 'caption',
                type: 'richText',
                editor: lexicalEditor({
                  features: ({ rootFeatures }) => {
                    return [...rootFeatures, FixedToolbarFeature()]
                  },
                }),
              },
              {
                name: 'alignment',
                type: 'select',
                defaultValue: 'left',
                options: [
                  { label: 'Left', value: 'left' },
                  { label: 'Center', value: 'center' },
                  { label: 'Right', value: 'right' },
                ],
              },
              {
                name: 'enableLink',
                type: 'checkbox',
                label: 'Enable Link',
              },
              {
                name: 'linkURL',
                type: 'text',
                label: 'Link URL',
                admin: {
                  condition: (_data: any, siblingData: any) => siblingData?.enableLink,
                },
              },
            ],
          },
        },
      }),
      EXPERIMENTAL_TableFeature(),
      HeadingFeature({
        enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      }),
      RelationshipFeature({
        enabledCollections: ['pages', 'posts', 'projects'],
      }),
      LinkFeature({
        enabledCollections: ['pages', 'posts', 'projects'],
        fields: ({ defaultFields }) => {
          const defaultFieldsWithoutUrl = defaultFields.filter((field) => {
            if ('name' in field && field.name === 'url') return false
            return true
          })

          return [
            ...defaultFieldsWithoutUrl,
            {
              name: 'url',
              type: 'text',
              admin: {
                condition: (_data, siblingData) => siblingData?.linkType !== 'internal',
              },
              label: ({ t }) => t('fields:enterURL'),
              required: true,
              validate: ((value, options) => {
                if ((options?.siblingData as LinkFields)?.linkType === 'internal') {
                  return true
                }
                return value ? true : 'URL is required'
              }) as TextFieldSingleValidation,
            },
          ]
        },
      }),
      FixedToolbarFeature(),
      InlineToolbarFeature(),
    ]
  },
})
