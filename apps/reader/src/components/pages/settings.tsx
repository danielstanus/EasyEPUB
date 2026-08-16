import { useEventListener } from '@literal-ui/hooks'
import Dexie from 'dexie'
import { useRouter } from 'next/router'
import { destroyCookie, parseCookies } from 'nookies'
import React, { useState } from 'react'

import {
  EpubSyncProgress,
  fullSyncFromGDrive,
  fullSyncToGDrive,
  getGoogleAuthUrl,
} from '@flow/reader/gdrive'
import {
  ColorScheme,
  useColorScheme,
  useForceRender,
  useTranslation,
} from '@flow/reader/hooks'
import { reader } from '@flow/reader/models'
import { useSettings } from '@flow/reader/state'
import { dbx, mapToToken, OAUTH_SUCCESS_MESSAGE } from '@flow/reader/sync'

import { localeNames } from '../../../locales'

export const Settings: React.FC = () => {
  const { scheme, setScheme } = useColorScheme()
  const { asPath, push, locale, locales } = useRouter()
  const [settings, setSettings] = useSettings()
  const t = useTranslation('settings')

  return (
    <div
      className="h-full w-full overflow-y-auto overscroll-y-contain bg-white pb-24 dark:bg-gray-900"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 flex h-16 shrink-0 items-center border-b border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-900">
        <button
          onClick={() => {
            if (reader.focusedGroup) {
              reader.removeTab(reader.focusedGroup.selectedIndex)
            }
          }}
          className="mr-2 rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <span className="material-symbols-outlined text-xl">arrow_back</span>
        </button>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t('title')}
        </h1>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="space-y-8">
          {/* Language */}
          <div className="border-b border-gray-200 pb-8 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              {t('language')}
            </h2>
            <p className="mt-1 mb-3 text-sm text-gray-600 dark:text-gray-400">
              {t('language_desc')}
            </p>
            <div className="relative w-full max-w-sm">
              <select
                className="focus:ring-primary w-full appearance-none rounded-lg border-none bg-gray-100 p-3 pr-10 focus:ring-2 dark:bg-gray-800"
                style={{
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  backgroundImage: 'none',
                }}
                value={locale}
                onChange={(e) => {
                  push(asPath, undefined, { locale: e.target.value })
                }}
              >
                {locales?.map((loc) => (
                  <option key={loc} value={loc}>
                    {localeNames[loc] || loc}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                expand_more
              </span>
            </div>
          </div>

          {/* Color Scheme */}
          <div className="border-b border-gray-200 pb-8 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              {t('color_scheme')}
            </h2>
            <p className="mt-1 mb-3 text-sm text-gray-600 dark:text-gray-400">
              {t('color_scheme_desc')}
            </p>
            <div className="relative w-full max-w-sm">
              <select
                className="focus:ring-primary w-full appearance-none rounded-lg border-none bg-gray-100 p-3 pr-10 focus:ring-2 dark:bg-gray-800"
                style={{
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  backgroundImage: 'none',
                }}
                value={scheme}
                onChange={(e) => {
                  setScheme(e.target.value as ColorScheme)
                }}
              >
                <option value="system">{t('color_scheme.system')}</option>
                <option value="light">{t('color_scheme.light')}</option>
                <option value="dark">{t('color_scheme.dark')}</option>
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                expand_more
              </span>
            </div>
          </div>

          {/* Text Selection Menu */}
          <div className="border-b border-gray-200 pb-8 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              {t('text_selection_menu')}
            </h2>
            <label className="mt-3 flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4 rounded"
                checked={!!settings.enableTextSelectionMenu}
                onChange={(e) => {
                  setSettings({
                    ...settings,
                    enableTextSelectionMenu: e.target.checked,
                  })
                }}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t('text_selection_menu.enable')}
              </span>
            </label>
          </div>

          {/* Synchronization */}
          <Synchronization />

          {/* Cache */}
          <div className="border-b border-gray-200 pb-8 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              {t('cache')}
            </h2>
            <p className="mt-1 mb-3 text-sm text-gray-600 dark:text-gray-400">
              {t('cache_desc')}
            </p>
            <button
              className="bg-error-container text-on-error-container rounded-full px-6 py-2 font-medium shadow-sm transition-all hover:shadow-md"
              onClick={() => {
                window.localStorage.clear()
                Dexie.getDatabaseNames().then((names) => {
                  names.forEach((n) => Dexie.delete(n))
                })
              }}
            >
              {t('cache.clear')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const Synchronization: React.FC = () => {
  const [provider, setProvider] = useState<'gdrive' | 'dropbox'>('gdrive')
  const cookies = parseCookies()
  const tokenKey = mapToToken[provider] ?? ''
  const refreshToken = cookies[tokenKey]
  const render = useForceRender()
  const t = useTranslation('settings.synchronization')

  // Upload state
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<EpubSyncProgress[]>([])
  const [uploadDone, setUploadDone] = useState(false)

  // Download state
  const [downloading, setDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState<EpubSyncProgress[]>([])
  const [downloadDone, setDownloadDone] = useState(false)

  useEventListener('message', (e) => {
    if (e.data === OAUTH_SUCCESS_MESSAGE) {
      window.location.reload()
    }
  })

  const handleUpload = async () => {
    setUploading(true)
    setUploadProgress([])
    setUploadDone(false)
    try {
      await fullSyncToGDrive((p) => {
        setUploadProgress((prev) => {
          const idx = prev.findIndex((x) => x.bookId === p.bookId)
          if (idx >= 0) {
            const next = [...prev]
            next[idx] = p
            return next
          }
          return [...prev, p]
        })
      })
      setUploadDone(true)
    } catch (e: any) {
      console.error(e)
      alert('Error al subir a Google Drive: ' + (e?.message || e))
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = async () => {
    setDownloading(true)
    setDownloadProgress([])
    setDownloadDone(false)
    try {
      await fullSyncFromGDrive((p) => {
        setDownloadProgress((prev) => {
          const idx = prev.findIndex((x) => x.bookId === p.bookId)
          if (idx >= 0) {
            const next = [...prev]
            next[idx] = p
            return next
          }
          return [...prev, p]
        })
      })
      setDownloadDone(true)
    } catch (e: any) {
      console.error(e)
      alert('Error al descargar de Google Drive: ' + (e?.message || e))
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="border-b border-gray-200 pb-8 dark:border-gray-700">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white">
        {t('title')}
      </h2>
      <p className="mt-1 mb-3 text-sm text-gray-600 dark:text-gray-400">
        {t('synchronization_desc')}
      </p>

      {/* Service selector + auth */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
        <div className="flex-grow">
          <label
            className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            htmlFor="sync-service"
          >
            {t('service')}
          </label>
          <div className="relative w-full">
            <select
              className="focus:ring-primary w-full appearance-none rounded-lg border-none bg-gray-100 p-3 pr-10 focus:ring-2 dark:bg-gray-800"
              style={{ WebkitAppearance: 'none', MozAppearance: 'none', backgroundImage: 'none' }}
              id="sync-service"
              value={provider}
              onChange={(e) => setProvider(e.target.value as 'gdrive' | 'dropbox')}
            >
              <option value="gdrive">Google Drive</option>
              <option value="dropbox">Dropbox</option>
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              expand_more
            </span>
          </div>
        </div>

        <div className="flex gap-2 sm:pb-0.5">
          {refreshToken ? (
            <button
              className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              onClick={() => { destroyCookie(null, tokenKey); render() }}
            >
              {t('unauthorize')}
            </button>
          ) : (
            <button
              className="bg-primary text-on-primary w-full rounded-full px-6 py-2.5 font-medium shadow-sm transition-all hover:shadow-md sm:w-auto"
              onClick={() => {
                if (provider === 'gdrive') {
                  const redirectUri = window.location.origin + '/api/callback/gdrive'
                  window.open(getGoogleAuthUrl(redirectUri), '_blank')
                } else {
                  const redirectUri = window.location.origin + '/api/callback/dropbox'
                  dbx.auth
                    .getAuthenticationUrl(redirectUri, JSON.stringify({ redirectUri }), 'code', 'offline')
                    .then((url) => window.open(url as string, '_blank'))
                }
              }}
            >
              {t('authorize')}
            </button>
          )}
        </div>
      </div>

      {/* GDrive sync actions — only shown when authorized */}
      {refreshToken && provider === 'gdrive' && (
        <div className="mt-5 space-y-4">
          {/* Upload */}
          <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-white">
                  📤 Subir biblioteca a Drive
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Sube los metadatos y los archivos .epub al Drive.
                </p>
              </div>
              <button
                className="bg-primary text-on-primary shrink-0 rounded-full px-5 py-2 text-sm font-medium shadow-sm transition-all hover:shadow-md disabled:opacity-50"
                onClick={handleUpload}
                disabled={uploading || downloading}
              >
                {uploading ? 'Subiendo…' : uploadDone ? '✓ Listo' : 'Subir'}
              </button>
            </div>

            {uploadProgress.length > 0 && (
              <ul className="mt-3 max-h-36 space-y-1 overflow-y-auto">
                {uploadProgress.map((p) => (
                  <li key={p.bookId} className="flex items-center gap-2 text-xs">
                    <span
                      className={{
                        uploading: 'text-blue-500',
                        done: 'text-green-500',
                        error: 'text-red-500',
                      }[p.status]}
                    >
                      {p.status === 'uploading' && '⏳'}
                      {p.status === 'done' && '✓'}
                      {p.status === 'error' && '✗'}
                    </span>
                    <span className="truncate text-gray-700 dark:text-gray-300">{p.bookName}</span>
                    {p.error && <span className="text-red-400">({p.error})</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Download */}
          <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-white">
                  📥 Restaurar desde Drive
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Descarga los libros que falten en este dispositivo.
                </p>
              </div>
              <button
                className="bg-primary text-on-primary shrink-0 rounded-full px-5 py-2 text-sm font-medium shadow-sm transition-all hover:shadow-md disabled:opacity-50"
                onClick={handleDownload}
                disabled={uploading || downloading}
              >
                {downloading ? 'Descargando…' : downloadDone ? '✓ Listo' : 'Restaurar'}
              </button>
            </div>

            {downloadProgress.length > 0 && (
              <ul className="mt-3 max-h-36 space-y-1 overflow-y-auto">
                {downloadProgress.map((p) => (
                  <li key={p.bookId} className="flex items-center gap-2 text-xs">
                    <span
                      className={{
                        uploading: 'text-blue-500',
                        done: 'text-green-500',
                        error: 'text-red-500',
                      }[p.status]}
                    >
                      {p.status === 'uploading' && '⏳'}
                      {p.status === 'done' && '✓'}
                      {p.status === 'error' && '✗'}
                    </span>
                    <span className="truncate text-gray-700 dark:text-gray-300">{p.bookName}</span>
                    {p.error && <span className="text-red-400">({p.error})</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

Settings.displayName = 'settings'
