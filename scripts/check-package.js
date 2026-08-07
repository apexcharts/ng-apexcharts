const fs = require("fs");
const path = require("path");

/**
 * Final gate over the assembled `dist/ng-apexcharts` package, run as the last
 * step of `npm run package` (which is what CI and the publish workflow use).
 *
 * Each check corresponds to a defect that either shipped or nearly shipped:
 *
 * 1. README must exist and be byte-identical to the root README. The package
 *    used to carry its own copy (`projects/ng-apexcharts/README.md`), which
 *    drifted years behind and is what npmjs.com renders. The root README is the
 *    single source of truth, copied in by `copyfile:readme`.
 * 2. The ng-add schematic must actually `require()`. ng-packagr 22 marks the
 *    package `"type": "module"` while the schematics are CommonJS; without the
 *    nested `{"type":"commonjs"}` marker every `ng add` dies at module load.
 *    Loading it here proves the marker and the internal requires both work.
 * 3. No spec files may ship.
 * 4. The schematics directory must exist at all. `npm run package` used to
 *    build the library and the schematics concurrently while ng-packagr wipes
 *    the output directory, so whether `ng add` shipped was a race.
 */
function checkPackage() {
  const distDir = path.join(__dirname, "../dist/ng-apexcharts");
  const failures = [];

  if (!fs.existsSync(distDir)) {
    console.error(`❌ Error: build output not found at ${distDir}`);
    console.error("Run `npm run package` first.");
    process.exit(1);
  }

  // 1. README present and in sync with the root README.
  const distReadme = path.join(distDir, "README.md");
  const rootReadme = path.join(__dirname, "../README.md");
  if (!fs.existsSync(distReadme)) {
    failures.push("README.md is missing from the package (copyfile:readme did not run).");
  } else if (
    fs.readFileSync(distReadme, "utf8") !== fs.readFileSync(rootReadme, "utf8")
  ) {
    failures.push("README.md in the package differs from the root README.md.");
  }

  // 4. Schematics survived the build pipeline.
  const ngAddEntry = path.join(distDir, "schematics/ng-add/index.js");
  if (!fs.existsSync(ngAddEntry)) {
    failures.push("schematics/ng-add/index.js is missing (schematics were not built into the package).");
  } else {
    // 2. The schematic loads under the package's module-type rules.
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const ngAdd = require(ngAddEntry);
      if (typeof ngAdd.default !== "function") {
        failures.push("schematics/ng-add/index.js loaded but has no default factory export.");
      }
    } catch (e) {
      failures.push(
        `schematics/ng-add/index.js failed to load: ${e.message.split("\n")[0]} ` +
          "(is the {\"type\":\"commonjs\"} marker missing from dist/ng-apexcharts/schematics/package.json?)",
      );
    }
  }

  // 3. No spec files in the published package.
  const specs = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.spec\.(js|ts|d\.ts)$/.test(entry.name)) specs.push(path.relative(distDir, full));
    }
  };
  walk(distDir);
  if (specs.length) {
    failures.push(`Spec files must not ship: ${specs.join(", ")}`);
  }

  if (failures.length) {
    console.error("❌ Package verification failed:");
    for (const failure of failures) {
      console.error(`   - ${failure}`);
    }
    process.exit(1);
  }

  console.log("✅ Package verified: README in sync, ng-add loads, no spec files.");
}

checkPackage();
