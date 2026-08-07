const fs = require("fs");
const path = require("path");
const semver = require("semver");

/**
 * Guards `ng add ng-apexcharts` against installing an unsupported ApexCharts.
 *
 * The schematic writes a hardcoded `apexcharts` range into the consumer's
 * `package.json` (`schematics/version.ts`). Nothing links that constant to the
 * library's own `peerDependencies.apexcharts`, so the two can silently drift.
 *
 * They did: the constant sat at "4.0.0" while the peer range moved to
 * "^5.10.3 || ^6.0.0". Every `ng add` installed an ApexCharts with no
 * `apexcharts/client` subpath, so the chart could never load. This check makes
 * that class of drift a build failure instead of a broken first-run experience.
 *
 * Run after `build:pkg` (wired as part of `postbuild:pkg`).
 */
function checkSchematicsVersion() {
  const versionFile = path.join(
    __dirname,
    "../projects/ng-apexcharts/schematics/version.ts",
  );
  const pkgFile = path.join(__dirname, "../projects/ng-apexcharts/package.json");

  for (const file of [versionFile, pkgFile]) {
    if (!fs.existsSync(file)) {
      console.error(`❌ Error: expected file not found at ${file}`);
      process.exit(1);
    }
  }

  const source = fs.readFileSync(versionFile, "utf8");
  const match = source.match(
    /export\s+const\s+apexchartsVersion\s*=\s*["'`]([^"'`]+)["'`]/,
  );

  if (!match) {
    console.error(`❌ Could not find \`apexchartsVersion\` in ${versionFile}.`);
    console.error("   Expected: export const apexchartsVersion = \"<range>\";");
    process.exit(1);
  }

  const schematicRange = match[1];
  const peerRange = JSON.parse(fs.readFileSync(pkgFile, "utf8"))
    .peerDependencies?.apexcharts;

  if (!peerRange) {
    console.error(
      "❌ No `peerDependencies.apexcharts` declared in the library package.json.",
    );
    process.exit(1);
  }

  if (semver.validRange(schematicRange) === null) {
    console.error(`❌ \`apexchartsVersion\` is not a valid semver range: "${schematicRange}"`);
    process.exit(1);
  }

  // Every version the schematic can install must also satisfy the peer range,
  // otherwise `ng add` produces an install the library does not support.
  if (!semver.subset(schematicRange, peerRange)) {
    console.error("❌ `ng add` would install an unsupported apexcharts version.");
    console.error("");
    console.error(`   schematics/version.ts : ${schematicRange}`);
    console.error(`   peerDependencies      : ${peerRange}`);
    console.error("");
    console.error("Fix: change `apexchartsVersion` so it is a subset of the peer");
    console.error("     range (or widen the peer range if that was intended).");
    process.exit(1);
  }

  console.log(
    `✅ ng add installs apexcharts "${schematicRange}", within the supported peer range "${peerRange}".`,
  );
}

checkSchematicsVersion();
