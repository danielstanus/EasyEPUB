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
    // `-webkit-text-fill-color` is included because many books set it on
    // headings (e.g. `.calibre3 { -webkit-text-fill-color: #000 }`) and, when
    // present, it wins over `color` in Chromium/WebKit.
    const darkCss = `*:not(a):not(a *) {
  color: ${resolvedTextColor} !important;
  -webkit-text-fill-color: ${resolvedTextColor} !important;
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
 * Detect anchors that are rendered as headings/titles rather than inline body
 * links (e.g. TOC entries such as `<a class="calibre3">...<br>...</a>`). These
 * must follow the theme text color in dark mode instead of the link blue.
 */
function isHeadingLink(el: HTMLElement): boolean {
  // Multi-line title links often contain a <br>.
  if (el.querySelector('br')) return true

  // A standalone link that is the only meaningful content of its parent
  // (typical TOC list item) reads as a heading, not an inline link.
  const parent = el.parentElement
  if (!parent) return false
  const siblingText = Array.from(parent.childNodes)
    .filter((node) => node !== el)
    .map((node) => node.textContent ?? '')
    .join('')
  return siblingText.trim().length === 0
}

/** Parse an `rgb(r, g, b)` / `#rrggbb` color into a comparable tuple. */
function parseRgb(color: string): [number, number, number] | null {
  if (color.startsWith('#')) {
    const hex = color.slice(1)
    const full =
      hex.length === 3
        ? hex
            .split('')
            .map((c) => c + c)
            .join('')
        : hex
    const n = parseInt(full, 16)
    if (Number.isNaN(n) || full.length !== 6) return null
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  }
  const m = color.match(/\d+(\.\d+)?/g)
  if (!m || m.length < 3) return null
  return [Number(m[0]), Number(m[1]), Number(m[2])]
}

/** Whether an element carries its own visible text (not just child elements). */
function hasDirectText(el: HTMLElement): boolean {
  return Array.from(el.childNodes).some(
    (n) =>
      n.nodeType === Node.TEXT_NODE && (n.textContent ?? '').trim().length > 0,
  )
}

/**
 * Set the text color on an element, overriding both `color` and
 * `-webkit-text-fill-color`. The latter is what Chromium/WebKit actually paint
 * with when a book defines it (e.g. `.calibre3 { -webkit-text-fill-color: #000 }`),
 * so setting `color` alone leaves such titles black in dark mode.
 */
function setTextColor(el: HTMLElement, color: string) {
  el.style.setProperty('color', color, 'important')
  el.style.setProperty('-webkit-text-fill-color', color, 'important')
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

  // Anchors that act as headings/titles (e.g. TOC entries) must follow the
  // theme text color, together with everything inside them. Regular inline
  // links keep their blue color, and so do their descendants (they are part
  // of the link).
  const headingLinks = new Set<HTMLElement>()
  doc.querySelectorAll<HTMLElement>('a').forEach((a) => {
    if (isHeadingLink(a)) headingLinks.add(a)
  })

  const themeRgb = parseRgb(textColor)

  const elements = doc.querySelectorAll<HTMLElement>('*')
  elements.forEach((el) => {
    const tag = el.tagName

    // Skip regular inline links and their contents so they keep their blue.
    const nearestLink = el.closest('a')
    if (nearestLink && !headingLinks.has(nearestLink)) return

    const isHeading =
      headingLinks.has(el) ||
      /^H[1-6]$/.test(tag) ||
      tag === 'HEADER' ||
      tag === 'TITLE'

    // Force the theme color on headings, elements with their own inline
    // color, descendants of heading links, and any visible text whose
    // computed color still differs from the theme (e.g. book rules with
    // `!important` that beat the universal stylesheet).
    const computed = getComputedStyle(el)
    const computedDiffers =
      hasDirectText(el) &&
      themeRgb !== null &&
      (parseRgb(computed.color)?.join(',') !== themeRgb.join(',') ||
        parseRgb(computed.webkitTextFillColor)?.join(',') !== themeRgb.join(','))
    if (isHeading || el.style.color || computedDiffers) {
      setTextColor(el, textColor)
    }

    // SVG text nodes
    if (tag === 'TEXT' || tag === 'TSPAN') {
      el.setAttribute('fill', textColor)
      el.style.setProperty('fill', textColor, 'important')
    }

    // FONT elements with color attribute
    if (tag === 'FONT' && el.getAttribute('color')) {
      setTextColor(el, textColor)
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
