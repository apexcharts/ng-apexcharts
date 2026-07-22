const fs = require("fs");
const path = require("path");

/**
 * Guards the published type declarations against leaked apexcharts subpath
 * imports (e.g. `apexcharts/ssr`, `apexcharts/client`, `apexcharts/core`).
 *
 * The library loads those subpaths via dynamic `import()` at runtime, but they
 * must never appear as top-level `import`/`export ... from` statements in the
 * emitted `.d.ts`. TypeScript only infers such a statement when a dynamic-import
 * wrapper method lacks an explicit return type; the fix is to annotate the
 * wrapper as `Promise<{ default: typeof ApexChartsType }>` so the declaration
 * references only the main `apexcharts` module.
 *
 * If a subpath leaks, consumers using `moduleResolution: "node"` (which ignores
 * the package `exports` map) fail to build with TS2307, and the library's own
 * production build can fail with TS4053. See issues #482 and #493.
 *
 * Run after `build:pkg` (wired as `postbuild:pkg`).
 */
function checkDtsLeaks() {
  const typesDir = path.join(__dirname, "../dist/ng-apexcharts");

  if (!fs.existsSync(typesDir)) {
    console.error(`❌ Error: build output not found at ${typesDir}`);
    console.error("Run `npm run build:pkg` first.");
    process.exit(1);
  }

  // Match a real top-level import/export bound to an `apexcharts/<subpath>`
  // module specifier, e.g. `import * as x from 'apexcharts/ssr';` or
  // `export { foo } from "apexcharts/client";`. Deliberately does NOT match the
  // bare `apexcharts` main module (always resolvable) or JSDoc mentions.
  const leakRegex = /\bfrom\s+['"]apexcharts\/[^'"]+['"]/;

  const dtsFiles = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".d.ts")) dtsFiles.push(full);
    }
  };
  walk(typesDir);

  const leaks = [];
  for (const file of dtsFiles) {
    const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
    lines.forEach((line, i) => {
      if (leakRegex.test(line)) {
        leaks.push({ file: path.relative(typesDir, file), line: i + 1, text: line.trim() });
      }
    });
  }

  if (leaks.length > 0) {
    console.error("❌ Leaked apexcharts subpath import(s) found in emitted .d.ts:");
    for (const leak of leaks) {
      console.error(`   ${leak.file}:${leak.line}  ${leak.text}`);
    }
    console.error("");
    console.error("Fix: give the dynamic-import wrapper method an explicit return type,");
    console.error("     e.g. `Promise<{ default: typeof ApexChartsType }>`, so declaration");
    console.error("     emit references only the main `apexcharts` module.");
    console.error("     See issues #482 and #493.");
    process.exit(1);
  }

  console.log(`✅ No apexcharts subpath leaks in ${dtsFiles.length} emitted .d.ts file(s).`);
}

checkDtsLeaks();
