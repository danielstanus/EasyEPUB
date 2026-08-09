import clsx from 'clsx'
import { useCallback, useState } from 'react'

import { RenditionSpread } from '@flow/epubjs/types/rendition'
import { useTranslation } from '@flow/reader/hooks'
import { reader, useReaderSnapshot } from '@flow/reader/models'
import {
  defaultSettings,
  TypographyConfiguration,
  useSettings,
} from '@flow/reader/state'
import { keys } from '@flow/reader/utils'

import { SearchableSelect, SearchableSelectOption } from '../Form'
import { PaneViewProps, PaneView, Pane } from '../base'

// Fonts bundled with the app (self-hosted), always available
const BUNDLED_FONT_FAMILIES = [
  'Roboto',
  'Roboto Serif',
  'Literata',
  'Newsreader',
  'Source Serif 4',
  'Atkinson Hyperlegible',
]

// Fallback fonts shown when `queryLocalFonts` is unavailable
// (e.g. non-Chromium browsers or before permission is granted)
const FALLBACK_FONT_FAMILIES = [
  'serif',
  'sans-serif',
  'monospace',
  'Georgia, serif',
  'Times New Roman, serif',
  'Arial, Helvetica, sans-serif',
  'Verdana, Geneva, sans-serif',
  'Courier New, monospace',
]

const FONT_SIZES = [12, 14, 16, 18, 20, 22, 24, 26, 28]
const FONT_WEIGHTS = [100, 200, 300, 400, 500, 600, 700, 800, 900]
const LINE_HEIGHTS = [1, 1.2, 1.4, 1.6, 1.8, 2, 2.2, 2.5, 3]
const ZOOMS = [1, 1.1, 1.2, 1.3, 1.4, 1.5, 2]

enum TypographyScope {
  Book,
  Global,
}

export const TypographyView: React.FC<PaneViewProps> = (props) => {
  const { focusedBookTab } = useReaderSnapshot()
  const [settings, setSettings] = useSettings()
  const [scope, setScope] = useState(TypographyScope.Book)
  const t = useTranslation('typography')

  const [localFonts, setLocalFonts] = useState<string[]>()

  const { fontFamily, fontSize, fontWeight, lineHeight, zoom, spread } =
    scope === TypographyScope.Book
      ? focusedBookTab?.book.configuration?.typography ?? defaultSettings
      : settings

  const setTypography = useCallback(
    <K extends keyof TypographyConfiguration>(
      k: K,
      v: TypographyConfiguration[K],
    ) => {
      if (scope === TypographyScope.Book) {
        reader.focusedBookTab?.updateBook({
          configuration: {
            ...reader.focusedBookTab.book.configuration,
            typography: {
              ...reader.focusedBookTab.book.configuration?.typography,
              [k]: v,
            },
          },
        })
      } else {
        setSettings((prev) => ({
          ...prev,
          [k]: v,
        }))
      }
    },
    [scope, setSettings],
  )

  const queryLocalFonts = useCallback(async () => {
    if (localFonts) return
    if (!('queryLocalFonts' in window)) {
      console.error('queryLocalFonts is not available')
      return
    }

    try {
      const fonts = await window.queryLocalFonts()
      const uniqueFonts = Array.from(new Set(fonts.map((f) => f.family)))
      setLocalFonts(uniqueFonts)
    } catch (error) {
      console.error('Error querying local fonts:', error)
    }
  }, [localFonts])

  const fontOptions = Array.from(
    new Set([
      ...BUNDLED_FONT_FAMILIES,
      ...(localFonts?.length ? localFonts : FALLBACK_FONT_FAMILIES),
    ]),
  )

  const fontFamilyOptions: SearchableSelectOption[] = [
    { value: '', label: t('default') },
    ...(fontFamily && !fontOptions.includes(fontFamily)
      ? [{ value: fontFamily, label: fontFamily }]
      : []),
    ...fontOptions.map((font) => ({ value: font, label: font })),
  ]
  const fontSizeOptions: SearchableSelectOption[] = [
    { value: '', label: t('default') },
    ...(fontSize && !FONT_SIZES.includes(parseInt(fontSize))
      ? [{ value: fontSize, label: fontSize }]
      : []),
    ...FONT_SIZES.map((size) => ({
      value: `${size}px`,
      label: `${size}px`,
    })),
  ]
  const fontWeightOptions: SearchableSelectOption[] = [
    { value: '', label: t('default') },
    ...(fontWeight && !FONT_WEIGHTS.includes(fontWeight)
      ? [{ value: String(fontWeight), label: String(fontWeight) }]
      : []),
    ...FONT_WEIGHTS.map((weight) => ({
      value: String(weight),
      label: String(weight),
    })),
  ]
  const lineHeightOptions: SearchableSelectOption[] = [
    { value: '', label: t('default') },
    ...(lineHeight && !LINE_HEIGHTS.includes(lineHeight)
      ? [{ value: String(lineHeight), label: String(lineHeight) }]
      : []),
    ...LINE_HEIGHTS.map((lh) => ({
      value: String(lh),
      label: String(lh),
    })),
  ]
  const zoomOptions: SearchableSelectOption[] = [
    { value: '', label: t('default') },
    ...(zoom && !ZOOMS.includes(zoom)
      ? [{ value: String(zoom), label: String(zoom) }]
      : []),
    ...ZOOMS.map((z) => ({
      value: String(z),
      label: String(z),
    })),
  ]

  return (
    <PaneView {...props}>
      <div className="typescale-body-medium flex gap-2 px-5 pb-2 !text-[13px]">
        {keys(TypographyScope)
          .filter((k) => isNaN(Number(k)))
          .map((scopeName) => (
            <button
              key={scopeName}
              className={clsx(
                TypographyScope[scopeName] === scope
                  ? 'text-on-surface-variant'
                  : 'text-outline/60',
              )}
              onClick={() => setScope(TypographyScope[scopeName])}
            >
              {t(`scope.${scopeName.toLowerCase()}`)}
            </button>
          ))}
      </div>
      <Pane
        headline={t('title')}
        className="space-y-3 px-5 pt-2 pb-4"
        key={`${scope}${focusedBookTab?.id}`}
      >
        <SearchableSelect
          name={t('page_view')}
          value={spread ?? RenditionSpread.Auto}
          options={[
            {
              value: RenditionSpread.None,
              label: t('page_view.single_page'),
            },
            {
              value: RenditionSpread.Auto,
              label: t('page_view.double_page'),
            },
          ]}
          onChange={(v) => {
            setTypography('spread', v as RenditionSpread)
          }}
        />
        <SearchableSelect
          name={t('font_family')}
          value={fontFamily ?? ''}
          options={fontFamilyOptions}
          placeholder={t('default')}
          onOpen={queryLocalFonts}
          onChange={(v) => {
            setTypography('fontFamily', v || undefined)
          }}
        />
        <SearchableSelect
          name={t('font_size')}
          value={fontSize ?? ''}
          options={fontSizeOptions}
          placeholder={t('default')}
          onChange={(v) => {
            setTypography('fontSize', v || undefined)
          }}
        />
        <SearchableSelect
          name={t('font_weight')}
          value={fontWeight ? String(fontWeight) : ''}
          options={fontWeightOptions}
          placeholder={t('default')}
          onChange={(v) => {
            setTypography('fontWeight', v ? Number(v) : undefined)
          }}
        />
        <SearchableSelect
          name={t('line_height')}
          value={lineHeight ? String(lineHeight) : ''}
          options={lineHeightOptions}
          placeholder={t('default')}
          onChange={(v) => {
            setTypography('lineHeight', v ? Number(v) : undefined)
          }}
        />
        <SearchableSelect
          name={t('zoom')}
          value={zoom ? String(zoom) : ''}
          options={zoomOptions}
          placeholder={t('default')}
          onChange={(v) => {
            setTypography('zoom', v ? Number(v) : undefined)
          }}
        />
      </Pane>
    </PaneView>
  )
}
