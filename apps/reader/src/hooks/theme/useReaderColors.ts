import { useSettings } from '@flow/reader/state'

import { useBackground } from './useBackground'
import { useColorScheme } from './useColorScheme'

/**
 * Effective colors for the reading area.
 *
 * Takes precedence from the explicit theme settings (preset / background
 * color / text color) and falls back to the old behavior driven by the UI
 * color scheme (`useBackground` + dark mode defaults).
 */
export function useReaderColors() {
  const [{ theme }] = useSettings()
  const { dark } = useColorScheme()
  const [, , defaultBackground] = useBackground()

  const customTextColor = theme?.textColor
  const backgroundColor = theme?.backgroundColor ?? defaultBackground
  const textColor = customTextColor ?? (dark ? '#bfc8ca' : '#3f484a')

  return { backgroundColor, textColor, customTextColor }
}
