const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

function generateUltraLogos() {
  const artifactDir = 'C:\\Users\\Dani\\.gemini\\antigravity\\brain\\ec378f95-8f5c-4c9b-851d-dc4d214e2640'

  // Blue Ultra Minimalist Modern Concept (Clean 3D Open Book + E Monogram)
  const blueUltraSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <defs>
      <!-- Background squircle gradient -->
      <linearGradient id="bgBlue" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0284c7" />
        <stop offset="50%" stop-color="#0369a1" />
        <stop offset="100%" stop-color="#0c4a6e" />
      </linearGradient>

      <!-- Book left page gradient -->
      <linearGradient id="leftPage" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8" />
        <stop offset="100%" stop-color="#0284c7" />
      </linearGradient>

      <!-- Book right page gradient -->
      <linearGradient id="rightPage" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#e0f2fe" />
      </linearGradient>

      <!-- Overlay page curl / bookmark -->
      <linearGradient id="curlGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f59e0b" />
        <stop offset="100%" stop-color="#d97706" />
      </linearGradient>

      <filter id="shadowBox" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="18" stdDeviation="20" flood-color="#082f49" flood-opacity="0.5" />
      </filter>
      
      <filter id="innerBookShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#032541" flood-opacity="0.35" />
      </filter>
    </defs>

    <!-- App Icon Base Squircle -->
    <rect x="24" y="24" width="464" height="464" rx="108" fill="url(#bgBlue)" filter="url(#shadowBox)" />
    
    <!-- Top inner light reflection border -->
    <rect x="25" y="25" width="462" height="462" rx="107" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="2" />

    <!-- Open Book Vector Art -->
    <g transform="translate(0, 8)" filter="url(#innerBookShadow)">
      
      <!-- Back page under-layers -->
      <path d="M 120 332 C 180 365, 232 332, 256 314 C 280 332, 332 365, 392 332 L 382 178 C 332 148, 280 174, 256 190 C 232 174, 180 148, 130 178 Z" 
            fill="#082f49" opacity="0.4" />

      <!-- Left Page Wing (Forms 'E' profile) -->
      <path d="M 108 318 C 168 354, 224 322, 256 302 L 256 136 C 220 114, 160 118, 108 152 Z" 
            fill="url(#leftPage)" />

      <!-- Right Page Wing (Crisp clean reader page) -->
      <path d="M 404 318 C 344 354, 288 322, 256 302 L 256 136 C 292 114, 352 118, 404 152 Z" 
            fill="url(#rightPage)" />

      <!-- Spine divider fold -->
      <path d="M 254 136 L 256 302 L 258 136 Z" fill="#0369a1" opacity="0.35" />

      <!-- Left Page: Bold Iconic 'E' Form -->
      <!-- E Top Bar -->
      <path d="M 146 186 C 176 172, 208 182, 234 194" fill="none" stroke="#ffffff" stroke-width="15" stroke-linecap="round" />
      <!-- E Middle Bar -->
      <path d="M 156 228 C 182 216, 208 222, 226 232" fill="none" stroke="#ffffff" stroke-width="15" stroke-linecap="round" />
      <!-- E Bottom Bar -->
      <path d="M 146 270 C 176 258, 208 268, 234 280" fill="none" stroke="#ffffff" stroke-width="15" stroke-linecap="round" />
      <!-- E Spine Bar -->
      <path d="M 146 186 C 134 226, 134 238, 146 270" fill="none" stroke="#ffffff" stroke-width="15" stroke-linecap="round" />

      <!-- Right Page: Modern Text Lines (EasyEPUB reading content) -->
      <path d="M 278 194 C 304 182, 336 172, 366 186" fill="none" stroke="#0284c7" stroke-width="13" stroke-linecap="round" />
      <path d="M 278 232 C 300 222, 326 216, 350 228" fill="none" stroke="#0284c7" stroke-width="13" stroke-linecap="round" />
      <path d="M 278 270 C 304 258, 336 248, 366 262" fill="none" stroke="#0284c7" stroke-width="13" stroke-linecap="round" />

      <!-- Golden Bookmark Ribbon on Top Center -->
      <path d="M 246 100 L 266 100 L 266 142 L 256 132 L 246 142 Z" fill="url(#curlGrad)" />

      <!-- Digital Sparkle on Right Top -->
      <circle cx="372" cy="116" r="6" fill="#ffffff" opacity="0.9" />
      <circle cx="390" cy="128" r="3.5" fill="#38bdf8" opacity="0.8" />
    </g>
  </svg>`

  // Red Ultra Minimalist Modern Concept (Ruby & Coral)
  const redUltraSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <defs>
      <!-- Background squircle gradient -->
      <linearGradient id="bgRed" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#e11d48" />
        <stop offset="50%" stop-color="#be123c" />
        <stop offset="100%" stop-color="#4c0519" />
      </linearGradient>

      <!-- Book left page gradient -->
      <linearGradient id="leftPageRed" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fb7185" />
        <stop offset="100%" stop-color="#e11d48" />
      </linearGradient>

      <!-- Book right page gradient -->
      <linearGradient id="rightPageRed" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="#ffe4e6" />
      </linearGradient>

      <!-- Bookmark Ribbon -->
      <linearGradient id="curlGradRed" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fbbf24" />
        <stop offset="100%" stop-color="#f59e0b" />
      </linearGradient>

      <filter id="shadowBoxRed" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="18" stdDeviation="20" flood-color="#4c0519" flood-opacity="0.5" />
      </filter>
      
      <filter id="innerBookShadowRed" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#1e020a" flood-opacity="0.35" />
      </filter>
    </defs>

    <!-- App Icon Base Squircle -->
    <rect x="24" y="24" width="464" height="464" rx="108" fill="url(#bgRed)" filter="url(#shadowBoxRed)" />
    
    <!-- Top inner light reflection border -->
    <rect x="25" y="25" width="462" height="462" rx="107" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="2" />

    <!-- Open Book Vector Art -->
    <g transform="translate(0, 8)" filter="url(#innerBookShadowRed)">
      
      <!-- Back page under-layers -->
      <path d="M 120 332 C 180 365, 232 332, 256 314 C 280 332, 332 365, 392 332 L 382 178 C 332 148, 280 174, 256 190 C 232 174, 180 148, 130 178 Z" 
            fill="#4c0519" opacity="0.4" />

      <!-- Left Page Wing (Forms 'E' profile) -->
      <path d="M 108 318 C 168 354, 224 322, 256 302 L 256 136 C 220 114, 160 118, 108 152 Z" 
            fill="url(#leftPageRed)" />

      <!-- Right Page Wing (Crisp clean reader page) -->
      <path d="M 404 318 C 344 354, 288 322, 256 302 L 256 136 C 292 114, 352 118, 404 152 Z" 
            fill="url(#rightPageRed)" />

      <!-- Spine divider fold -->
      <path d="M 254 136 L 256 302 L 258 136 Z" fill="#be123c" opacity="0.35" />

      <!-- Left Page: Bold Iconic 'E' Form -->
      <!-- E Top Bar -->
      <path d="M 146 186 C 176 172, 208 182, 234 194" fill="none" stroke="#ffffff" stroke-width="15" stroke-linecap="round" />
      <!-- E Middle Bar -->
      <path d="M 156 228 C 182 216, 208 222, 226 232" fill="none" stroke="#ffffff" stroke-width="15" stroke-linecap="round" />
      <!-- E Bottom Bar -->
      <path d="M 146 270 C 176 258, 208 268, 234 280" fill="none" stroke="#ffffff" stroke-width="15" stroke-linecap="round" />
      <!-- E Spine Bar -->
      <path d="M 146 186 C 134 226, 134 238, 146 270" fill="none" stroke="#ffffff" stroke-width="15" stroke-linecap="round" />

      <!-- Right Page: Modern Text Lines (EasyEPUB reading content) -->
      <path d="M 278 194 C 304 182, 336 172, 366 186" fill="none" stroke="#e11d48" stroke-width="13" stroke-linecap="round" />
      <path d="M 278 232 C 300 222, 326 216, 350 228" fill="none" stroke="#e11d48" stroke-width="13" stroke-linecap="round" />
      <path d="M 278 270 C 304 258, 336 248, 366 262" fill="none" stroke="#e11d48" stroke-width="13" stroke-linecap="round" />

      <!-- Golden Bookmark Ribbon on Top Center -->
      <path d="M 246 100 L 266 100 L 266 142 L 256 132 L 246 142 Z" fill="url(#curlGradRed)" />

      <!-- Digital Sparkle on Right Top -->
      <circle cx="372" cy="116" r="6" fill="#ffffff" opacity="0.9" />
      <circle cx="390" cy="128" r="3.5" fill="#fda4af" opacity="0.8" />
    </g>
  </svg>`

  return { blueUltraSvg, redUltraSvg }
}

async function run() {
  const artifactDir = 'C:\\Users\\Dani\\.gemini\\antigravity\\brain\\ec378f95-8f5c-4c9b-851d-dc4d214e2640'
  const { blueUltraSvg, redUltraSvg } = generateUltraLogos()

  await sharp(Buffer.from(blueUltraSvg)).png().toFile(path.join(artifactDir, 'easyepub_blue_v2.png'))
  await sharp(Buffer.from(redUltraSvg)).png().toFile(path.join(artifactDir, 'easyepub_red_v2.png'))

  console.log('V2 logos rendered!')
}

run().catch(console.error)
