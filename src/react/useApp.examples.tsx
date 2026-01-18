/**
 * Type-checked examples for the useApp hook.
 *
 * @module
 */

import { useApp, McpUiToolInputNotificationSchema } from "./index.js";

/**
 * Example: Register a notification handler in onAppCreated.
 */
function useApp_registerHandler() {
  //#region useApp_registerHandler
  useApp({
    appInfo: { name: "MyApp", version: "1.0.0" },
    capabilities: {},
    onAppCreated: (app) => {
      app.setNotificationHandler(
        McpUiToolInputNotificationSchema,
        (notification) => {
          console.log("Tool input:", notification.params.arguments);
        },
      );
    },
  });
  //#endregion useApp_registerHandler
}

/**
 * Example: Basic usage of useApp hook.
 */
function useApp_basicUsage() {
  //#region useApp_basicUsage
  function MyApp() {
    const { app, isConnected, error } = useApp({
      appInfo: { name: "MyApp", version: "1.0.0" },
      capabilities: {},
      onAppCreated: (app) => {
        // Register handlers before connection
        app.setNotificationHandler(
          McpUiToolInputNotificationSchema,
          (notification) => {
            console.log("Tool input:", notification.params.arguments);
          },
        );
      },
    });

    if (error) return <div>Error: {error.message}</div>;
    if (!isConnected) return <div>Connecting...</div>;
    return <div>Connected!</div>;
  }
  //#endregion useApp_basicUsage
}
