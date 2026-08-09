import type { NextApiRequest, NextApiResponse } from 'next'

import { mapToToken } from '@flow/reader/sync'

import { dbx } from './utils'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const provider = (req.query.provider as string) || 'dropbox'
  const tokenKey = mapToToken[provider] ?? mapToToken['dropbox'] ?? 'dropbox-refresh-token'
  const token = req.cookies[tokenKey]
  if (typeof token !== 'string') {
    return res.status(401).end()
  }

  if (provider === 'gdrive') {
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
      refresh_token: token,
      grant_type: 'refresh_token',
    })

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })

    const tokenData = await tokenRes.json()
    if (!tokenData.access_token) {
      return res.status(401).json({ error: 'Failed to refresh Google Drive token', tokenData })
    }

    return res.json({
      accessToken: tokenData.access_token,
      accessTokenExpiresAt: Date.now() + (tokenData.expires_in || 3600) * 1000,
    })
  }

  dbx.auth.setRefreshToken(token)
  await dbx.auth.refreshAccessToken()

  res.json({
    accessToken: dbx.auth.getAccessToken(),
    accessTokenExpiresAt: dbx.auth.getAccessTokenExpiresAt(),
  })
}
