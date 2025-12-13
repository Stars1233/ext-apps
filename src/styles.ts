import { McpUiStyles, McpUiTheme } from "./types";

/**
 * Get the current document theme from the root HTML element.
 *
 * Reads the theme from the `data-theme` attribute on `document.documentElement`.
 * Falls back to checking for a `dark` class for compatibility with Tailwind CSS
 * dark mode conventions.
 *
 * @returns The current theme ("light" or "dark")
 *
 * @example Check current theme
 * ```typescript
 * import { getDocumentTheme } from '@modelcontextprotocol/ext-apps';
 *
 * const theme = getDocumentTheme();
 * console.log(`Current theme: ${theme}`);
 * ```
 *
 * @see {@link applyDocumentTheme} to set the theme
 * @see {@link McpUiTheme} for the theme type
 */
export function getDocumentTheme(): McpUiTheme {
  const theme = document.documentElement.getAttribute("data-theme");

  if (theme === "dark" || theme === "light") {
    return theme;
  }

  // Fallback: check for "dark" class (Tailwind CSS convention)
  const darkMode = document.documentElement.classList.contains("dark");

  return darkMode ? "dark" : "light";
}

/**
 * Apply a theme to the document root element.
 *
 * Sets the `data-theme` attribute and CSS `color-scheme` property on
 * `document.documentElement`. This enables CSS selectors like
 * `[data-theme="dark"]` and ensures native elements (scrollbars, form controls)
 * respect the theme.
 *
 * @param theme - The theme to apply ("light" or "dark")
 *
 * @example Apply theme from host context
 * ```typescript
 * import { applyDocumentTheme } from '@modelcontextprotocol/ext-apps';
 *
 * app.onhostcontextchanged = (params) => {
 *   if (params.theme) {
 *     applyDocumentTheme(params.theme);
 *   }
 * };
 * ```
 *
 * @example Use with CSS selectors
 * ```css
 * [data-theme="dark"] {
 *   --bg-color: #1a1a1a;
 * }
 * [data-theme="light"] {
 *   --bg-color: #ffffff;
 * }
 * ```
 *
 * @see {@link getDocumentTheme} to read the current theme
 * @see {@link McpUiTheme} for the theme type
 */
export function applyDocumentTheme(theme: McpUiTheme): void {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.style.colorScheme = theme;
}

/**
 * Apply host styles as CSS custom properties on an element.
 *
 * This function takes the `styles` object from `McpUiHostContext` and sets
 * each CSS variable on the specified root element (defaults to `document.documentElement`).
 * This allows apps to use the host's theming values via CSS variables like
 * `var(--color-background-primary)`.
 *
 * @param styles - The styles object from `McpUiHostContext.styles`
 * @param root - The element to apply styles to (defaults to `document.documentElement`)
 *
 * @example Apply styles from host context
 * ```typescript
 * import { applyHostStyles } from '@modelcontextprotocol/ext-apps';
 *
 * app.onhostcontextchanged = (params) => {
 *   if (params.styles) {
 *     applyHostStyles(params.styles);
 *   }
 * };
 * ```
 *
 * @example Apply to a specific element
 * ```typescript
 * const container = document.getElementById('app-root');
 * applyHostStyles(hostContext.styles, container);
 * ```
 *
 * @see {@link McpUiStyles} for the available CSS variables
 * @see {@link McpUiHostContext} for the full host context structure
 */
export function applyHostStyles(
  styles: McpUiStyles,
  root: HTMLElement = document.documentElement,
): void {
  for (const [key, value] of Object.entries(styles)) {
    if (value !== undefined) {
      root.style.setProperty(key, value);
    }
  }
}
