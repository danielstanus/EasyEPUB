import { CSSProperties } from 'react'

import { Contents } from '@flow/epubjs'

import { Settings } from './state'
import { keys } from './utils'

export const activeClass = 'bg-primary70'

/**
 * Inject the self-hosted fonts (Roboto / Roboto Serif) into the book iframe.
 * The iframe is srcdoc-based and inherits the parent origin, so an absolute
 * URL is used to bypass the `<base>` element that epubjs sets to the book's
 * blob URL.
 */
export function injectFonts(contents: Contents | undefined) {
  if (!contents || typeof window === 'undefined') return
  contents.addStylesheet(`${window.location.origin}/fonts/fonts.css`)
}
export const defaultStyle = {
  html: {
    padding: '0 !important',
    width: '100% !important',
    'max-width': '100% !important',
    margin: '0 !important',
  },
  body: {
    background: 'transparent',
    // width, max-width, and margin removed to allow dynamic centering and prevent cutoff
  },
  iframe: {
    width: '100% !important',
    height: '100% !important',
  },
  'a:any-link': {
    color: '#3b82f6 !important',
    'text-decoration': 'none !important',
  },
  '::selection': {
    'background-color': 'rgba(3, 102, 214, 0.2)',
  },
}

const camelToSnake = (str: string) =>
  str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)

function mapToCss(o: CSSProperties) {
  return keys(o)
    .filter((k) => o[k] !== undefined)
    .map((k) => `${camelToSnake(k)}: ${o[k]} !important;`)
    .join('\n')
}

enum Style {
  Custom = 'custom',
  DarkOverride = 'dark-override',
}

export function updateCustomStyle(
  contents: Contents | undefined,
  settings: Settings | undefined,
  textColor?: string,
) {
  if (!contents || !settings) return

  const {
    fontSize,
    fontWeight,
    fontFamily,
    lineHeight,
    zoom,
  } = settings

  const typographyCss: CSSProperties = {}
  if (fontSize) typographyCss.fontSize = fontSize
  if (fontWeight) typographyCss.fontWeight = fontWeight
  if (fontFamily) typographyCss.fontFamily = fontFamily
  if (lineHeight) typographyCss.lineHeight = lineHeight

  const resolvedTextColor = textColor ?? settings.theme?.textColor

  const css = `a, article, cite, div, li, p, pre, span, table, body,
h1, h2, h3, h4, h5, h6,
header, footer, section, nav, aside,
blockquote, figure, figcaption,
th, td, dt, dd, strong, b, em, i, u, s {
  ${mapToCss(typographyCss)}
}`

  contents.addStylesheetCss(css, Style.Custom)

  if (zoom) {
    const body = contents.content as HTMLBodyElement
    const scale = (p: keyof CSSStyleDeclaration) => ({
      [p]: `${parseInt(body.style[p] as string) / zoom}px`,
    })
    const zoomCss = `body {
      ${mapToCss({
        transformOrigin: 'top left',
        transform: `scale(${zoom})`,
        ...scale('width'),
        ...scale('height'),
        ...scale('columnWidth'),
        ...scale('columnGap'),
        ...scale('paddingTop'),
        ...scale('paddingBottom'),
        ...scale('paddingLeft'),
        ...scale('paddingRight'),
      })}
    }`
    contents.addStylesheetCss(zoomCss, 'zoom-custom')
  }

  // Inject a universal color override for dark themes.
  // Using `*` selector as the last stylesheet ensures it beats any book-level
  // `!important` rules or inline styles that would leave headings black.
  if (resolvedTextColor) {
    // Universal catch-all: every element gets the theme text color.
    // Exclude anchors (handled separately with blue link colour).
    const darkCss = `*:not(a):not(a *) {
  color: ${resolvedTextColor} !important;
}
svg text, svg text *, svg tspan {
  fill: ${resolvedTextColor} !important;
}`
    return contents.addStylesheetCss(darkCss, Style.DarkOverride)
  } else {
    // Clear dark override when not in dark/coloured mode
    return contents.addStylesheetCss('', Style.DarkOverride)
  }
}

/**
 * Force colors directly via inline styles on every element in the document.
 * Called as a JS-level fallback after stylesheet injection, because some EPUBs
 * have inline `style` attributes on heading elements that beat our CSS rules.
 */
export function forceColors(
  doc: Document,
  textColor: string,
  backgroundTheme: string,
) {
  if (!doc) return
  const elements = doc.querySelectorAll<HTMLElement>('*')
  elements.forEach((el) => {
    const tag = el.tagName
    // Skip anchors so links keep their blue color
    if (tag === 'A') return

    // Always force color on headings and elements that commonly have inline color
    const isHeading = /^H[1-6]$/.test(tag) || tag === 'HEADER' || tag === 'TITLE'
    if (isHeading || el.style.color) {
      el.style.setProperty('color', textColor, 'important')
    }

    // SVG text nodes
    if (tag === 'TEXT' || tag === 'TSPAN') {
      el.setAttribute('fill', textColor)
      el.style.setProperty('fill', textColor, 'important')
    }

    // FONT elements with color attribute
    if (tag === 'FONT' && el.getAttribute('color')) {
      el.style.setProperty('color', textColor, 'important')
    }

    // Dim white/near-white backgrounds
    const bg = el.style.backgroundColor
    if (bg) {
      const rgb = bg.match(/\d+/g)
      if (rgb && rgb.length >= 3) {
        const [r, g, b] = rgb.map(Number)
        if (r > 200 && g > 200 && b > 200) {
          el.style.setProperty('background-color', backgroundTheme, 'important')
        }
      }
    }
  })
}

export function lock(l: number, r: number, unit = 'px') {
  const minw = 400
  const maxw = 2560

  return `calc(${l}${unit} + ${r - l} * (100vw - ${minw}px) / ${maxw - minw})`
}
