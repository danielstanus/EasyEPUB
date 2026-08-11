/**
 * Reader color themes.
 *
 * Each preset combines a background color, a text color and a UI color
 * scheme. Users can also pick background and text colors independently,
 * which is why `ThemeConfiguration` stores them separately.
 */

export type ThemePresetId =
  | 'light'
  | 'dark'
  | 'night'
  | 'sepia'
  | 'gray'
  | 'mint'

export type ThemeScheme = 'light' | 'dark'

export interface ThemePreset {
  id: ThemePresetId
  /** Locale key for the preset name (e.g. `theme.preset.light`) */
  labelKey: string
  backgroundColor: string
  textColor: string
  scheme: ThemeScheme
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'light',
    labelKey: 'theme.preset.light',
    backgroundColor: '#ffffff',
    textColor: '#1a1a1a',
    scheme: 'light',
  },
  {
    id: 'dark',
    labelKey: 'theme.preset.dark',
    backgroundColor: '#24292e',
    textColor: '#bfc8ca',
    scheme: 'dark',
  },
  {
    id: 'night',
    labelKey: 'theme.preset.night',
    backgroundColor: '#000000',
    textColor: '#bfc8ca',
    scheme: 'dark',
  },
  {
    id: 'sepia',
    labelKey: 'theme.preset.sepia',
    backgroundColor: '#f4ecd8',
    textColor: '#5b4636',
    scheme: 'light',
  },
  {
    id: 'gray',
    labelKey: 'theme.preset.gray',
    backgroundColor: '#e3e3e3',
    textColor: '#1f2937',
    scheme: 'light',
  },
  {
    id: 'mint',
    labelKey: 'theme.preset.mint',
    backgroundColor: '#e2f0e5',
    textColor: '#1f3d2b',
    scheme: 'light',
  },
]

export interface ColorOption {
  value: string
  /** Locale key for the color name (e.g. `theme.color.black`) */
  labelKey: string
}

export const BACKGROUND_COLORS: ColorOption[] = [
  { value: '#000000', labelKey: 'theme.color.black' },
  { value: '#ffffff', labelKey: 'theme.color.white' },
  { value: '#2f2f33', labelKey: 'theme.color.graphite' },
  { value: '#f4ecd8', labelKey: 'theme.color.sepia' },
  { value: '#e3e3e3', labelKey: 'theme.color.gray' },
  { value: '#e2f0e5', labelKey: 'theme.color.mint' },
]

export const TEXT_COLORS: ColorOption[] = [
  { value: '#ffffff', labelKey: 'theme.color.white' },
  { value: '#1a1a1a', labelKey: 'theme.color.black' },
  { value: '#e8e8e8', labelKey: 'theme.color.off_white' },
  { value: '#5b4636', labelKey: 'theme.color.sepia_dark' },
]
