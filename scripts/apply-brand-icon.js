const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

function getSvg(theme = 'blue') {
  if (theme === 'red') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <defs>
      <linearGradient id="bgGradRed" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#e11d48" />
        <stop offset="60%" stop-color="#be123c" />
        <stop offset="100%" stop-color="#4c0519" />
      </linearGradient>
      <linearGradient id="leftPageRed" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fb7185" />
        <stop offset="100%" stop-color="#e11d48" />
      </linearGradient>
      <linearGradient id="rightPageRed" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#fff1f2" />
      </linearGradient>
      <linearGradient id="goldRed" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fbbf24" />
        <stop offset="100%" stop-color="#f59e0b" />
      </linearGradient>
      <filter id="shadowRed" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#3b0312" flood-opacity="0.45" />
      </filter>
      <filter id="bookShadowRed" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#26020c" flood-opacity="0.35" />
      </filter>
    </defs>
    <rect x="24" y="24" width="464" height="464" rx="108" fill="url(#bgGradRed)" filter="url(#shadowRed)" />
    <rect x="25" y="25" width="462" height="462" rx="107" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="2" />
    <g transform="translate(0, 4)" filter="url(#bookShadowRed)">
      <path d="M 112 344 C 172 376, 226 348, 256 328 C 286 348, 340 376, 400 344 L 388 184 C 336 156, 286 182, 256 198 C 226 182, 176 156, 124 184 Z" fill="#3b0312" opacity="0.4" />
      <path d="M 96 326 C 160 364, 222 334, 256 312 L 256 142 C 218 120, 154 122, 96 158 Z" fill="url(#leftPageRed)" />
      <path d="M 416 326 C 352 364, 290 334, 256 312 L 256 142 C 294 120, 358 122, 416 158 Z" fill="url(#rightPageRed)" />
      <path d="M 254 142 L 256 312 L 258 142 Z" fill="#be123c" opacity="0.4" />
      <rect x="136" y="180" width="16" height="106" rx="8" fill="#ffffff" />
      <rect x="136" y="180" width="88" height="16" rx="8" fill="#ffffff" />
      <rect x="136" y="225" width="68" height="16" rx="8" fill="#ffffff" />
      <rect x="136" y="270" width="88" height="16" rx="8" fill="#ffffff" />
      <rect x="288" y="180" width="88" height="16" rx="8" fill="#e11d48" opacity="0.85" />
      <rect x="288" y="225" width="68" height="16" rx="8" fill="#e11d48" opacity="0.85" />
      <rect x="288" y="270" width="88" height="16" rx="8" fill="#e11d48" opacity="0.85" />
      <path d="M 245 106 L 267 106 L 267 150 L 256 140 L 245 150 Z" fill="url(#goldRed)" />
      <polygon points="380,108 384,120 396,124 384,128 380,140 376,128 364,124 376,120" fill="#ffffff" opacity="0.9" />
      <circle cx="406" cy="142" r="3.5" fill="#fb7185" opacity="0.8" />
    </g>
  </svg>`
  }

  // Default: Blue Edition
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284c7" />
      <stop offset="60%" stop-color="#0369a1" />
      <stop offset="100%" stop-color="#082f49" />
    </linearGradient>
    <linearGradient id="leftPage" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
    <linearGradient id="rightPage" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#f0f9ff" />
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#f59e0b" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#031d33" flood-opacity="0.45" />
    </filter>
    <filter id="bookShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#021424" flood-opacity="0.35" />
    </filter>
  </defs>
  <rect x="24" y="24" width="464" height="464" rx="108" fill="url(#bgGrad)" filter="url(#shadow)" />
  <rect x="25" y="25" width="462" height="462" rx="107" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2" />
  <g transform="translate(0, 4)" filter="url(#bookShadow)">
    <path d="M 112 344 C 172 376, 226 348, 256 328 C 286 348, 340 376, 400 344 L 388 184 C 336 156, 286 182, 256 198 C 226 182, 176 156, 124 184 Z" fill="#031d33" opacity="0.4" />
    <path d="M 96 326 C 160 364, 222 334, 256 312 L 256 142 C 218 120, 154 122, 96 158 Z" fill="url(#leftPage)" />
    <path d="M 416 326 C 352 364, 290 334, 256 312 L 256 142 C 294 120, 358 122, 416 158 Z" fill="url(#rightPage)" />
    <path d="M 254 142 L 256 312 L 258 142 Z" fill="#0369a1" opacity="0.4" />
    <rect x="136" y="180" width="16" height="106" rx="8" fill="#ffffff" />
    <rect x="136" y="180" width="88" height="16" rx="8" fill="#ffffff" />
    <rect x="136" y="225" width="68" height="16" rx="8" fill="#ffffff" />
    <rect x="136" y="270" width="88" height="16" rx="8" fill="#ffffff" />
    <rect x="288" y="180" width="88" height="16" rx="8" fill="#0284c7" opacity="0.85" />
    <rect x="288" y="225" width="68" height="16" rx="8" fill="#0284c7" opacity="0.85" />
    <rect x="288" y="270" width="88" height="16" rx="8" fill="#0284c7" opacity="0.85" />
    <path d="M 245 106 L 267 106 L 267 150 L 256 140 L 245 150 Z" fill="url(#gold)" />
    <polygon points="380,108 384,120 396,124 384,128 380,140 376,128 364,124 376,120" fill="#ffffff" opacity="0.9" />
    <circle cx="406" cy="142" r="3.5" fill="#38bdf8" opacity="0.8" />
  </g>
</svg>`
}

async function applyIcons(theme = 'blue') {
  console.log(`Generating brand icons for theme: ${theme}...`)
  const svg = getSvg(theme)
  const svgBuffer = Buffer.from(svg)

  const readerIconsDir = path.join(__dirname, '../apps/reader/public/icons')
  const websiteIconsDir = path.join(__dirname, '../apps/website/public/icons')

  const targetSizes = [
    { name: '512.png', size: 512 },
    { name: '192.png', size: 192 },
    { name: 'maskable-512.png', size: 512 },
    { name: 'maskable-192.png', size: 192 },
    { name: 'icon-128.png', size: 128 },
    { name: 'icon-48.png', size: 48 },
    { name: 'icon-16.png', size: 16 }
  ]

  for (const { name, size } of targetSizes) {
    const readerDest = path.join(readerIconsDir, name)
    await sharp(svgBuffer).resize(size, size).png().toFile(readerDest)
    console.log(`Generated reader: ${name} (${size}x${size})`)
  }

  // Website icons
  for (const name of ['512.png', '192.png']) {
    const size = name.startsWith('512') ? 512 : 192
    const websiteDest = path.join(websiteIconsDir, name)
    await sharp(svgBuffer).resize(size, size).png().toFile(websiteDest)
    console.log(`Generated website: ${name} (${size}x${size})`)
  }

  console.log(`\nSuccessfully applied EasyEPUB ${theme} icons to all apps!`)
}

const themeArg = process.argv[2] || 'blue'
applyIcons(themeArg).catch(console.error)
