import type { McpUiSandboxProxyReadyNotification, McpUiSandboxResourceReadyNotification } from "../../../dist/src/types";

const ALLOWED_REFERRER_PATTERN = /^http:\/\/(localhost|127\.0\.0\.1)(:|\/|$)/;

if (window.self === window.top) {
  throw new Error("This file is only to be used in an iframe sandbox.");
}

if (!document.referrer) {
  throw new Error("No referrer, cannot validate embedding site.");
}

if (!document.referrer.match(ALLOWED_REFERRER_PATTERN)) {
  throw new Error(
    `Embedding domain not allowed in referrer ${document.referrer}. (Consider updating the validation logic to allow your domain.)`,
  );
}

// Security self-test: verify iframe isolation is working correctly.
// This MUST throw a SecurityError -- if `window.top` is accessible, the sandbox
// configuration is dangerously broken and untrusted content could escape.
try {
  window.top!.alert("If you see this, the sandbox is not setup securely.");
  throw "FAIL";
} catch (e) {
  if (e === "FAIL") {
    throw new Error("The sandbox is not setup securely.");
  }

  // Expected: SecurityError confirms proper sandboxing.
}

// Double-iframe sandbox architecture: THIS file is the outer sandbox proxy
// iframe on a separate origin. It creates an inner iframe for untrusted HTML
// content. Per the specification, the Host and the Sandbox MUST have different
// origins.
const inner = document.createElement("iframe");
inner.style = "width:100%; height:100%; border:none;";
inner.setAttribute("sandbox", "allow-scripts allow-same-origin allow-forms");
document.body.appendChild(inner);

const RESOURCE_READY_NOTIFICATION: McpUiSandboxResourceReadyNotification["method"] =
  "ui/notifications/sandbox-resource-ready";
const PROXY_READY_NOTIFICATION: McpUiSandboxProxyReadyNotification["method"] =
  "ui/notifications/sandbox-proxy-ready";

// Message relay: This Sandbox (outer iframe) acts as a bidirectional bridge,
// forwarding messages between:
//
//   Host (parent window) ↔ Sandbox (outer frame) ↔ Guest UI (inner iframe)
//
// Reason: the parent window and inner iframe have different origins and can't
// communicate directly, so the outer iframe forwards messages in both
// directions to connect them.
//
// Special case: The "ui/notifications/sandbox-proxy-ready" message is
// intercepted here (not relayed) because the Sandbox uses it to configure and
// load the inner iframe with the Guest UI HTML content.
window.addEventListener("message", async (event) => {
  if (event.source === window.parent) {
    // NOTE: In production you'll also want to validate `event.origin` against
    // your Host domain.
    if (event.data && event.data.method === RESOURCE_READY_NOTIFICATION) {
      const { html, sandbox } = event.data.params;
      if (typeof sandbox === "string") {
        inner.setAttribute("sandbox", sandbox);
      }
      if (typeof html === "string") {
        inner.srcdoc = html;
      }
    } else {
      if (inner && inner.contentWindow) {
        inner.contentWindow.postMessage(event.data, "*");
      }
    }
  } else if (event.source === inner.contentWindow) {
    // Relay messages from inner frame to parent window.
    window.parent.postMessage(event.data, "*");
  }
});

// Notify the Host that the Sandbox is ready to receive Guest UI HTML.
window.parent.postMessage({
  jsonrpc: "2.0",
  method: PROXY_READY_NOTIFICATION,
  params: {},
}, "*");
