import { parseCookies } from 'nookies'

import { BookRecord, db } from './db'
import { fileToEpub, readBlob } from './file'
import { isNativePlatform } from './platform'
import { deserializeData, DATA_FILENAME, mapToToken, serializeData } from './sync'

/** Extract cover from an epub File and save it to db.covers (upsert). */
async function extractAndSaveCover(bookId: string, file: File): Promise<void> {
  try {
    const epub = await fileToEpub(file)
    let url: string | null = await epub.coverUrl()

    // Fallback: scan the zip for an image named 'cover'
    if (!url && (epub.archive as any)?.zip) {
      const zip = (epub.archive as any).zip
      const files: string[] = Object.keys(zip.files)
      const candidates = ['cover.jpg', 'cover.jpeg', 'cover.png', 'OEBPS/cover.jpg', 'OPS/cover.jpg']
      let match = candidates.find((c) => files.includes(c))
      if (!match) {
        match = files.find(
          (f) => f.toLowerCase().includes('cover') && /\.(jpg|jpeg|png)$/i.test(f),
        )
      }
      if (match) {
        const blob = await zip.file(match)?.async('blob')
        if (blob) url = URL.createObjectURL(blob)
      }
    }

    let cover: string | null = null
    if (url) {
      const blob = await fetch(url).then((res) => res.blob())
      cover = await readBlob((r) => r.readAsDataURL(blob))
    }

    await db?.covers.put({ id: bookId, cover })
  } catch (err) {
    console.warn(`Could not extract cover for ${bookId}:`, err)
  }
}

// ─── Native (Android via Capacitor) Google Drive OAuth ─────────────────────────
// On the web the refresh token lives in a cookie and is exchanged by the Next.js
// API routes (/api/refresh). Those routes do not exist in the static APK, so on
// native we run the OAuth 2.0 authorization-code flow with PKCE through Chrome
// Custom Tabs (@capacitor/browser + @capacitor/app) and refresh client-side.

const NATIVE_REDIRECT_URI = 'com.easyepub.reader:/oauth2callback'
const NATIVE_REFRESH_KEY = 'native-gdrive-refresh-token'
const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token'
const DRIVE_SCOPES =
  'https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file'

export { isNativePlatform }

function base64UrlEncode(bytes: Uint8Array): string {
  let str = ''
  for (const b of bytes) str += String.fromCharCode(b)
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function randomBase64Url(byteLength = 32): string {
  const arr = new Uint8Array(byteLength)
  crypto.getRandomValues(arr)
  return base64UrlEncode(arr)
}

async function pkceChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return base64UrlEncode(new Uint8Array(digest))
}

function nativeGoogleClientId(): string {
  return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''
}

let _nativeAccessToken: string | null = null
let _nativeAccessTokenExpiresAt = 0

function storeNativeTokens(tokens: {
  accessToken: string
  refreshToken?: string
  expiresIn: number
}) {
  _nativeAccessToken = tokens.accessToken
  _nativeAccessTokenExpiresAt = Date.now() + tokens.expiresIn * 1000
  if (tokens.refreshToken) {
    localStorage.setItem(NATIVE_REFRESH_KEY, tokens.refreshToken)
  }
}

async function exchangeNativeCode(code: string, verifier: string) {
  const body = new URLSearchParams({
    code,
    client_id: nativeGoogleClientId(),
    redirect_uri: NATIVE_REDIRECT_URI,
    grant_type: 'authorization_code',
    code_verifier: verifier,
  })
  const res = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })
  if (!res.ok) throw new Error(`Google token exchange failed (${res.status})`)
  const data = await res.json()
  if (!data.access_token) throw new Error('Google did not return an access token')
  return {
    accessToken: data.access_token as string,
    refreshToken: data.refresh_token as string | undefined,
    expiresIn: (data.expires_in as number) || 3600,
  }
}

async function refreshNativeToken(refreshToken: string) {
  const body = new URLSearchParams({
    client_id: nativeGoogleClientId(),
    refresh_token: refreshToken,
    grant_type: 'refresh_token',
  })
  const res = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })
  if (!res.ok) throw new Error(`Google token refresh failed (${res.status})`)
  const data = await res.json()
  if (!data.access_token) throw new Error('Google did not refresh the access token')
  return {
    accessToken: data.access_token as string,
    expiresIn: (data.expires_in as number) || 3600,
  }
}

async function getNativeAccessToken(): Promise<string> {
  if (
    _nativeAccessToken &&
    Date.now() < _nativeAccessTokenExpiresAt - 60 * 1000
  ) {
    return _nativeAccessToken
  }
  const refreshToken = localStorage.getItem(NATIVE_REFRESH_KEY)
  if (!refreshToken) throw new Error('No Google Drive sign-in found')
  const tokens = await refreshNativeToken(refreshToken)
  storeNativeTokens(tokens)
  return tokens.accessToken
}

export function isNativeGoogleSignedIn(): boolean {
  return isNativePlatform() && !!localStorage.getItem(NATIVE_REFRESH_KEY)
}

export async function signInWithGoogleNative(): Promise<void> {
  const [{ Browser }, { App }] = await Promise.all([
    import('@capacitor/browser'),
    import('@capacitor/app'),
  ])

  const verifier = randomBase64Url(64)
  const challenge = await pkceChallenge(verifier)
  const state = randomBase64Url(16)

  const params = new URLSearchParams({
    client_id: nativeGoogleClientId(),
    redirect_uri: NATIVE_REDIRECT_URI,
    response_type: 'code',
    scope: DRIVE_SCOPES,
    access_type: 'offline',
    prompt: 'consent',
    code_challenge: challenge,
    code_challenge_method: 'S256',
    state,
  })
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`

  let resolveCode: (c: string) => void = () => {}
  let rejectCode: (e: any) => void = () => {}
  const codePromise = new Promise<string>((resolve, reject) => {
    resolveCode = resolve
    rejectCode = reject
  })

  let settled = false
  const finish = (fn: () => void) => {
    if (settled) return
    settled = true
    clearTimeout(timer)
    fn()
  }
  const timer = setTimeout(() => {
    Browser.close().catch(() => {})
    finish(() => rejectCode(new Error('Google sign-in timed out')))
  }, 120_000)

  const handle = await App.addListener('appUrlOpen', (data: any) => {
    if (settled) return
    let url: URL
    try {
      url = new URL(data.url)
    } catch {
      return
    }
    if (url.protocol !== 'com.easyepub.reader:') return

    const error = url.searchParams.get('error')
    if (error) {
      Browser.close().catch(() => {})
      return finish(() => rejectCode(new Error(`Google OAuth error: ${error}`)))
    }
    if (url.searchParams.get('state') !== state) {
      Browser.close().catch(() => {})
      return finish(() => rejectCode(new Error('Google OAuth state mismatch')))
    }
    const authCode = url.searchParams.get('code')
    if (!authCode) {
      Browser.close().catch(() => {})
      return finish(() => rejectCode(new Error('No authorization code received')))
    }
    Browser.close().catch(() => {})
    finish(() => resolveCode(authCode))
  })

  try {
    await Browser.open({ url: authUrl })
    const code = await codePromise
    const tokens = await exchangeNativeCode(code, verifier)
    storeNativeTokens(tokens)
  } finally {
    clearTimeout(timer)
    await handle.remove().catch(() => {})
    await Browser.close().catch(() => {})
  }
}

export async function signOutNativeGoogle(): Promise<void> {
  _nativeAccessToken = null
  _nativeAccessTokenExpiresAt = 0
  localStorage.removeItem(NATIVE_REFRESH_KEY)
}

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
  if (isNativePlatform()) {
    return getNativeAccessToken()
  }

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

// ─── Internal helpers ─────────────────────────────────────────────────────────

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

/**
 * Generic upload: creates or updates a file in appDataFolder.
 * Supports any Blob (JSON metadata or binary epub).
 */
async function upsertFileInAppData(
  filename: string,
  blob: Blob,
  mimeType: string,
): Promise<string> {
  const token = await getGoogleAccessToken()
  const existingFileId = await findFileIdInAppData(filename)

  if (existingFileId) {
    const res = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=media`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': mimeType,
        },
        body: blob,
      },
    )
    if (!res.ok) throw new Error(`Failed to update ${filename} in Google Drive`)
    const data = await res.json()
    return data.id as string
  } else {
    const metadata = {
      name: filename,
      parents: ['appDataFolder'],
      mimeType,
    }
    const formData = new FormData()
    formData.append(
      'metadata',
      new Blob([JSON.stringify(metadata)], { type: 'application/json' }),
    )
    formData.append('file', blob)

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
    if (!res.ok) throw new Error(`Failed to upload ${filename} to Google Drive`)
    const data = await res.json()
    return data.id as string
  }
}

// ─── Metadata (data.json) ─────────────────────────────────────────────────────

export async function uploadDataToGDrive(books: BookRecord[]) {
  const fileContent = serializeData(books)
  await upsertFileInAppData(
    DATA_FILENAME,
    new Blob([fileContent], { type: 'application/json' }),
    'application/json',
  )
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

// ─── Book files (.epub) ───────────────────────────────────────────────────────

/** Returns the remote filename for a book's epub in appDataFolder */
function epubRemoteName(bookId: string, bookName: string) {
  return `books/${bookId}/${bookName}`
}

export interface EpubSyncProgress {
  bookId: string
  bookName: string
  status: 'uploading' | 'done' | 'error'
  error?: string
}

/**
 * Uploads one epub file to Google Drive (appDataFolder/books/<bookId>/<name.epub>).
 * Returns true on success.
 */
export async function uploadEpubToGDrive(
  bookId: string,
  file: File,
): Promise<void> {
  const remoteName = epubRemoteName(bookId, file.name)
  await upsertFileInAppData(
    remoteName,
    file,
    'application/epub+zip',
  )
}

/**
 * Downloads an epub from Google Drive and restores it in IndexedDB.
 * Returns the File object, or null if not found remotely.
 */
export async function downloadEpubFromGDrive(
  book: BookRecord,
): Promise<File | null> {
  const token = await getGoogleAccessToken()
  const remoteName = epubRemoteName(book.id, book.name)
  const fileId = await findFileIdInAppData(remoteName)
  if (!fileId) return null

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )
  if (!res.ok) throw new Error(`Failed to download epub for "${book.name}"`)
  const blob = await res.blob()
  return new File([blob], book.name, { type: 'application/epub+zip' })
}

/**
 * Full sync: uploads metadata JSON + all epub files that are not yet on Drive.
 * Calls onProgress for each book processed.
 */
export async function fullSyncToGDrive(
  onProgress?: (p: EpubSyncProgress) => void,
): Promise<void> {
  const [books, files] = await Promise.all([
    db?.books.toArray() ?? [],
    db?.files.toArray() ?? [],
  ])

  // 1. Metadata
  await uploadDataToGDrive(books)

  // 2. Epub files
  for (const fileRecord of files) {
    const book = books.find((b) => b.id === fileRecord.id)
    if (!book) continue

    onProgress?.({ bookId: book.id, bookName: book.name, status: 'uploading' })

    try {
      await uploadEpubToGDrive(book.id, fileRecord.file)
      onProgress?.({ bookId: book.id, bookName: book.name, status: 'done' })
    } catch (err: any) {
      console.error(`Error uploading ${book.name}:`, err)
      onProgress?.({
        bookId: book.id,
        bookName: book.name,
        status: 'error',
        error: err?.message ?? String(err),
      })
    }
  }
}

/**
 * Download all books from Drive that are missing locally.
 * Restores both metadata and epub files.
 */
export async function fullSyncFromGDrive(
  onProgress?: (p: EpubSyncProgress) => void,
): Promise<void> {
  // 1. Download metadata
  const remoteBooks = await downloadDataFromGDrive()
  if (!remoteBooks || remoteBooks.length === 0) return

  const localFiles = await db?.files.toArray() ?? []
  const localFileIds = new Set(localFiles.map((f) => f.id))

  // Upsert book records
  await db?.books.bulkPut(remoteBooks)

  // 2. Download epub files that are missing locally
  for (const book of remoteBooks) {
    if (localFileIds.has(book.id)) continue // already have the file

    onProgress?.({ bookId: book.id, bookName: book.name, status: 'uploading' })

    try {
      const file = await downloadEpubFromGDrive(book)
      if (file) {
        await db?.files.put({ id: book.id, file })
        // Extract and save cover (same logic as addFile in file.ts)
        await extractAndSaveCover(book.id, file)
        onProgress?.({ bookId: book.id, bookName: book.name, status: 'done' })
      } else {
        onProgress?.({
          bookId: book.id,
          bookName: book.name,
          status: 'error',
          error: 'Not found on Drive',
        })
      }
    } catch (err: any) {
      onProgress?.({
        bookId: book.id,
        bookName: book.name,
        status: 'error',
        error: err?.message ?? String(err),
      })
    }
  }
}
