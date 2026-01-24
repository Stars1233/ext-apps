/**
 * TypeDoc plugin that properly decodes HTML entities in mermaid code blocks.
 *
 * This runs BEFORE the mermaid plugin and converts HTML entities back to raw
 * characters, allowing mermaid to parse them correctly.
 *
 * The @boneskull/typedoc-plugin-mermaid converts &lt; to #lt; and &gt; to #gt;,
 * but those aren't valid mermaid entities (mermaid uses numeric codes like #60;).
 * This plugin sidesteps the issue by decoding entities before mermaid sees them.
 */

import { Renderer } from "typedoc";

/**
 * Decode HTML entities back to raw characters.
 * @param {string} html - HTML-encoded string
 * @returns {string} Decoded string
 */
function decodeHtmlEntities(html) {
  return html
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16)),
    )
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&"); // Must be last
}

/**
 * TypeDoc plugin entry point.
 * @param {import('typedoc').Application} app
 */
export function load(app) {
  // Use high priority (200) to run before the mermaid plugin (default is 0)
  app.renderer.on(
    Renderer.EVENT_END_PAGE,
    (page) => {
      if (!page.contents) return;

      // Find mermaid code blocks and decode HTML entities
      page.contents = page.contents.replace(
        /<code class="mermaid">([\s\S]*?)<\/code>/g,
        (match, code) => {
          const decoded = decodeHtmlEntities(code);
          return `<code class="mermaid">${decoded}</code>`;
        },
      );
    },
    200,
  );
}
