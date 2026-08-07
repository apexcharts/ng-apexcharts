const fs = require("fs");
const path = require("path");

/**
 * Prints the CHANGELOG.md section for one version to stdout.
 *
 * Used by the publish workflow to create the GitHub release notes after a
 * successful npm publish. Exits non-zero when the version has no entry so the
 * workflow can fall back to GitHub's auto-generated notes.
 *
 * Usage: node scripts/extract-changelog.js 2.5.0
 */
function extractChangelog() {
  const version = process.argv[2];

  if (!version) {
    console.error("Usage: node extract-changelog.js <version>");
    process.exit(1);
  }

  const changelog = fs.readFileSync(
    path.join(__dirname, "../CHANGELOG.md"),
    "utf8",
  );
  const lines = changelog.split("\n");

  // Entries start with a heading like `# [2.5.0](...)` or `## [2.0.3](...)`.
  const isHeading = (line) => /^#{1,3} \[\d+\.\d+\.\d+/.test(line);
  const start = lines.findIndex(
    (line) => isHeading(line) && line.includes(`[${version}]`),
  );

  if (start === -1) {
    console.error(`No CHANGELOG entry found for version ${version}.`);
    process.exit(1);
  }

  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (isHeading(lines[i])) {
      end = i;
      break;
    }
  }

  // Drop the version heading itself; the release title already carries it.
  process.stdout.write(lines.slice(start + 1, end).join("\n").trim() + "\n");
}

extractChangelog();
