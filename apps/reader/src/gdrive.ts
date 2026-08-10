import { parseCookies } from 'nookies'

import { BookRecord, db } from './db'
import { fileToEpub, readBlob } from './file'
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
