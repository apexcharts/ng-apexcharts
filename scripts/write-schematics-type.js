const fs = require("fs");
const path = require("path");

/**
 * Marks the emitted schematics directory as CommonJS.
 *
 * ng-packagr 22 writes `"type": "module"` into the generated
 * `dist/ng-apexcharts/package.json`. The schematics, however, are compiled to
 * CommonJS (`module: "commonjs"` in `schematics/tsconfig.json`) because that is
 * what the Angular CLI's schematic loader expects.
 *
 * Without this marker the two disagree: Node resolves the nearest package.json,
 * sees `type: module`, and treats `schematics/ng-add/index.js` as ESM. ESM has
 * no extensionless resolution, so the very first internal `require("../utils")`
 * fails and `ng add ng-apexcharts` dies with MODULE_NOT_FOUND.
 *
 * A nested package.json scopes `type: commonjs` to this subtree only, leaving
 * the ESM library bundle untouched.
 *
 * Run after `build:schematics` (wired as `postbuild:schematics`).
 */
function writeSchematicsType() {
  const schematicsDir = path.join(__dirname, "../dist/ng-apexcharts/schematics");

  if (!fs.existsSync(schematicsDir)) {
    console.error(`❌ Error: schematics output not found at ${schematicsDir}`);
    console.error("Run `npm run build:schematics` first.");
    process.exit(1);
  }

  const target = path.join(schematicsDir, "package.json");
  fs.writeFileSync(target, `${JSON.stringify({ type: "commonjs" }, null, 2)}\n`);

  console.log("✅ Marked dist/ng-apexcharts/schematics as CommonJS.");
}

writeSchematicsType();
