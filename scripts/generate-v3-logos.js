const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

function generateV3Logos() {
  const artifactDir = 'C:\\Users\\Dani\\.gemini\\antigravity\\brain\\ec378f95-8f5c-4c9b-851d-dc4d214e2640'

  // Blue Edition: Sleek, high-tech & readable e-book app icon
  const blueV3Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <defs>
      <!-- Background squircle -->
      <linearGradient id="bgGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0284c7" />
        <stop offset="60%" stop-color="#0369a1" />
        <stop offset="100%" stop-color="#082f49" />
      </linearGradient>

      <!-- Left Page Surface Gradient -->
      <linearGradient id="leftPage3" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8" />
        <stop offset="100%" stop-color="#0284c7" />
      </linearGradient>

      <!-- Right Page Surface Gradient -->
      <linearGradient id="rightPage3" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#f0f9ff" />
      </linearGradient>

      <!-- Gold Accent -->
      <linearGradient id="gold3" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fbbf24" />
        <stop offset="100%" stop-color="#f59e0b" />
      </linearGradient>

      <filter id="shadow3" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#031d33" flood-opacity="0.45" />
      </filter>

      <filter id="bookShadow3" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#021424" flood-opacity="0.35" />
      </filter>
    </defs>

    <!-- App Icon Base Squircle -->
    <rect x="24" y="24" width="464" height="464" rx="108" fill="url(#bgGrad3)" filter="url(#shadow3)" />
    
    <!-- Subtle top reflection rim -->
    <rect x="25" y="25" width="462" height="462" rx="107" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2" />

    <!-- Open Book Vector Artwork -->
    <g transform="translate(0, 4)" filter="url(#bookShadow3)">
      
      <!-- Back page under-layers / Book Thickness -->
      <path d="M 112 344 C 172 376, 226 348, 256 328 C 286 348, 340 376, 400 344 L 388 184 C 336 156, 286 182, 256 198 C 226 182, 176 156, 124 184 Z" 
            fill="#031d33" opacity="0.4" />

      <!-- Left Leaf (Cyan-Blue Gradient) -->
      <path d="M 96 326 C 160 364, 222 334, 256 312 L 256 142 C 218 120, 154 122, 96 158 Z" 
            fill="url(#leftPage3)" />

      <!-- Right Leaf (Crisp Bright White) -->
      <path d="M 416 326 C 352 364, 290 334, 256 312 L 256 142 C 294 120, 358 122, 416 158 Z" 
            fill="url(#rightPage3)" />

      <!-- Center spine divider groove -->
      <path d="M 254 142 L 256 312 L 258 142 Z" fill="#0369a1" opacity="0.4" />

      <!-- LEFT PAGE: Bold Modern 'E' (Clean Geometry) -->
      <!-- Vertical Spine of E -->
      <rect x="136" y="180" width="16" height="106" rx="8" fill="#ffffff" />
      <!-- Top Bar of E -->
      <rect x="136" y="180" width="88" height="16" rx="8" fill="#ffffff" />
      <!-- Middle Bar of E -->
      <rect x="136" y="225" width="68" height="16" rx="8" fill="#ffffff" />
      <!-- Bottom Bar of E -->
      <rect x="136" y="270" width="88" height="16" rx="8" fill="#ffffff" />

      <!-- RIGHT PAGE: Minimalist EPUB Reader Lines -->
      <rect x="288" y="180" width="88" height="16" rx="8" fill="#0284c7" opacity="0.85" />
      <rect x="288" y="225" width="68" height="16" rx="8" fill="#0284c7" opacity="0.85" />
      <rect x="288" y="270" width="88" height="16" rx="8" fill="#0284c7" opacity="0.85" />

      <!-- Bookmark Ribbon in Center Header -->
      <path d="M 245 106 L 267 106 L 267 150 L 256 140 L 245 150 Z" fill="url(#gold3)" />

      <!-- Ambient Knowledge Stars / Sparkles -->
      <polygon points="380,108 384,120 396,124 384,128 380,140 376,128 364,124 376,120" fill="#ffffff" opacity="0.9" />
      <circle cx="406" cy="142" r="3.5" fill="#38bdf8" opacity="0.8" />
    </g>
  </svg>`

  // Red Edition: Sleek Crimson/Coral modern e-book app icon
  const redV3Svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <defs>
      <!-- Background squircle -->
      <linearGradient id="bgGradRed3" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#e11d48" />
        <stop offset="60%" stop-color="#be123c" />
        <stop offset="100%" stop-color="#4c0519" />
      </linearGradient>

      <!-- Left Page Surface Gradient -->
      <linearGradient id="leftPageRed3" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fb7185" />
        <stop offset="100%" stop-color="#e11d48" />
      </linearGradient>

      <!-- Right Page Surface Gradient -->
      <linearGradient id="rightPageRed3" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#fff1f2" />
      </linearGradient>

      <!-- Gold Accent -->
      <linearGradient id="goldRed3" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fbbf24" />
        <stop offset="100%" stop-color="#f59e0b" />
      </linearGradient>

      <filter id="shadowRed3" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#3b0312" flood-opacity="0.45" />
      </filter>

      <filter id="bookShadowRed3" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#26020c" flood-opacity="0.35" />
      </filter>
    </defs>

    <!-- App Icon Base Squircle -->
    <rect x="24" y="24" width="464" height="464" rx="108" fill="url(#bgGradRed3)" filter="url(#shadowRed3)" />
    
    <!-- Subtle top reflection rim -->
    <rect x="25" y="25" width="462" height="462" rx="107" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="2" />

    <!-- Open Book Vector Artwork -->
    <g transform="translate(0, 4)" filter="url(#bookShadowRed3)">
      
      <!-- Back page under-layers / Book Thickness -->
      <path d="M 112 344 C 172 376, 226 348, 256 328 C 286 348, 340 376, 400 344 L 388 184 C 336 156, 286 182, 256 198 C 226 182, 176 156, 124 184 Z" 
            fill="#3b0312" opacity="0.4" />

      <!-- Left Leaf (Coral-Rose Gradient) -->
      <path d="M 96 326 C 160 364, 222 334, 256 312 L 256 142 C 218 120, 154 122, 96 158 Z" 
            fill="url(#leftPageRed3)" />

      <!-- Right Leaf (Crisp Bright White) -->
      <path d="M 416 326 C 352 364, 290 334, 256 312 L 256 142 C 294 120, 358 122, 416 158 Z" 
            fill="url(#rightPageRed3)" />

      <!-- Center spine divider groove -->
      <path d="M 254 142 L 256 312 L 258 142 Z" fill="#be123c" opacity="0.4" />

      <!-- LEFT PAGE: Bold Modern 'E' (Clean Geometry) -->
      <!-- Vertical Spine of E -->
      <rect x="136" y="180" width="16" height="106" rx="8" fill="#ffffff" />
      <!-- Top Bar of E -->
      <rect x="136" y="180" width="88" height="16" rx="8" fill="#ffffff" />
      <!-- Middle Bar of E -->
      <rect x="136" y="225" width="68" height="16" rx="8" fill="#ffffff" />
      <!-- Bottom Bar of E -->
      <rect x="136" y="270" width="88" height="16" rx="8" fill="#ffffff" />

      <!-- RIGHT PAGE: Minimalist EPUB Reader Lines -->
      <rect x="288" y="180" width="88" height="16" rx="8" fill="#e11d48" opacity="0.85" />
      <rect x="288" y="225" width="68" height="16" rx="8" fill="#e11d48" opacity="0.85" />
      <rect x="288" y="270" width="88" height="16" rx="8" fill="#e11d48" opacity="0.85" />

      <!-- Bookmark Ribbon in Center Header -->
      <path d="M 245 106 L 267 106 L 267 150 L 256 140 L 245 150 Z" fill="url(#goldRed3)" />

      <!-- Ambient Knowledge Stars / Sparkles -->
      <polygon points="380,108 384,120 396,124 384,128 380,140 376,128 364,124 376,120" fill="#ffffff" opacity="0.9" />
      <circle cx="406" cy="142" r="3.5" fill="#fb7185" opacity="0.8" />
    </g>
  </svg>`

  return { blueV3Svg, redV3Svg }
}

async function run() {
  const artifactDir = 'C:\\Users\\Dani\\.gemini\\antigravity\\brain\\ec378f95-8f5c-4c9b-851d-dc4d214e2640'
  const { blueV3Svg, redV3Svg } = generateV3Logos()

  await sharp(Buffer.from(blueV3Svg)).png().toFile(path.join(artifactDir, 'easyepub_blue_v3.png'))
  await sharp(Buffer.from(redV3Svg)).png().toFile(path.join(artifactDir, 'easyepub_red_v3.png'))

  console.log('V3 logos rendered!')
}

run().catch(console.error)
