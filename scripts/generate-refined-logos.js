const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

function generateRefinedLogos() {
  const artifactDir = 'C:\\Users\\Dani\\.gemini\\antigravity\\brain\\ec378f95-8f5c-4c9b-851d-dc4d214e2640'

  // 1. Blue Sleek Isometric / Minimalist Open Book with 'E'
  const blueModernSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <defs>
      <linearGradient id="bgGradBlue" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#3b82f6" />
        <stop offset="50%" stop-color="#1d4ed8" />
        <stop offset="100%" stop-color="#0f172a" />
      </linearGradient>

      <linearGradient id="pageLeftBlue" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8" />
        <stop offset="100%" stop-color="#2563eb" />
      </linearGradient>

      <linearGradient id="pageRightBlue" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#60a5fa" />
        <stop offset="100%" stop-color="#1d4ed8" />
      </linearGradient>

      <linearGradient id="spineGlow" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.8" />
        <stop offset="100%" stop-color="#0284c7" stop-opacity="0.1" />
      </linearGradient>

      <linearGradient id="goldGlow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fbbf24" />
        <stop offset="100%" stop-color="#f59e0b" />
      </linearGradient>

      <filter id="appGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#1e3a8a" flood-opacity="0.4" />
      </filter>
      
      <filter id="layerShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#020617" flood-opacity="0.3" />
      </filter>
    </defs>

    <!-- App Icon Base -->
    <rect x="28" y="28" width="456" height="456" rx="104" fill="url(#bgGradBlue)" filter="url(#appGlow)" />
    
    <!-- Outer glass rim border -->
    <rect x="29" y="29" width="454" height="454" rx="103" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="2" />

    <!-- Open Book Vector Artwork -->
    <g transform="translate(0, 10)">
      <!-- Back page shadow/depth layers -->
      <path d="M 120 340 C 180 370, 230 335, 256 320 C 282 335, 332 370, 392 340 L 380 190 C 330 160, 280 185, 256 200 C 232 185, 182 160, 132 190 Z" 
            fill="#0f172a" opacity="0.4" />

      <!-- Left Leaf (Constructing the stylized 'E') -->
      <path d="M 104 324 C 160 360, 220 330, 256 308 L 256 142 C 220 120, 160 124, 104 158 Z" 
            fill="url(#pageLeftBlue)" 
            filter="url(#layerShadow)" />

      <!-- Right Leaf (Smooth open page) -->
      <path d="M 408 324 C 352 360, 292 330, 256 308 L 256 142 C 292 120, 352 124, 408 158 Z" 
            fill="url(#pageRightBlue)" 
            filter="url(#layerShadow)" />

      <!-- Spine Center Soft Glow Beam -->
      <path d="M 252 140 Q 256 220 256 308 Q 256 220 260 140 Z" fill="url(#spineGlow)" />

      <!-- Left Page: The 'E' Geometric Reading Ribbons -->
      <!-- Top stroke -->
      <path d="M 142 190 C 174 176, 206 186, 232 198" 
            fill="none" stroke="#ffffff" stroke-width="16" stroke-linecap="round" />

      <!-- Middle stroke with dynamic pulse -->
      <path d="M 152 232 C 178 220, 204 226, 224 236" 
            fill="none" stroke="#ffffff" stroke-width="16" stroke-linecap="round" />

      <!-- Bottom stroke -->
      <path d="M 142 274 C 174 262, 206 272, 232 284" 
            fill="none" stroke="#ffffff" stroke-width="16" stroke-linecap="round" />

      <!-- Vertical E backbone connection on page curve -->
      <path d="M 142 190 C 130 230, 130 240, 142 274" 
            fill="none" stroke="#ffffff" stroke-width="16" stroke-linecap="round" />

      <!-- Right Page: Streamlined Content Rhythm (EPUB text lines) -->
      <path d="M 280 198 C 306 186, 338 176, 370 190" fill="none" stroke="#ffffff" stroke-width="14" stroke-linecap="round" opacity="0.9" />
      <path d="M 280 236 C 302 226, 328 220, 354 232" fill="none" stroke="#ffffff" stroke-width="14" stroke-linecap="round" opacity="0.9" />
      <path d="M 280 274 C 306 262, 338 252, 370 266" fill="none" stroke="#ffffff" stroke-width="14" stroke-linecap="round" opacity="0.9" />

      <!-- Floating Digital Sparkle / Bookmark Star -->
      <g transform="translate(256, 102)">
        <polygon points="0,-22 6,-6 22,0 6,6 0,22 -6,6 -22,0 -6,-6" fill="url(#goldGlow)" />
      </g>
    </g>
  </svg>`

  // 2. Red Modern Edition (Crimson & Coral gradient)
  const redModernSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <defs>
      <linearGradient id="bgGradRed" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f43f5e" />
        <stop offset="50%" stop-color="#e11d48" />
        <stop offset="100%" stop-color="#4c0519" />
      </linearGradient>

      <linearGradient id="pageLeftRed" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fda4af" />
        <stop offset="100%" stop-color="#f43f5e" />
      </linearGradient>

      <linearGradient id="pageRightRed" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fb7185" />
        <stop offset="100%" stop-color="#be123c" />
      </linearGradient>

      <linearGradient id="spineGlowRed" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ffe4e6" stop-opacity="0.8" />
        <stop offset="100%" stop-color="#f43f5e" stop-opacity="0.1" />
      </linearGradient>

      <linearGradient id="goldGlowRed" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fef08a" />
        <stop offset="100%" stop-color="#f59e0b" />
      </linearGradient>

      <filter id="appGlowRed" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#881337" flood-opacity="0.4" />
      </filter>
      
      <filter id="layerShadowRed" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#020617" flood-opacity="0.3" />
      </filter>
    </defs>

    <!-- App Icon Base -->
    <rect x="28" y="28" width="456" height="456" rx="104" fill="url(#bgGradRed)" filter="url(#appGlowRed)" />
    
    <!-- Outer glass rim border -->
    <rect x="29" y="29" width="454" height="454" rx="103" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="2" />

    <!-- Open Book Vector Artwork -->
    <g transform="translate(0, 10)">
      <!-- Back page shadow/depth layers -->
      <path d="M 120 340 C 180 370, 230 335, 256 320 C 282 335, 332 370, 392 340 L 380 190 C 330 160, 280 185, 256 200 C 232 185, 182 160, 132 190 Z" 
            fill="#4c0519" opacity="0.45" />

      <!-- Left Leaf (Constructing the stylized 'E') -->
      <path d="M 104 324 C 160 360, 220 330, 256 308 L 256 142 C 220 120, 160 124, 104 158 Z" 
            fill="url(#pageLeftRed)" 
            filter="url(#layerShadowRed)" />

      <!-- Right Leaf (Smooth open page) -->
      <path d="M 408 324 C 352 360, 292 330, 256 308 L 256 142 C 292 120, 352 124, 408 158 Z" 
            fill="url(#pageRightRed)" 
            filter="url(#layerShadowRed)" />

      <!-- Spine Center Soft Glow Beam -->
      <path d="M 252 140 Q 256 220 256 308 Q 256 220 260 140 Z" fill="url(#spineGlowRed)" />

      <!-- Left Page: The 'E' Geometric Reading Ribbons -->
      <!-- Top stroke -->
      <path d="M 142 190 C 174 176, 206 186, 232 198" 
            fill="none" stroke="#ffffff" stroke-width="16" stroke-linecap="round" />

      <!-- Middle stroke with dynamic pulse -->
      <path d="M 152 232 C 178 220, 204 226, 224 236" 
            fill="none" stroke="#ffffff" stroke-width="16" stroke-linecap="round" />

      <!-- Bottom stroke -->
      <path d="M 142 274 C 174 262, 206 272, 232 284" 
            fill="none" stroke="#ffffff" stroke-width="16" stroke-linecap="round" />

      <!-- Vertical E backbone connection on page curve -->
      <path d="M 142 190 C 130 230, 130 240, 142 274" 
            fill="none" stroke="#ffffff" stroke-width="16" stroke-linecap="round" />

      <!-- Right Page: Streamlined Content Rhythm (EPUB text lines) -->
      <path d="M 280 198 C 306 186, 338 176, 370 190" fill="none" stroke="#ffffff" stroke-width="14" stroke-linecap="round" opacity="0.9" />
      <path d="M 280 236 C 302 226, 328 220, 354 232" fill="none" stroke="#ffffff" stroke-width="14" stroke-linecap="round" opacity="0.9" />
      <path d="M 280 274 C 306 262, 338 252, 370 266" fill="none" stroke="#ffffff" stroke-width="14" stroke-linecap="round" opacity="0.9" />

      <!-- Floating Digital Sparkle / Bookmark Star -->
      <g transform="translate(256, 102)">
        <polygon points="0,-22 6,-6 22,0 6,6 0,22 -6,6 -22,0 -6,-6" fill="url(#goldGlowRed)" />
      </g>
    </g>
  </svg>`

  // 3. Ultra Minimalist Modern Glyph (Vector Book Wings + E monogram)
  const blueGlyphSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
    <defs>
      <linearGradient id="glyphGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8" />
        <stop offset="50%" stop-color="#2563eb" />
        <stop offset="100%" stop-color="#1d4ed8" />
      </linearGradient>
      <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#60a5fa" />
        <stop offset="100%" stop-color="#0284c7" />
      </linearGradient>
      <filter id="glyphShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#1e3a8a" flood-opacity="0.3" />
      </filter>
    </defs>
    <g filter="url(#glyphShadow)">
      <!-- Left Page Wing with embedded 'E' flow -->
      <path d="M 96 350 C 160 385, 220 355, 256 335 L 256 125 C 215 100, 150 105, 96 145 Z" fill="url(#glyphGrad)" />
      <!-- Right Page Wing -->
      <path d="M 416 350 C 352 385, 292 355, 256 335 L 256 125 C 297 100, 362 105, 416 145 Z" fill="url(#accentGrad)" />
      <!-- E cutout curves on left page -->
      <path d="M 136 170 C 170 155, 205 168, 230 180" fill="none" stroke="#ffffff" stroke-width="15" stroke-linecap="round" />
      <path d="M 148 215 C 176 202, 206 210, 224 220" fill="none" stroke="#ffffff" stroke-width="15" stroke-linecap="round" />
      <path d="M 136 260 C 170 248, 205 258, 230 270" fill="none" stroke="#ffffff" stroke-width="15" stroke-linecap="round" />
      <path d="M 136 170 C 124 210, 124 225, 136 260" fill="none" stroke="#ffffff" stroke-width="15" stroke-linecap="round" />
      <!-- Reader lines on right page -->
      <line x1="282" y1="180" x2="376" y2="168" stroke="#ffffff" stroke-width="14" stroke-linecap="round" opacity="0.9" />
      <line x1="282" y1="220" x2="355" y2="210" stroke="#ffffff" stroke-width="14" stroke-linecap="round" opacity="0.9" />
      <line x1="282" y1="260" x2="376" y2="250" stroke="#ffffff" stroke-width="14" stroke-linecap="round" opacity="0.9" />
      <!-- Sparkle -->
      <polygon points="256,70 262,86 278,92 262,98 256,114 250,98 234,92 250,86" fill="#f59e0b" />
    </g>
  </svg>`

  return { blueModernSvg, redModernSvg, blueGlyphSvg }
}

async function run() {
  const artifactDir = 'C:\\Users\\Dani\\.gemini\\antigravity\\brain\\ec378f95-8f5c-4c9b-851d-dc4d214e2640'
  const { blueModernSvg, redModernSvg, blueGlyphSvg } = generateRefinedLogos()

  await sharp(Buffer.from(blueModernSvg)).png().toFile(path.join(artifactDir, 'easyepub_blue_app_icon.png'))
  await sharp(Buffer.from(redModernSvg)).png().toFile(path.join(artifactDir, 'easyepub_red_app_icon.png'))
  await sharp(Buffer.from(blueGlyphSvg)).png().toFile(path.join(artifactDir, 'easyepub_blue_glyph.png'))

  console.log('Refined logos rendered!')
}

run().catch(console.error)
