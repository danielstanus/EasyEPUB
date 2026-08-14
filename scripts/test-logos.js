const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

function getSvg({ theme = 'blue', variant = 'badge' } = {}) {
  // Color Palettes
  const palettes = {
    blue: {
      gradStart: '#2563eb',   // Royal Blue
      gradMid: '#0284c7',     // Vivid Ocean
      gradEnd: '#0369a1',     // Deep Sapphire
      accent: '#38bdf8',      // Sky Glow
      light: '#f0f9ff',       // Soft white-blue
      white: '#ffffff',
      darkSpine: '#1e3a8a',
      gold: '#f59e0b',
      ribbon: '#38bdf8'
    },
    red: {
      gradStart: '#e11d48',   // Rose Red
      gradMid: '#dc2626',     // Crimson
      gradEnd: '#991b1b',     // Deep Ruby
      accent: '#fb7185',      // Soft Coral
      light: '#fff1f2',       // Soft white-pink
      white: '#ffffff',
      darkSpine: '#881337',
      gold: '#fbbf24',
      ribbon: '#f43f5e'
    }
  }

  const c = palettes[theme] || palettes.blue

  if (variant === 'badge') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c.gradStart}" />
      <stop offset="50%" stop-color="${c.gradMid}" />
      <stop offset="100%" stop-color="${c.gradEnd}" />
    </linearGradient>

    <!-- Page Gradients -->
    <linearGradient id="leftPageGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c.white}" />
      <stop offset="60%" stop-color="${c.light}" />
      <stop offset="100%" stop-color="${c.accent}" />
    </linearGradient>

    <linearGradient id="rightPageGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c.white}" />
      <stop offset="100%" stop-color="${c.light}" />
    </linearGradient>

    <linearGradient id="turnPageGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c.accent}" />
      <stop offset="100%" stop-color="${c.white}" />
    </linearGradient>

    <filter id="iconShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#020617" flood-opacity="0.25" />
    </filter>

    <filter id="bookShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#0f172a" flood-opacity="0.3" />
    </filter>
  </defs>

  <!-- Squircle Base with slight rounded corner radius -->
  <rect x="32" y="32" width="448" height="448" rx="104" fill="url(#bgGrad)" filter="url(#iconShadow)" />
  
  <!-- Subtle Top Highlight Rim -->
  <path d="M 136 34 L 376 34 C 430 34, 476 80, 478 134 C 478 134, 440 42, 376 42 L 136 42 C 72 42, 34 134, 34 134 C 36 80, 82 34, 136 34 Z" 
        fill="white" opacity="0.15" />

  <!-- Center Graphic: Modern EasyEPUB stylized Open Book + 'E' monogram -->
  <g transform="translate(0, 0)" filter="url(#bookShadow)">
    
    <!-- Underneath Back Pages Effect (Spreading Knowledge) -->
    <path d="M 130 340 C 180 360, 230 335, 256 315 C 282 335, 332 360, 382 340 L 370 170 C 325 150, 280 172, 256 190 C 232 172, 187 150, 142 170 Z" 
          fill="${c.darkSpine}" opacity="0.4" />

    <!-- Left Wing (Forms the structural back & 'E' spine) -->
    <path d="M 112 330 C 175 365, 230 325, 256 305 L 256 145 C 226 125, 168 128, 112 165 Z" 
          fill="url(#leftPageGrad)" />

    <!-- Right Wing (Curved open reader page) -->
    <path d="M 400 330 C 337 365, 282 325, 256 305 L 256 145 C 286 125, 344 128, 400 165 Z" 
          fill="url(#rightPageGrad)" />

    <!-- Book Center Crease Line -->
    <line x1="256" y1="145" x2="256" y2="305" stroke="${c.darkSpine}" stroke-width="4" opacity="0.3" stroke-linecap="round" />

    <!-- Stylized 'E' Glyphs on Left Page -->
    <!-- Top arm of E -->
    <path d="M 148 198 C 178 184, 212 194, 234 206" 
          fill="none" 
          stroke="${c.gradStart}" 
          stroke-width="12" 
          stroke-linecap="round" />
    
    <!-- Middle arm of E (with dynamic speed dash) -->
    <path d="M 158 238 C 184 228, 210 234, 228 244" 
          fill="none" 
          stroke="${c.gradStart}" 
          stroke-width="12" 
          stroke-linecap="round" />

    <!-- Bottom arm of E -->
    <path d="M 148 278 C 178 268, 212 278, 234 288" 
          fill="none" 
          stroke="${c.gradStart}" 
          stroke-width="12" 
          stroke-linecap="round" />

    <!-- Left vertical bar of E -->
    <path d="M 146 195 C 136 235, 136 245, 146 280" 
          fill="none" 
          stroke="${c.gradStart}" 
          stroke-width="12" 
          stroke-linecap="round" />

    <!-- Right Page: Modern Clean Text Lines & Dynamic Page-Turn Arc -->
    <!-- Floating Page Turn Corner -->
    <path d="M 345 130 C 375 140, 395 160, 400 165 L 355 178 Z" 
          fill="url(#turnPageGrad)" />

    <line x1="278" y1="200" x2="368" y2="190" stroke="${c.gradMid}" stroke-width="10" stroke-linecap="round" opacity="0.8" />
    <line x1="278" y1="238" x2="352" y2="228" stroke="${c.gradMid}" stroke-width="10" stroke-linecap="round" opacity="0.8" />
    <line x1="278" y1="276" x2="368" y2="266" stroke="${c.gradMid}" stroke-width="10" stroke-linecap="round" opacity="0.8" />

    <!-- Digital EPUB Sparkle / Reading Star -->
    <path d="M 256 100 L 261 118 L 279 123 L 261 128 L 256 146 L 251 128 L 233 123 L 251 118 Z" 
          fill="${c.gold}" />

    <!-- Top floating digital elements -->
    <circle cx="380" cy="115" r="7" fill="${c.white}" opacity="0.9" />
    <circle cx="398" cy="128" r="4" fill="${c.accent}" opacity="0.8" />
  </g>
</svg>`
  }

  // Pure Emblem (Transparent Background)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="emblemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c.accent}" />
      <stop offset="40%" stop-color="${c.gradStart}" />
      <stop offset="100%" stop-color="${c.gradEnd}" />
    </linearGradient>

    <linearGradient id="emblemLeft" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c.gradStart}" />
      <stop offset="100%" stop-color="${c.gradEnd}" />
    </linearGradient>

    <linearGradient id="emblemRight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c.accent}" />
      <stop offset="100%" stop-color="${c.gradStart}" />
    </linearGradient>

    <filter id="emblemGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="${c.gradEnd}" flood-opacity="0.35" />
    </filter>
  </defs>

  <g transform="translate(0, 0)" filter="url(#emblemGlow)">
    <!-- Back Page Stack Left & Right -->
    <path d="M 80 370 C 160 415, 230 365, 256 340 C 282 365, 352 415, 432 370 L 416 170 C 352 140, 290 170, 256 195 C 222 170, 160 140, 96 170 Z" 
          fill="${c.darkSpine}" opacity="0.3" />

    <!-- Left Book Wing (with 'E' Cutout) -->
    <path d="M 64 360 C 150 405, 225 355, 256 330 L 256 110 C 218 85, 140 88, 64 135 Z" 
          fill="url(#emblemLeft)" />

    <!-- Right Book Wing -->
    <path d="M 448 360 C 362 405, 287 355, 256 330 L 256 110 C 294 85, 372 88, 448 135 Z" 
          fill="url(#emblemRight)" />

    <!-- Left 'E' cutout curves / dynamic white reading waves -->
    <path d="M 112 175 C 152 155, 202 170, 230 188" fill="none" stroke="${c.white}" stroke-width="16" stroke-linecap="round" />
    <path d="M 125 230 C 160 215, 198 225, 222 240" fill="none" stroke="${c.white}" stroke-width="16" stroke-linecap="round" />
    <path d="M 112 285 C 152 270, 202 285, 230 300" fill="none" stroke="${c.white}" stroke-width="16" stroke-linecap="round" />
    <path d="M 110 175 C 98 230, 98 240, 110 285" fill="none" stroke="${c.white}" stroke-width="16" stroke-linecap="round" />

    <!-- Right Page Reader Grooves -->
    <line x1="282" y1="180" x2="400" y2="165" stroke="${c.white}" stroke-width="14" stroke-linecap="round" opacity="0.9" />
    <line x1="282" y1="230" x2="380" y2="215" stroke="${c.white}" stroke-width="14" stroke-linecap="round" opacity="0.9" />
    <line x1="282" y1="280" x2="400" y2="265" stroke="${c.white}" stroke-width="14" stroke-linecap="round" opacity="0.9" />

    <!-- Top floating spark / bookmark icon -->
    <path d="M 256 50 L 263 76 L 288 84 L 263 92 L 256 118 L 249 92 L 224 84 L 249 76 Z" 
          fill="${c.gold}" />
  </g>
</svg>`
}

async function run() {
  const artifactDir = 'C:\\Users\\Dani\\.gemini\\antigravity\\brain\\ec378f95-8f5c-4c9b-851d-dc4d214e2640'
  
  // Generate sample options for user review
  const blueBadgeSvg = getSvg({ theme: 'blue', variant: 'badge' })
  const redBadgeSvg = getSvg({ theme: 'red', variant: 'badge' })
  const blueEmblemSvg = getSvg({ theme: 'blue', variant: 'emblem' })
  const redEmblemSvg = getSvg({ theme: 'red', variant: 'emblem' })

  await sharp(Buffer.from(blueBadgeSvg)).png().toFile(path.join(artifactDir, 'option_blue_badge.png'))
  await sharp(Buffer.from(redBadgeSvg)).png().toFile(path.join(artifactDir, 'option_red_badge.png'))
  await sharp(Buffer.from(blueEmblemSvg)).png().toFile(path.join(artifactDir, 'option_blue_emblem.png'))
  await sharp(Buffer.from(redEmblemSvg)).png().toFile(path.join(artifactDir, 'option_red_emblem.png'))

  console.log('Sample preview icons created successfully!')
}

run().catch(console.error)
