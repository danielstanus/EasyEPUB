import { useEventListener } from '@literal-ui/hooks'
import Dexie from 'dexie'
import { useRouter } from 'next/router'
import { destroyCookie, parseCookies } from 'nookies'
import { useState } from 'react'

import { db } from '@flow/reader/db'
import { getGoogleAuthUrl, uploadDataToGDrive } from '@flow/reader/gdrive'
import {
  ColorScheme,
  useColorScheme,
  useForceRender,
  useTranslation,
} from '@flow/reader/hooks'
import { useSettings } from '@flow/reader/state'
import { dbx, mapToToken, OAUTH_SUCCESS_MESSAGE } from '@flow/reader/sync'

import { localeNames } from '../../../locales'
import { Button } from '../Button'
import { Checkbox, Select } from '../Form'
import { Page } from '../Page'

export const Settings: React.FC = () => {
  const { scheme, setScheme } = useColorScheme()
  const { asPath, push, locale, locales } = useRouter()
  const [settings, setSettings] = useSettings()
  const t = useTranslation('settings')

  return (
    <Page headline={t('title')}>
      <div className="space-y-6">
        <Item title={t('language')}>
          <Select
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
          </Select>
        </Item>
        <Item title={t('color_scheme')}>
          <Select
            value={scheme}
            onChange={(e) => {
              setScheme(e.target.value as ColorScheme)
            }}
          >
            <option value="system">{t('color_scheme.system')}</option>
            <option value="light">{t('color_scheme.light')}</option>
            <option value="dark">{t('color_scheme.dark')}</option>
          </Select>
        </Item>
        <Item title={t('text_selection_menu')}>
          <Checkbox
            name={t('text_selection_menu.enable')}
            checked={settings.enableTextSelectionMenu}
            onChange={(e) => {
              setSettings({
                ...settings,
                enableTextSelectionMenu: e.target.checked,
              })
            }}
          />
        </Item>
        <Synchronization />
        <Item title={t('cache')}>
          <Button
            variant="secondary"
            onClick={() => {
              window.localStorage.clear()
              Dexie.getDatabaseNames().then((names) => {
                names.forEach((n) => Dexie.delete(n))
              })
            }}
          >
            {t('cache.clear')}
          </Button>
        </Item>
      </div>
    </Page>
  )
}

const Synchronization: React.FC = () => {
  const [provider, setProvider] = useState<'gdrive' | 'dropbox'>('gdrive')
  const cookies = parseCookies()
  const tokenKey = mapToToken[provider] ?? ''
  const refreshToken = cookies[tokenKey]
  const render = useForceRender()
  const t = useTranslation('settings.synchronization')
  const [syncing, setSyncing] = useState(false)

  useEventListener('message', (e) => {
    if (e.data === OAUTH_SUCCESS_MESSAGE) {
      window.location.reload()
    }
  })

  const handleSyncGDrive = async () => {
    try {
      setSyncing(true)
      const books = (await db?.books.toArray()) || []
      await uploadDataToGDrive(books)
      alert('Sincronización con Google Drive completada.')
    } catch (e: any) {
      console.error(e)
      alert('Error al sincronizar con Google Drive: ' + (e?.message || e))
    } finally {
      setSyncing(false)
    }
  }

  return (
    <Item title={t('title')}>
      <Select
        value={provider}
        onChange={(e) => setProvider(e.target.value as 'gdrive' | 'dropbox')}
      >
        <option value="gdrive">Google Drive</option>
        <option value="dropbox">Dropbox</option>
      </Select>
      <div className="mt-2 space-x-2">
        {refreshToken ? (
          <>
            <Button
              variant="secondary"
              onClick={() => {
                destroyCookie(null, tokenKey)
                render()
              }}
            >
              {t('unauthorize')}
            </Button>
            {provider === 'gdrive' && (
              <Button onClick={handleSyncGDrive} disabled={syncing}>
                {syncing ? '...' : t('synchronization.sync_now')}
              </Button>
            )}
          </>
        ) : (
          <Button
            onClick={() => {
              if (provider === 'gdrive') {
                const redirectUri =
                  window.location.origin + '/api/callback/gdrive'
                const url = getGoogleAuthUrl(redirectUri)
                window.open(url, '_blank')
              } else {
                const redirectUri =
                  window.location.origin + '/api/callback/dropbox'

                dbx.auth
                  .getAuthenticationUrl(
                    redirectUri,
                    JSON.stringify({ redirectUri }),
                    'code',
                    'offline',
                  )
                  .then((url) => {
                    window.open(url as string, '_blank')
                  })
              }
            }}
          >
            {t('authorize')}
          </Button>
        )}
      </div>
    </Item>
  )
}

interface PartProps {
  title: string
}
const Item: React.FC<PartProps> = ({ title, children }) => {
  return (
    <div>
      <h3 className="typescale-title-small text-on-surface-variant">{title}</h3>
      <div className="mt-2">{children}</div>
    </div>
  )
}

Settings.displayName = 'settings'
