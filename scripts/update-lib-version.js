const fs = require("fs");
const path = require("path");

/**
 * Updates the version in the library's package.json
 * Usage: npm run update-lib-version <version>
 */
function updateLibraryVersion() {
  const newVersion = process.argv[2];

  if (!newVersion) {
    console.error("❌ Error: No version provided");
    console.error("Usage: node update-lib-version.js <version>");
    process.exit(1);
  }

  // Validate version format (basic semver check)
  const versionRegex = /^\d+\.\d+\.\d+$/;
  if (!versionRegex.test(newVersion)) {
    console.error(`❌ Error: Invalid version format: ${newVersion}`);
    console.error("Expected format: X.Y.Z (e.g., 1.2.3)");
    process.exit(1);
  }

  const libPackageJsonPath = path.join(
    __dirname,
    "../projects/ng-apexcharts/package.json"
  );

  // Check if file exists
  if (!fs.existsSync(libPackageJsonPath)) {
    console.error(
      `❌ Error: Library package.json not found at ${libPackageJsonPath}`
    );
    process.exit(1);
  }

  try {
    // Read current package.json
    const packageJson = JSON.parse(fs.readFileSync(libPackageJsonPath, "utf8"));

    // Update version
    const oldVersion = packageJson.version;
    packageJson.version = newVersion;

    // Write back to file with proper formatting
    fs.writeFileSync(
      libPackageJsonPath,
      JSON.stringify(packageJson, null, 2) + "\n"
    );

    console.log(
      `✅ Updated ng-apexcharts version: ${oldVersion} → ${newVersion}`
    );
    console.log(`📁 Updated file: ${libPackageJsonPath}`);
  } catch (error) {
    console.error("❌ Error updating library version:", error.message);
    process.exit(1);
  }
}

// Only run if called directly (not when required as module)
if (require.main === module) {
  updateLibraryVersion();
}

module.exports = updateLibraryVersion;
