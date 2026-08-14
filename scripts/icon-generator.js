const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

// SVG design for EasyEPUB (Blue Modern E-Book edition)
const createEasyEpubSvg = (theme = 'blue') => {
  const colors = theme === 'red' ? {
    bgGrad1: '#dc2626',
    bgGrad2: '#991b1b',
    primary: '#ef4444',
    secondary: '#f87171',
    highlight: '#fca5a5',
    accentGrad1: '#fb7185',
    accentGrad2: '#e11d48',
    glow: 'rgba(239, 68, 68, 0.4)',
    spine: '#881337',
    page1: '#ffffff',
    page2: '#ffe4e6',
    bookmark: '#f43f5e'
  } : {
    bgGrad1: '#2563eb',
    bgGrad2: '#1d4ed8',
    primary: '#0ea5e9',
    secondary: '#38bdf8',
    highlight: '#7dd3fc',
    accentGrad1: '#38bdf8',
    accentGrad2: '#0284c7',
    glow: 'rgba(14, 165, 233, 0.4)',
    spine: '#1e3a8a',
    page1: '#ffffff',
    page2: '#e0f2fe',
    bookmark: '#0284c7'
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Background rounded squircle / shield gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors.bgGrad1}" />
      <stop offset="100%" stop-color="${colors.bgGrad2}" />
    </linearGradient>

    <!-- Page wing gradient left -->
    <linearGradient id="leftWing" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors.highlight}" />
      <stop offset="40%" stop-color="${colors.secondary}" />
      <stop offset="100%" stop-color="${colors.primary}" />
    </linearGradient>

    <!-- Page wing gradient right -->
    <linearGradient id="rightWing" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors.page1}" />
      <stop offset="50%" stop-color="${colors.page2}" />
      <stop offset="100%" stop-color="${colors.secondary}" />
    </linearGradient>

    <!-- E letter dynamic bars gradient -->
    <linearGradient id="eGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${colors.page1}" />
      <stop offset="100%" stop-color="${colors.highlight}" />
    </linearGradient>

    <!-- Glow & Shadow filters -->
    <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#050b14" flood-opacity="0.25" />
    </filter>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#050b14" flood-opacity="0.18" />
    </filter>
  </defs>

  <!-- Main App Icon Container with smooth squircle -->
  <rect x="24" y="24" width="464" height="464" rx="108" fill="url(#bgGrad)" filter="url(#dropShadow)" />

  <!-- Subtle inner border highlight -->
  <rect x="25" y="25" width="462" height="462" rx="107" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2" />

  <!-- Center Artwork: Open Book + E Glyph Fusion -->
  <g transform="translate(0, 0)">
    <!-- Back page layer left -->
    <path d="M 120 180 C 170 160, 230 185, 256 205 C 256 205, 200 175, 140 190 Z" fill="rgba(255,255,255,0.3)" />

    <!-- Left Book Wing (Back Cover & Thick Page Stack) -->
    <path d="M 108 340 C 160 365, 220 340, 256 315 L 256 160 C 215 135, 155 138, 108 175 Z" 
          fill="url(#leftWing)" 
          filter="url(#softShadow)" />

    <!-- Right Book Wing (Curved open reader pages) -->
    <path d="M 404 340 C 352 365, 292 340, 256 315 L 256 160 C 297 135, 357 138, 404 175 Z" 
          fill="url(#rightWing)" 
          filter="url(#softShadow)" />

    <!-- Spine Centerfold Glow -->
    <path d="M 254 155 Q 256 240 256 318 Q 256 240 258 155 Z" fill="${colors.spine}" opacity="0.6" />

    <!-- Left 'E' Curves & Reading Streamlines on Left Page -->
    <!-- Top Bar of E -->
    <path d="M 148 215 C 180 200, 220 212, 240 226" 
          fill="none" 
          stroke="${colors.page1}" 
          stroke-width="14" 
          stroke-linecap="round" />
    
    <!-- Middle Bar of E -->
    <path d="M 158 256 C 185 245, 215 252, 236 262" 
          fill="none" 
          stroke="${colors.page1}" 
          stroke-width="14" 
          stroke-linecap="round" />

    <!-- Bottom Bar of E -->
    <path d="M 148 298 C 180 290, 220 300, 240 310" 
          fill="none" 
          stroke="${colors.page1}" 
          stroke-width="14" 
          stroke-linecap="round" />

    <!-- Left vertical spine curve completing the 'E' flow -->
    <path d="M 142 208 C 132 250, 132 265, 142 305" 
          fill="none" 
          stroke="${colors.page1}" 
          stroke-width="14" 
          stroke-linecap="round" />

    <!-- Right Page Reader Lines (Sleek minimalist text rhythm) -->
    <line x1="274" y1="218" x2="364" y2="204" stroke="${colors.primary}" stroke-width="12" stroke-linecap="round" opacity="0.85" />
    <line x1="274" y1="254" x2="350" y2="242" stroke="${colors.primary}" stroke-width="12" stroke-linecap="round" opacity="0.85" />
    <line x1="274" y1="290" x2="364" y2="280" stroke="${colors.primary}" stroke-width="12" stroke-linecap="round" opacity="0.85" />

    <!-- Modern Bookmark Ribbon / Flow Sparkle -->
    <path d="M 256 125 L 256 185 L 268 175 L 280 185 L 280 125 Z" 
          fill="${colors.bookmark}" 
          filter="url(#softShadow)" />

    <circle cx="375" cy="148" r="8" fill="${colors.highlight}" opacity="0.9" />
    <circle cx="395" cy="162" r="4.5" fill="${colors.page1}" opacity="0.7" />
  </g>
</svg>`
}

module.exports = { createEasyEpubSvg }
