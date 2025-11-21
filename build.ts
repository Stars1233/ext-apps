#!/usr/bin/env tsx
import { execSync } from "child_process";
import * as esbuild from "esbuild";
import { readFile, writeFile } from "fs/promises";

// Run TypeScript compiler for type declarations
execSync("tsc", { stdio: "inherit" });

const isDevelopment = process.env.NODE_ENV === "development";

// Build all JavaScript/TypeScript files
async function buildJs(
  entrypoint: string,
  opts: { outdir?: string; target?: "browser" | "node" } = {},
) {
  return esbuild.build({
    entryPoints: [entrypoint],
    outdir: opts.outdir ?? "dist",
    platform: opts.target === "node" ? "node" : "browser",
    format: "esm",
    bundle: true,
    minify: !isDevelopment,
    sourcemap: isDevelopment ? "inline" : false,
  });
}

await Promise.all([
  buildJs("src/app.ts", { outdir: "dist/src" }),
  buildJs("src/app-host.ts", { outdir: "dist/src" }),
  buildJs("src/react/index.tsx", { outdir: "dist/src/react" }),
  // buildJs("examples/example-ui-react.tsx", { outdir: "dist/examples" }),
  // buildJs("examples/example-ui.ts", { outdir: "dist/examples" }),
  // buildJs("examples/example-server.ts", {
  //   target: "node",
  //   outdir: "dist/examples",
  // }),
]);

// async function inlineHtml(htmlFilePath: string, outputFilePath: string) {
//   let html = await readFile(htmlFilePath, "utf-8");
//   // Find all src sources, then fetch them, then replace them
//   const files = html.matchAll(
//     /<script src="((?:\.\/)?dist\/.*?\.js)"><\/script>/g,
//   );
//   const fileContent = Object.fromEntries(
//     await Promise.all(
//       Array.from(files, async ([, filename]) => {
//         const scriptContent = await readFile(filename, "utf-8");
//         return [filename, scriptContent];
//       }),
//     ),
//   );
//   html = html.replace(
//     /<script src="((?:\.\/)?dist\/.*?\.js)"><\/script>/g,
//     (_, filename) => {
//       let scriptContent = fileContent[filename];
//       // Escape </script> to prevent premature script tag closing
//       // This is the standard way to inline scripts safely
//       scriptContent = scriptContent.replace(/<\/script>/gi, "<\\/script>");
//       return `<script>${scriptContent}</script>`;
//     },
//   );
//   await writeFile(outputFilePath, html);
// }

// await inlineHtml("examples/example-ui.html", "dist/examples/example-ui.html");
// await inlineHtml(
//   "examples/example-ui-react.html",
//   "dist/examples/example-ui-react.html",
// );
