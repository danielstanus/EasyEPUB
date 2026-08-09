import type { NextApiRequest, NextApiResponse } from 'next'
import nookies from 'nookies'

import { mapToToken } from '@flow/reader/sync'

import { dbx } from '../utils'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (
    typeof req.query.state !== 'string' ||
    typeof req.query.code !== 'string'
  ) {
    return res.status(400).end()
  }

  const state = JSON.parse(req.query.state)

  const provider = (req.query.provider as string) || 'dropbox'
  const tokenKey = mapToToken[provider] ?? mapToToken['dropbox'] ?? 'dropbox-refresh-token'

  let refreshToken = ''

  if (provider === 'gdrive') {
    const params = new URLSearchParams({
      code: req.query.code,
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirect_uri: state.redirectUri,
      grant_type: 'authorization_code',
    })

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })

    const tokenData = await tokenRes.json()
    if (!tokenData.refresh_token) {
      return res.status(400).json({ error: 'No refresh_token returned by Google', tokenData })
    }
    refreshToken = tokenData.refresh_token
  } else {
    const response = await dbx.auth.getAccessTokenFromCode(
      state.redirectUri,
      req.query.code,
    )
    const result = response.result as any
    refreshToken = result.refresh_token
  }

  nookies.set({ res }, tokenKey, refreshToken, {
    maxAge: 365 * 24 * 60 * 60,
    secure: true,
    path: '/',
  })

  // https://stackoverflow.com/questions/4694089/sending-browser-cookies-during-a-302-redirect
  res.redirect(302, '/success')
}
