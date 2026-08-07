/**
 * The `apexcharts` range `ng add ng-apexcharts` writes into a consumer's
 * `package.json`.
 *
 * This MUST stay inside the `peerDependencies.apexcharts` range declared in
 * `projects/ng-apexcharts/package.json`. `npm run check:schematics-version`
 * (wired into `postbuild:pkg`) fails the build if the two ever drift apart.
 *
 * Kept on 6.x deliberately: apexcharts 5.16.0 ships broken drilldown types
 * (see #493), so a fresh install should not land on the 5.x line.
 */
export const apexchartsVersion = "^6.7.0";
