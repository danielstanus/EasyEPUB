import clsx from 'clsx'
import { useCallback, useEffect, useRef, useState } from 'react'

import { RenditionSpread } from '@flow/epubjs/types/rendition'
import { useAction, useTranslation } from '@flow/reader/hooks'
import { reader, useReaderSnapshot } from '@flow/reader/models'
import { TypographyConfiguration, useSettings } from '@flow/reader/state'

import { PaneViewProps } from '../base'

// Fonts bundled / well-known, always shown at the top
const PINNED_FONTS = [
  'Roboto',
  'Roboto Serif',
  'Literata',
  'Newsreader',
  'Source Serif 4',
  'Atkinson Hyperlegible',
  'Georgia',
  'Times New Roman',
  'Arial',
  'Verdana',
]

enum TypographyScope {
  Book,
  Global,
}

// ─── Font Family Picker ───────────────────────────────────────────────────────

interface FontPickerProps {
  value: string | undefined
  onChange: (v: string | undefined) => void
  placeholder: string
  label: string
}

const FontPicker: React.FC<FontPickerProps> = ({
  value,
  onChange,
  placeholder,
  label,
}) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [localFonts, setLocalFonts] = useState<string[] | null>(null)
  const [loadingFonts, setLoadingFonts] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const [highlighted, setHighlighted] = useState(0)

  // Build full list: pinned first, then local (deduplicated)
  const allFonts = Array.from(
    new Set([
      '',
      ...PINNED_FONTS,
      ...(localFonts ?? []),
    ]),
  )

  const filtered = allFonts.filter((f) =>
    f.toLowerCase().includes(query.toLowerCase()),
  )

  const loadLocalFonts = useCallback(async () => {
    if (localFonts !== null || loadingFonts) return
    if (!('queryLocalFonts' in window)) return
    setLoadingFonts(true)
    try {
      const fonts = await (window as any).queryLocalFonts()
      const unique = Array.from(new Set<string>(fonts.map((f: any) => f.family as string)))
      setLocalFonts(unique as string[])
    } catch {
      setLocalFonts([])
    } finally {
      setLoadingFonts(false)
    }
  }, [localFonts, loadingFonts])

  const openPicker = () => {
    setOpen(true)
    setQuery('')
    setHighlighted(0)
    loadLocalFonts()
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const select = (font: string) => {
    onChange(font || undefined)
    setOpen(false)
    setQuery('')
  }

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Keyboard navigation
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted((h) => Math.max(h - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered[highlighted] !== undefined) select(filtered[highlighted])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  // Scroll highlighted into view
  useEffect(() => {
    const li = listRef.current?.children[highlighted] as HTMLElement | undefined
    li?.scrollIntoView({ block: 'nearest' })
  }, [highlighted])

  const displayValue = value || placeholder

  return (
    <div ref={containerRef} className="relative">
      <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
        {label}
      </label>

      {/* Trigger button */}
      <button
        type="button"
        onClick={openPicker}
        className={clsx(
          'flex w-full items-center justify-between rounded-md border bg-gray-100 px-3 py-2 text-sm transition-colors dark:bg-gray-800',
          open
            ? 'border-primary ring-primary ring-1'
            : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500',
        )}
      >
        <span
          className={clsx(
            'truncate',
            value
              ? 'text-gray-800 dark:text-white'
              : 'text-gray-400 dark:text-gray-500',
          )}
          style={value ? { fontFamily: value } : undefined}
        >
          {displayValue}
        </span>
        <span className="material-symbols-outlined ml-2 shrink-0 text-base text-gray-500 dark:text-gray-400">
          {open ? 'expand_less' : 'expand_more'}
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
          {/* Search input */}
          <div className="border-b border-gray-100 p-2 dark:border-gray-700">
            <div className="flex items-center gap-2 rounded-md bg-gray-100 px-2 py-1.5 dark:bg-gray-800">
              <span className="material-symbols-outlined text-base text-gray-400">
                search
              </span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                placeholder="Search fonts…"
                className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none dark:text-white"
                onChange={(e) => {
                  setQuery(e.target.value)
                  setHighlighted(0)
                }}
                onKeyDown={onKeyDown}
              />
              {query && (
                <button
                  onClick={() => { setQuery(''); setHighlighted(0) }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              )}
            </div>
          </div>

          {/* Font list */}
          <ul
            ref={listRef}
            className="max-h-56 overflow-y-auto py-1"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-400 dark:text-gray-500">
                No fonts found
              </li>
            ) : (
              filtered.map((font, i) => (
                <li
                  key={font || '__default__'}
                  onMouseDown={() => select(font)}
                  onMouseEnter={() => setHighlighted(i)}
                  className={clsx(
                    'flex cursor-pointer items-center justify-between px-3 py-2 text-sm transition-colors',
                    i === highlighted
                      ? 'bg-primary/10 text-primary dark:text-primary-light'
                      : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800',
                  )}
                >
                  {/* Label in the font itself */}
                  <span
                    className="truncate"
                    style={font ? { fontFamily: font } : undefined}
                  >
                    {font || placeholder}
                  </span>

                  {/* Checkmark if selected */}
                  {(value ?? '') === font && (
                    <span className="material-symbols-outlined ml-2 shrink-0 text-base text-green-500">
                      check
                    </span>
                  )}
                </li>
              ))
            )}

            {loadingFonts && (
              <li className="px-3 py-2 text-xs text-gray-400 dark:text-gray-500">
                Loading system fonts…
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export const TypographyView: React.FC<PaneViewProps> = () => {
  const { focusedBookTab } = useReaderSnapshot()
  const [settings, setSettings] = useSettings()
  const [scope, setScope] = useState(TypographyScope.Book)
  const t = useTranslation('typography')
  const [, setAction] = useAction()

  const {
    fontFamily,
    fontSize,
    fontWeight,
    lineHeight,
    zoom,
    spread,
    contentWidthPercent,
  } =
    scope === TypographyScope.Book
      ? {
          ...settings,
          ...(focusedBookTab?.book.configuration?.typography ?? {}),
        }
      : settings

  const setTypography = useCallback(
    <K extends keyof TypographyConfiguration>(
      k: K,
      v: TypographyConfiguration[K],
    ) => {
      if (scope === TypographyScope.Book) {
        const bookTab = reader.focusedBookTab
        if (bookTab) {
          const newConfiguration = JSON.parse(
            JSON.stringify(bookTab.book.configuration || {}),
          )
          if (!newConfiguration.typography) {
            newConfiguration.typography = {}
          }
          newConfiguration.typography[k] = v
          bookTab.updateBook({
            configuration: newConfiguration,
          })
        }
      } else {
        setSettings((prev) => ({
          ...prev,
          [k]: v,
        }))
      }
    },
    [scope, setSettings],
  )

  return (
    <div className="h-full w-full overflow-hidden bg-white dark:bg-gray-900">
      <div className="flex h-full min-w-[220px] flex-col">
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
          <div className="flex items-center">
            <button
              onClick={() => setAction(undefined)}
              className="rounded p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              <span className="material-symbols-outlined text-xl">
                text_fields
              </span>
            </button>
            <h2 className="ml-2 font-semibold text-gray-800 dark:text-white">
              {t('title')}
            </h2>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setScope(TypographyScope.Book)}
            className={clsx(
              'flex-1 py-2 text-sm font-semibold transition-colors',
              scope === TypographyScope.Book
                ? 'border-primary text-primary border-b-2 dark:text-white'
                : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
            )}
          >
            {t('scope.book')}
          </button>
          <button
            onClick={() => setScope(TypographyScope.Global)}
            className={clsx(
              'flex-1 py-2 text-sm font-semibold transition-colors',
              scope === TypographyScope.Global
                ? 'border-primary text-primary border-b-2 dark:text-white'
                : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
            )}
          >
            {t('scope.global')}
          </button>
        </div>

        {/* Controls */}
        <div
          className="flex-grow space-y-5 overflow-y-auto p-4"
          key={`${scope}${focusedBookTab?.id}`}
        >
          {/* Page View */}
          <div>
            <label
              className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400"
              htmlFor="page-view"
            >
              {t('page_view')}
            </label>
            <div className="relative">
              <select
                className="focus:ring-primary focus:border-primary w-full appearance-none rounded-md border-gray-300 bg-gray-100 py-2 pl-3 pr-8 text-sm text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                id="page-view"
                value={spread ?? RenditionSpread.Auto}
                onChange={(e) =>
                  setTypography('spread', e.target.value as RenditionSpread)
                }
              >
                <option value={RenditionSpread.Auto}>
                  {t('page_view.double_page')}
                </option>
                <option value={RenditionSpread.None}>
                  {t('page_view.single_page')}
                </option>
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                expand_more
              </span>
            </div>
          </div>

          {/* Font Family — custom picker */}
          <FontPicker
            label={t('font_family')}
            value={fontFamily}
            placeholder={t('default')}
            onChange={(v) => setTypography('fontFamily', v)}
          />

          {/* Font Size */}
          <NumberField
            name={t('font_size')}
            min={14}
            max={28}
            value={fontSize ? parseInt(fontSize) : undefined}
            onChange={(v) => {
              setTypography('fontSize', v ? v + 'px' : undefined)
            }}
            placeholder={t('default')}
          />

          {/* Font Weight */}
          <NumberField
            name={t('font_weight')}
            min={100}
            max={900}
            step={100}
            value={fontWeight}
            onChange={(v) => {
              setTypography('fontWeight', v || undefined)
            }}
            placeholder={t('default')}
          />

          {/* Line Height */}
          <NumberField
            name={t('line_height')}
            min={1}
            step={0.1}
            value={lineHeight}
            onChange={(v) => {
              setTypography('lineHeight', v || undefined)
            }}
            placeholder={t('default')}
          />

          {/* Content Width */}
          <NumberField
            name={t('content_width')}
            min={50}
            max={100}
            step={5}
            value={contentWidthPercent || 90}
            onChange={(v) => {
              setTypography('contentWidthPercent', v || undefined)
            }}
            placeholder={t('default')}
          />

          {/* Zoom */}
          <NumberField
            name={t('zoom')}
            min={1}
            step={0.1}
            value={zoom}
            onChange={(v) => {
              setTypography('zoom', v || undefined)
            }}
            placeholder={t('default')}
          />

          {/* Reset Button */}
          {scope === TypographyScope.Book && (
            <div className="pt-2">
              <button
                onClick={() => {
                  const bookTab = reader.focusedBookTab
                  if (bookTab) {
                    const newConfiguration = JSON.parse(
                      JSON.stringify(bookTab.book.configuration || {}),
                    )
                    newConfiguration.typography = {}
                    bookTab.updateBook({
                      configuration: newConfiguration,
                    })
                  }
                }}
                className="w-full rounded-md border border-gray-300 bg-white py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                {t('reset_to_global')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── NumberField ──────────────────────────────────────────────────────────────

interface NumberFieldProps {
  name: string
  onChange: (v?: number) => void
  min?: number
  max?: number
  step?: number
  value?: number
  placeholder?: string
}

const NumberField: React.FC<NumberFieldProps> = ({
  name,
  onChange,
  min,
  max,
  step,
  value,
  placeholder,
}) => {
  const ref = useRef<HTMLInputElement>(null)

  if (ref.current && value !== undefined) {
    ref.current.value = value.toString()
  }

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
        {name}
      </label>
      <div className="focus-within:border-primary focus-within:ring-primary flex items-center rounded-md border border-gray-300 focus-within:ring-1 dark:border-gray-600">
        <button
          onClick={() => {
            if (!ref.current) return
            ref.current.stepDown()
            onChange(Number(ref.current.value))
          }}
          className="rounded-l-md px-3 py-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          -
        </button>
        <input
          ref={ref}
          type="number"
          min={min}
          max={max}
          step={step}
          value={value ?? ''}
          placeholder={placeholder}
          className="w-full border-0 bg-transparent py-1.5 text-center text-sm text-gray-800 [appearance:textfield] focus:placeholder-transparent focus:outline-none focus:ring-0 dark:text-white [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          onChange={(e) => {
            onChange(e.target.value ? Number(e.target.value) : undefined)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onChange(
                e.currentTarget.value
                  ? Number(e.currentTarget.value)
                  : undefined,
              )
            }
          }}
        />
        <button
          onClick={() => {
            if (!ref.current) return
            ref.current.stepUp()
            onChange(Number(ref.current.value))
          }}
          className="rounded-r-md px-3 py-1.5 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          +
        </button>
      </div>
    </div>
  )
}
