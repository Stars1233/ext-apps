import { useEffect, useRef } from "react";
import { App } from "../app";
import { applyDocumentTheme, applyHostStyles } from "../styles";
import { McpUiHostContext } from "../types";

/**
 * React hook that applies host styles and theme as CSS custom properties.
 *
 * This hook listens to host context changes and automatically applies:
 * - `styles.variables` CSS variables to `document.documentElement` (e.g., `--color-background-primary`)
 * - `theme` via `color-scheme` CSS property, enabling `light-dark()` CSS function support
 *
 * The hook also applies styles and theme from the initial host context when
 * the app first connects.
 *
 * **Note:** If the host provides style values using CSS `light-dark()` function,
 * this hook ensures they work correctly by setting the `color-scheme` property
 * based on the host's theme preference.
 *
 * @param app - The connected App instance, or null during initialization
 * @param initialContext - Initial host context from the connection (optional).
 *   If provided, styles and theme will be applied immediately on mount.
 *
 * @example Basic usage with useApp
 * ```tsx
 * import { useApp } from '@modelcontextprotocol/ext-apps/react';
 * import { useHostStyles } from '@modelcontextprotocol/ext-apps/react';
 *
 * function MyApp() {
 *   const { app, isConnected } = useApp({
 *     appInfo: { name: "MyApp", version: "1.0.0" },
 *     capabilities: {},
 *   });
 *
 *   // Automatically apply host styles and theme
 *   useHostStyles(app);
 *
 *   return (
 *     <div style={{ background: 'var(--color-background-primary)' }}>
 *       Hello!
 *     </div>
 *   );
 * }
 * ```
 *
 * @example With initial context
 * ```tsx
 * const [hostContext, setHostContext] = useState<McpUiHostContext | null>(null);
 *
 * // ... get initial context from app.connect() result
 *
 * useHostStyles(app, hostContext);
 * ```
 *
 * @see {@link applyHostStyles} for the underlying styles function
 * @see {@link applyDocumentTheme} for the underlying theme function
 * @see {@link McpUiStyles} for available CSS variables
 */
export function useHostStyles(
  app: App | null,
  initialContext?: McpUiHostContext | null,
): void {
  const initialApplied = useRef(false);

  // Apply initial styles and theme once on mount
  useEffect(() => {
    if (initialApplied.current) {
      return;
    }
    if (initialContext?.theme) {
      applyDocumentTheme(initialContext.theme);
    }
    if (initialContext?.styles?.variables) {
      applyHostStyles(initialContext.styles.variables);
    }
    if (initialContext?.theme || initialContext?.styles?.variables) {
      initialApplied.current = true;
    }
  }, [initialContext]);

  // Listen for host context changes and apply updated styles/theme
  useEffect(() => {
    if (!app) {
      return;
    }

    app.onhostcontextchanged = (params) => {
      if (params.theme) {
        applyDocumentTheme(params.theme);
      }
      if (params.styles?.variables) {
        applyHostStyles(params.styles.variables);
      }
    };
  }, [app]);
}
