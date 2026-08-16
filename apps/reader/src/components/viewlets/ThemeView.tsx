import clsx from 'clsx'

import { useAction, useColorScheme, useTranslation } from '@flow/reader/hooks'
import { ThemeConfiguration, useSettings } from '@flow/reader/state'
import {
  BACKGROUND_COLORS,
  TEXT_COLORS,
  THEME_PRESETS,
  ThemePreset,
} from '@flow/reader/themes'

import { PaneViewProps } from '../base'

function isDarkColor(hex: string) {
  const value = hex.replace('#', '')
  const r = parseInt(value.slice(0, 2), 16)
  const g = parseInt(value.slice(2, 4), 16)
  const b = parseInt(value.slice(4, 6), 16)
  return r * 0.299 + g * 0.587 + b * 0.114 < 140
}

export const ThemeView: React.FC<PaneViewProps> = () => {
  const [{ theme }, setSettings] = useSettings()
  const { setScheme } = useColorScheme()
  const [, setAction] = useAction()
  const t = useTranslation()

  const activePreset = THEME_PRESETS.find((p) => p.id === theme?.preset)

  const previewBackground =
    theme?.backgroundColor ?? activePreset?.backgroundColor ?? '#ffffff'
  const previewText = theme?.textColor ?? activePreset?.textColor ?? '#1a1a1a'

  const updateTheme = (patch: Partial<ThemeConfiguration>) => {
    setSettings((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        ...patch,
      },
    }))
  }

  const applyPreset = (preset: ThemePreset) => {
    setScheme(preset.scheme)
    updateTheme({
      preset: preset.id,
      backgroundColor: preset.backgroundColor,
      textColor: preset.textColor,
    })
  }

  const pickBackground = (value: string) => {
    setScheme(isDarkColor(value) ? 'dark' : 'light')
    updateTheme({ preset: undefined, backgroundColor: value })
  }

  const pickTextColor = (value: string) => {
    updateTheme({ preset: undefined, textColor: value })
  }

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
              <span className="material-symbols-outlined text-xl">palette</span>
            </button>
            <h2 className="ml-2 font-semibold text-gray-800 dark:text-white">
              {t('theme.header')}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div
          className="flex-grow space-y-6 overflow-y-auto overscroll-y-contain p-4 pb-16"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {/* Theme Presets */}
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-500 dark:text-gray-400">
              {t('theme.presets')}
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {THEME_PRESETS.map((preset) => {
                const selected = activePreset?.id === preset.id
                return (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    title={t(preset.labelKey)}
                    className="group flex w-14 shrink-0 flex-col items-center gap-1"
                  >
                    <span
                      className={clsx(
                        'relative flex h-20 w-14 flex-col gap-1.5 rounded-lg border p-2 transition-shadow',
                        selected
                          ? 'border-primary ring-primary/20 ring-2'
                          : 'border-gray-300 dark:border-gray-600',
                      )}
                      style={{ backgroundColor: preset.backgroundColor }}
                    >
                      {/* miniature text lines */}
                      <span
                        className="block h-1 w-full rounded-full"
                        style={{
                          backgroundColor: preset.textColor,
                          opacity: 0.9,
                        }}
                      />
                      <span
                        className="block h-1 w-4/5 rounded-full"
                        style={{
                          backgroundColor: preset.textColor,
                          opacity: 0.7,
                        }}
                      />
                      <span
                        className="block h-1 w-3/5 rounded-full"
                        style={{
                          backgroundColor: preset.textColor,
                          opacity: 0.5,
                        }}
                      />
                      {selected && (
                        <span className="border-primary bg-primary absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white dark:border-gray-900">
                          <span className="material-symbols-outlined text-[10px] text-white">
                            check
                          </span>
                        </span>
                      )}
                    </span>
                    <span
                      className={clsx(
                        'text-[11px] leading-tight',
                        selected
                          ? 'text-primary font-semibold'
                          : 'text-gray-500 dark:text-gray-400',
                      )}
                    >
                      {t(preset.labelKey)}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Background Color */}
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-500 dark:text-gray-400">
              {t('theme.background_color_label')}
            </label>
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {BACKGROUND_COLORS.map((option) => {
                const selected = theme?.backgroundColor === option.value
                const checkColor = isDarkColor(option.value) ? '#fff' : '#000'
                return (
                  <button
                    key={option.value}
                    onClick={() => pickBackground(option.value)}
                    title={t(option.labelKey)}
                    className={clsx(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-shadow',
                      selected
                        ? 'border-primary ring-primary/20 ring-2'
                        : 'border-gray-300 dark:border-gray-600',
                    )}
                    style={{ backgroundColor: option.value }}
                  >
                    {selected && (
                      <span
                        className="material-symbols-outlined text-sm"
                        style={{ color: checkColor }}
                      >
                        check
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Text Color */}
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-500 dark:text-gray-400">
              {t('theme.text_color_label')}
            </label>
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {TEXT_COLORS.map((option) => {
                const selected = theme?.textColor === option.value
                return (
                  <button
                    key={option.value}
                    onClick={() => pickTextColor(option.value)}
                    title={t(option.labelKey)}
                    className={clsx(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-shadow',
                      selected
                        ? 'border-primary ring-primary/20 ring-2'
                        : 'border-gray-300 dark:border-gray-600',
                    )}
                    style={{ backgroundColor: option.value }}
                  >
                    {selected && (
                      <span
                        className="material-symbols-outlined text-sm"
                        style={{ color: option.value }}
                      >
                        check
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="shrink-0 border-t border-gray-200 p-4 dark:border-gray-700">
          <div
            className="rounded-xl px-4 py-3"
            style={{ backgroundColor: previewBackground, color: previewText }}
          >
            <p className="text-base font-medium leading-snug">
              The quick brown fox
            </p>
            <p
              className="mt-1 text-[10px] font-medium uppercase tracking-wider"
              style={{ opacity: 0.6 }}
            >
              {t('theme.preview')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
