import en_US from '../locales/en-US'
import ja_JP from '../locales/ja-JP'
import zh_CN from '../locales/zh-CN'
import de_DE from '../locales/de-DE'
import es_ES from '../locales/es-ES'

// Locale display names
export const localeNames: Record<string, string> = {
  'en-US': 'English',
  'zh-CN': '简体中文',
  'ja-JP': '日本語',
  'de-DE': 'Deutsch',
  'es-ES': 'Español',
}

// Pick the closest supported locale: prefer the user's saved choice,
// then fall back to the browser language.
export function detectLocale(): string {
  if (typeof window === 'undefined') return 'en-US'
  try {
    const saved = window.localStorage.getItem('settings')
    if (saved) {
      const { locale } = JSON.parse(saved)
      if (locale && locale in localeNames) return locale
    }
  } catch {
    // Ignore unreadable or malformed storage
  }
  const lang = (navigator.language || 'en-US').slice(0, 2).toLowerCase()
  const match = Object.keys(localeNames).find(
    (l) => l.slice(0, 2).toLowerCase() === lang,
  )
  return match ?? 'en-US'
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  'en-US': en_US,
  'zh-CN': zh_CN,
  'ja-JP': ja_JP,
  'de-DE': de_DE,
  'es-ES': es_ES,
} as const
