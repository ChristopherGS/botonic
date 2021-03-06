import {
  CmsException,
  Content,
  ContentType,
  TopContent,
  TopContentType,
} from '../cms'
import { isOfType } from '../util/enums'

export enum ContentFieldType {
  TEXT = 'Text',
  SHORT_TEXT = 'Short text',
  KEYWORDS = 'Keywords',
  TITLE = 'Title',
  SUBTITLE = 'Subtitle',
  BUTTONS = 'Buttons',
  IMAGE = 'Image',
  URL = 'URL',
}

export enum ContentFieldValueType {
  STRING = 'string',
  STRING_ARRAY = 'string[]',
  REFERENCE = 'reference',
  REFERENCE_ARRAY = 'reference[]',
  ASSET = 'asset',
}

export class ContentField {
  /**
   * Used for keywords.
   * Maybe we should use instead a comma, since it's error prone that in Excel
   * the array values are ; separated, but in contentful dashboard they must be
   * separated by commas (a workaround is adding a validation on contentful dashboard
   * to prevent ; on array fields)
   */
  static STRING_ARRAY_SEPARATOR = ';'

  constructor(
    readonly fieldType: ContentFieldType,
    readonly cmsName: string,
    readonly valueType: ContentFieldValueType,
    readonly isLocalized: boolean
  ) {}

  parse(fieldValue: string): any {
    switch (this.valueType) {
      case ContentFieldValueType.STRING:
        return fieldValue
      case ContentFieldValueType.STRING_ARRAY:
        return fieldValue
          .split(ContentField.STRING_ARRAY_SEPARATOR)
          .map(kw => kw.trim())
      default:
        throw new CmsException(`${this.valueType} cannot be parsed yet`)
    }
  }

  getValue(content: Content): any {
    if (this.fieldType == ContentFieldType.SHORT_TEXT) {
      return (content as TopContent).common.shortText
    } else if (this.fieldType == ContentFieldType.KEYWORDS) {
      return (content as TopContent).common.keywords
    }
    return (content as any)[this.cmsName]
  }

  isNotEmptyAt(content: Content): boolean {
    const val = this.getValue(content)
    if (Array.isArray(val)) {
      return val.length > 0
    }
    return val
  }
}

/* eslint-disable prettier/prettier*/
export const CONTENT_FIELDS = new Map<ContentFieldType, ContentField>(
  pairs([
    new ContentField(ContentFieldType.TEXT, 'text', ContentFieldValueType.STRING, true),
    new ContentField(ContentFieldType.SHORT_TEXT, 'shortText', ContentFieldValueType.STRING, true),
    new ContentField(ContentFieldType.KEYWORDS, 'keywords', ContentFieldValueType.STRING_ARRAY, true),
    new ContentField(ContentFieldType.TITLE, 'title', ContentFieldValueType.STRING, true),
    new ContentField(ContentFieldType.SUBTITLE, 'subtitle', ContentFieldValueType.STRING, true),
    new ContentField(ContentFieldType.BUTTONS, 'buttons', ContentFieldValueType.REFERENCE_ARRAY, true),
    new ContentField(ContentFieldType.IMAGE, 'pic', ContentFieldValueType.ASSET, true),
    new ContentField(ContentFieldType.URL, 'url', ContentFieldValueType.STRING, true),
  ]))
/* eslint-enable prettier/prettier*/

function pairs(cfs: ContentField[]): [ContentFieldType, ContentField][] {
  return cfs.map(cf => [cf.fieldType, cf])
}

export function contentFieldByCmsName(cmsName: string): ContentField {
  for (const cf of CONTENT_FIELDS.values()) {
    if (cf.cmsName == cmsName) {
      return cf
    }
  }
  throw new CmsException(`No ContentField found for cmsName ${cmsName}`)
}

export class I18nField {
  constructor(readonly name: ContentFieldType, readonly value: string) {}
}

const FIELDS_PER_CONTENT_TYPE: { [type: string]: ContentFieldType[] } = {
  [ContentType.BUTTON]: [ContentFieldType.TEXT],
  [ContentType.CAROUSEL]: [],
  [ContentType.ELEMENT]: [
    ContentFieldType.TITLE,
    ContentFieldType.SUBTITLE,
    ContentFieldType.BUTTONS,
  ],
  [ContentType.STARTUP]: [ContentFieldType.TEXT, ContentFieldType.BUTTONS],
  [ContentType.TEXT]: [ContentFieldType.TEXT, ContentFieldType.BUTTONS],
  [ContentType.URL]: [ContentFieldType.URL],
}

export function getFieldsForContentType(
  contentType: ContentType
): ContentFieldType[] {
  let fields = FIELDS_PER_CONTENT_TYPE[contentType]
  if (!fields) {
    throw new CmsException(`Invalid content type ${contentType}`)
  }
  fields = [...fields]
  if (isOfType(contentType, TopContentType)) {
    fields.push(ContentFieldType.KEYWORDS)
    fields.push(ContentFieldType.SHORT_TEXT)
  }
  return fields
}
