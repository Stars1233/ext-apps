/**
 * Type-checked examples for the useHostStyles hooks.
 *
 * @module
 */

import { useState } from "react";
import {
  useApp,
  useHostStyleVariables,
  useHostFonts,
  useHostStyles,
  App,
} from "./index.js";
import type { McpUiHostContext } from "../types.js";

/**
 * Example: Basic usage of useHostStyleVariables.
 */
function useHostStyleVariables_basicUsage() {
  //#region useHostStyleVariables_basicUsage
  function MyApp() {
    const { app, isConnected } = useApp({
      appInfo: { name: "MyApp", version: "1.0.0" },
      capabilities: {},
    });

    // Apply host styles - pass initial context to apply styles from connect() immediately
    useHostStyleVariables(app, app?.getHostContext());

    return (
      <div style={{ background: "var(--color-background-primary)" }}>
        Hello!
      </div>
    );
  }
  //#endregion useHostStyleVariables_basicUsage
}

/**
 * Example: Basic usage of useHostFonts with useApp.
 */
function useHostFonts_basicUsage() {
  //#region useHostFonts_basicUsage
  function MyApp() {
    const { app, isConnected } = useApp({
      appInfo: { name: "MyApp", version: "1.0.0" },
      capabilities: {},
    });

    // Automatically apply host fonts
    useHostFonts(app);

    return <div style={{ fontFamily: "var(--font-sans)" }}>Hello!</div>;
  }
  //#endregion useHostFonts_basicUsage
}

/**
 * Example: useHostFonts with initial context.
 */
function useHostFonts_withInitialContext(app: App) {
  //#region useHostFonts_withInitialContext
  const [hostContext, setHostContext] = useState<McpUiHostContext | null>(null);

  // ... get initial context from app.connect() result

  useHostFonts(app, hostContext);
  //#endregion useHostFonts_withInitialContext
}

/**
 * Example: Basic usage of useHostStyles.
 */
function useHostStyles_basicUsage() {
  const appInfo = { name: "MyApp", version: "1.0.0" };
  //#region useHostStyles_basicUsage
  function MyApp() {
    const { app } = useApp({ appInfo, capabilities: {} });
    useHostStyles(app, app?.getHostContext());

    return (
      <div style={{ background: "var(--color-background-primary)" }}>...</div>
    );
  }
  //#endregion useHostStyles_basicUsage
}
