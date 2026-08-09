import { parseCookies } from 'nookies'

import { BookRecord } from './db'
import { deserializeData, DATA_FILENAME, mapToToken, serializeData } from './sync'

let _gdriveAccessToken: string | null = null
let _gdriveAccessTokenExpiresAt = 0
let _gdriveReq: Promise<string> | undefined

export function getGoogleAuthUrl(redirectUri: string): string {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''
  const scope = encodeURIComponent(
    'https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file',
  )
  const state = encodeURIComponent(JSON.stringify({ redirectUri }))

  return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri,
  )}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${state}`
}

export async function getGoogleAccessToken(): Promise<string> {
  if (
    _gdriveAccessToken &&
    Date.now() < _gdriveAccessTokenExpiresAt - 60 * 1000
  ) {
    return _gdriveAccessToken
  }

  const cookies = parseCookies()
  const tokenKey = mapToToken['gdrive'] ?? 'gdrive-refresh-token'
  const refreshToken = cookies[tokenKey]
  if (!refreshToken) {
    return Promise.reject(new Error('No Google Drive refresh token found'))
  }

  _gdriveReq ??= fetch(`/api/refresh?provider=gdrive`)
    .then((res) => {
      if (!res.ok) throw new Error('Failed to refresh Google Drive token')
      return res.json()
    })
    .then((data) => {
      _gdriveAccessToken = data.accessToken
      _gdriveAccessTokenExpiresAt = data.accessTokenExpiresAt
      return data.accessToken
    })
    .finally(() => {
      _gdriveReq = undefined
    })

  return _gdriveReq
}

async function findFileIdInAppData(filename: string): Promise<string | null> {
  const token = await getGoogleAccessToken()
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${encodeURIComponent(
      filename,
    )}'+and+trashed=false&fields=files(id,name)`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )
  if (!res.ok) return null
  const data = await res.json()
  if (data.files && data.files.length > 0) {
    return data.files[0].id
  }
  return null
}

export async function uploadDataToGDrive(books: BookRecord[]) {
  const token = await getGoogleAccessToken()
  const fileContent = serializeData(books)
  const existingFileId = await findFileIdInAppData(DATA_FILENAME)

  if (existingFileId) {
    const res = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=media`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: fileContent,
      },
    )
    if (!res.ok) throw new Error('Failed to update data.json in Google Drive')
    return res.json()
  } else {
    const metadata = {
      name: DATA_FILENAME,
      parents: ['appDataFolder'],
      mimeType: 'application/json',
    }
    const formData = new FormData()
    formData.append(
      'metadata',
      new Blob([JSON.stringify(metadata)], { type: 'application/json' }),
    )
    formData.append(
      'file',
      new Blob([fileContent], { type: 'application/json' }),
    )

    const res = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      },
    )
    if (!res.ok) throw new Error('Failed to upload data.json to Google Drive')
    return res.json()
  }
}

export async function downloadDataFromGDrive(): Promise<BookRecord[] | null> {
  const token = await getGoogleAccessToken()
  const fileId = await findFileIdInAppData(DATA_FILENAME)
  if (!fileId) return null

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )
  if (!res.ok) throw new Error('Failed to download data.json from Google Drive')
  const text = await res.text()
  return deserializeData(text)
}
