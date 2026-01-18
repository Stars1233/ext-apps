/**
 * Type-checked examples for {@link App} and constants in {@link ./app.ts}.
 *
 * These examples are included in the API documentation via `@includeCode` tags.
 * Each function's region markers define the code snippet that appears in the docs.
 *
 * @module
 */

import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import {
  App,
  PostMessageTransport,
  McpUiToolInputNotificationSchema,
  RESOURCE_URI_META_KEY,
} from "./app.js";

/**
 * Example: How MCP servers use RESOURCE_URI_META_KEY (server-side, not in Apps).
 */
function RESOURCE_URI_META_KEY_serverSide(): CallToolResult {
  //#region RESOURCE_URI_META_KEY_serverSide
  // In an MCP server's tool handler:
  return {
    content: [{ type: "text", text: "Result" }],
    _meta: {
      [RESOURCE_URI_META_KEY]: "ui://weather/forecast",
    },
  };
  //#endregion RESOURCE_URI_META_KEY_serverSide
}

/**
 * Example: How hosts check for RESOURCE_URI_META_KEY metadata (host-side).
 */
async function RESOURCE_URI_META_KEY_hostSide(mcpClient: {
  callTool: (args: {
    name: string;
    arguments: object;
  }) => Promise<CallToolResult>;
}) {
  //#region RESOURCE_URI_META_KEY_hostSide
  const result = await mcpClient.callTool({ name: "weather", arguments: {} });
  const uiUri = result._meta?.[RESOURCE_URI_META_KEY];
  if (uiUri) {
    // Load and display the UI resource
  }
  //#endregion RESOURCE_URI_META_KEY_hostSide
}

/**
 * Example: App constructor with appInfo, capabilities, and options.
 */
function App_constructor_basic() {
  //#region App_constructor_basic
  const app = new App(
    { name: "MyApp", version: "1.0.0" },
    { tools: { listChanged: true } }, // capabilities
    { autoResize: true }, // options
  );
  //#endregion App_constructor_basic
  return app;
}

/**
 * Example: Basic usage of the App class with PostMessageTransport.
 */
async function App_basicUsage() {
  //#region App_basicUsage
  const app = new App(
    { name: "WeatherApp", version: "1.0.0" },
    {}, // capabilities
  );

  // Register notification handler using setter (simpler)
  app.ontoolinput = (params) => {
    console.log("Tool arguments:", params.arguments);
  };

  // OR using inherited setNotificationHandler (more explicit)
  app.setNotificationHandler(
    McpUiToolInputNotificationSchema,
    (notification) => {
      console.log("Tool arguments:", notification.params.arguments);
    },
  );

  await app.connect(new PostMessageTransport(window.parent, window.parent));
  //#endregion App_basicUsage
}

/**
 * Example: Sending a message to the host's chat.
 */
async function App_sendMessage(app: App) {
  //#region App_sendMessage
  await app.sendMessage({
    role: "user",
    content: [{ type: "text", text: "Weather updated!" }],
  });
  //#endregion App_sendMessage
}

/**
 * Example: Check host capabilities after connection.
 */
async function App_hostCapabilities_checkAfterConnection(
  app: App,
  transport: PostMessageTransport,
) {
  //#region App_hostCapabilities_checkAfterConnection
  await app.connect(transport);
  const caps = app.getHostCapabilities();
  if (caps === undefined) {
    console.error("Not connected");
    return;
  }
  if (caps.serverTools) {
    console.log("Host supports server tool calls");
  }
  //#endregion App_hostCapabilities_checkAfterConnection
}

/**
 * Example: Log host information after connection.
 */
async function App_hostInfo_logAfterConnection(
  app: App,
  transport: PostMessageTransport,
) {
  //#region App_hostInfo_logAfterConnection
  await app.connect(transport);
  const host = app.getHostVersion();
  if (host === undefined) {
    console.error("Not connected");
    return;
  }
  console.log(`Connected to ${host.name} v${host.version}`);
  //#endregion App_hostInfo_logAfterConnection
}

/**
 * Example: Access host context after connection.
 */
async function App_hostContext_accessAfterConnection(
  app: App,
  transport: PostMessageTransport,
) {
  //#region App_hostContext_accessAfterConnection
  await app.connect(transport);
  const context = app.getHostContext();
  if (context === undefined) {
    console.error("Not connected");
    return;
  }
  if (context.theme === "dark") {
    document.body.classList.add("dark-theme");
  }
  if (context.toolInfo) {
    console.log("Tool:", context.toolInfo.tool.name);
  }
  //#endregion App_hostContext_accessAfterConnection
}

/**
 * Example: Using the ontoolinput setter (simpler approach).
 */
async function App_ontoolinput_setter(
  app: App,
  transport: PostMessageTransport,
) {
  //#region App_ontoolinput_setter
  // Register before connecting to ensure no notifications are missed
  app.ontoolinput = (params) => {
    console.log("Tool:", params.arguments);
    // Update your UI with the tool arguments
  };
  await app.connect(transport);
  //#endregion App_ontoolinput_setter
}

/**
 * Example: Using setNotificationHandler for tool input (more explicit approach).
 */
function App_ontoolinput_setNotificationHandler(app: App) {
  //#region App_ontoolinput_setNotificationHandler
  app.setNotificationHandler(
    McpUiToolInputNotificationSchema,
    (notification) => {
      console.log("Tool:", notification.params.arguments);
    },
  );
  //#endregion App_ontoolinput_setNotificationHandler
}

/**
 * Example: Progressive rendering of tool arguments using ontoolinputpartial.
 */
function App_ontoolinputpartial_progressiveRendering(app: App) {
  //#region App_ontoolinputpartial_progressiveRendering
  app.ontoolinputpartial = (params) => {
    console.log("Partial args:", params.arguments);
    // Update your UI progressively as arguments stream in
  };
  //#endregion App_ontoolinputpartial_progressiveRendering
}

/**
 * Example: Display tool execution results using ontoolresult.
 */
function App_ontoolresult_displayResults(app: App) {
  //#region App_ontoolresult_displayResults
  app.ontoolresult = (params) => {
    if (params.content) {
      console.log("Tool output:", params.content);
    }
    if (params.isError) {
      console.error("Tool execution failed");
    }
  };
  //#endregion App_ontoolresult_displayResults
}

/**
 * Example: Handle tool cancellation notifications.
 */
function App_ontoolcancelled_handleCancellation(app: App) {
  //#region App_ontoolcancelled_handleCancellation
  app.ontoolcancelled = (params) => {
    console.log("Tool cancelled:", params.reason);
    showCancelledMessage(params.reason ?? "Operation was cancelled");
  };
  //#endregion App_ontoolcancelled_handleCancellation
}

// Stub for example
declare function showCancelledMessage(message: string): void;

/**
 * Example: Respond to theme changes using onhostcontextchanged.
 */
function App_onhostcontextchanged_respondToTheme(app: App) {
  //#region App_onhostcontextchanged_respondToTheme
  app.onhostcontextchanged = (params) => {
    if (params.theme === "dark") {
      document.body.classList.add("dark-theme");
    } else {
      document.body.classList.remove("dark-theme");
    }
  };
  //#endregion App_onhostcontextchanged_respondToTheme
}

/**
 * Example: Perform cleanup before teardown.
 */
function App_onteardown_performCleanup(app: App) {
  //#region App_onteardown_performCleanup
  app.onteardown = async () => {
    await saveState();
    closeConnections();
    console.log("App ready for teardown");
    return {};
  };
  //#endregion App_onteardown_performCleanup
}

// Stubs for example
declare function saveState(): Promise<void>;
declare function closeConnections(): void;

/**
 * Example: Handle tool calls from the host.
 */
function App_oncalltool_handleFromHost(app: App) {
  //#region App_oncalltool_handleFromHost
  app.oncalltool = async (params, extra) => {
    if (params.name === "greet") {
      const name = params.arguments?.name ?? "World";
      return { content: [{ type: "text", text: `Hello, ${name}!` }] };
    }
    throw new Error(`Unknown tool: ${params.name}`);
  };
  //#endregion App_oncalltool_handleFromHost
}

/**
 * Example: Return available tools from the onlisttools handler.
 */
function App_onlisttools_returnTools(app: App) {
  //#region App_onlisttools_returnTools
  app.onlisttools = async (params, extra) => {
    return {
      tools: ["calculate", "convert", "format"],
    };
  };
  //#endregion App_onlisttools_returnTools
}

/**
 * Example: Fetch updated weather data using callServerTool.
 */
async function App_callServerTool_fetchWeather(app: App) {
  //#region App_callServerTool_fetchWeather
  try {
    const result = await app.callServerTool({
      name: "get_weather",
      arguments: { location: "Tokyo" },
    });
    if (result.isError) {
      console.error("Tool returned error:", result.content);
    } else {
      console.log(result.content);
    }
  } catch (error) {
    console.error("Tool call failed:", error);
  }
  //#endregion App_callServerTool_fetchWeather
}

/**
 * Example: Send a text message from user interaction.
 */
async function App_sendMessage_textFromInteraction(app: App) {
  //#region App_sendMessage_textFromInteraction
  try {
    await app.sendMessage({
      role: "user",
      content: [{ type: "text", text: "Show me details for item #42" }],
    });
  } catch (error) {
    console.error("Failed to send message:", error);
    // Handle error appropriately for your app
  }
  //#endregion App_sendMessage_textFromInteraction
}

/**
 * Example: Log app state for debugging.
 */
function App_sendLog_debugState(app: App) {
  //#region App_sendLog_debugState
  app.sendLog({
    level: "info",
    data: "Weather data refreshed",
    logger: "WeatherApp",
  });
  //#endregion App_sendLog_debugState
}

/**
 * Example: Update model context with current app state.
 */
async function App_updateModelContext_appState(app: App) {
  //#region App_updateModelContext_appState
  await app.updateModelContext({
    content: [{ type: "text", text: "User selected 3 items totaling $150.00" }],
  });
  //#endregion App_updateModelContext_appState
}

/**
 * Example: Update with structured content.
 */
async function App_updateModelContext_structuredContent(app: App) {
  //#region App_updateModelContext_structuredContent
  await app.updateModelContext({
    structuredContent: { selectedItems: 3, total: 150.0, currency: "USD" },
  });
  //#endregion App_updateModelContext_structuredContent
}

/**
 * Example: Open documentation link.
 */
async function App_openLink_documentation(app: App) {
  //#region App_openLink_documentation
  try {
    await app.openLink({ url: "https://docs.example.com" });
  } catch (error) {
    console.error("Failed to open link:", error);
    // Optionally show fallback: display URL for manual copy
  }
  //#endregion App_openLink_documentation
}

/**
 * Example: Request fullscreen mode.
 */
async function App_requestDisplayMode_fullscreen(app: App) {
  //#region App_requestDisplayMode_fullscreen
  const context = app.getHostContext();
  if (context?.availableDisplayModes?.includes("fullscreen")) {
    const result = await app.requestDisplayMode({ mode: "fullscreen" });
    console.log("Display mode set to:", result.mode);
  }
  //#endregion App_requestDisplayMode_fullscreen
}

/**
 * Example: Manually notify host of size change.
 */
function App_sendSizeChanged_manual(app: App) {
  //#region App_sendSizeChanged_manual
  app.sendSizeChanged({
    width: 400,
    height: 600,
  });
  //#endregion App_sendSizeChanged_manual
}

/**
 * Example: Manual setup for custom scenarios (setupSizeChangedNotifications).
 */
async function App_setupAutoResize_manual(transport: PostMessageTransport) {
  //#region App_setupAutoResize_manual
  const app = new App(
    { name: "MyApp", version: "1.0.0" },
    {},
    { autoResize: false },
  );
  await app.connect(transport);

  // Later, enable auto-resize manually
  const cleanup = app.setupSizeChangedNotifications();

  // Clean up when done
  cleanup();
  //#endregion App_setupAutoResize_manual
}

/**
 * Example: Connect with PostMessageTransport.
 */
async function App_connect_withPostMessageTransport() {
  //#region App_connect_withPostMessageTransport
  const app = new App({ name: "MyApp", version: "1.0.0" }, {});

  try {
    await app.connect(new PostMessageTransport(window.parent, window.parent));
    console.log("Connected successfully!");
  } catch (error) {
    console.error("Failed to connect:", error);
  }
  //#endregion App_connect_withPostMessageTransport
}
