/**
 * React utilities for building MCP Apps.
 *
 * This module provides React hooks and utilities for easily building
 * interactive MCP Apps using React. This is optional - the core SDK
 * ({@link App}, {@link PostMessageTransport}) is framework-agnostic and can be
 * used with any UI framework or vanilla JavaScript.
 *
 * ## Main Exports
 *
 * - {@link useApp} - React hook to create and connect an MCP App
 * - {@link useHostStyleVariables} - React hook to apply host style variables and theme
 * - {@link useHostFonts} - React hook to apply host fonts
 * - {@link useDocumentTheme} - React hook for reactive document theme
 * - {@link useAutoResize} - React hook for manual auto-resize control (rarely needed)
 *
 * @module @modelcontextprotocol/ext-apps/react
 *
 * @example Basic React App
 * {@includeCode ./index.examples.tsx#index_basicReactApp}
 */
export * from "./useApp";
export * from "./useAutoResize";
export * from "./useDocumentTheme";
export * from "./useHostStyles";
