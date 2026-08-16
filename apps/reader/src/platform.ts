import { IS_SERVER } from '@literal-ui/hooks'

// https://www.geeksforgeeks.org/how-to-detect-touch-screen-device-using-javascript
export const isTouchScreen = IS_SERVER ? false : 'ontouchstart' in window
export const scale = (value: number, valueInTouchScreen: number) =>
  isTouchScreen ? valueInTouchScreen : value

// True when running inside the Capacitor Android app (native WebView).
export const isNativePlatform = (): boolean => {
  if (IS_SERVER) return false
  const cap = (window as any).Capacitor
  return !!(cap && cap.isNativePlatform)
}
