/**
 * The `apexcharts` range `ng add ng-apexcharts` writes into a consumer's
 * `package.json`.
 *
 * This MUST stay inside the `peerDependencies.apexcharts` range declared in
 * `projects/ng-apexcharts/package.json`. `npm run check:schematics-version`
 * (wired into `postbuild:pkg`) fails the build if the two ever drift apart.
 *
 * Floor kept at 6.7.0 deliberately: apexcharts 5.16.0 ships broken drilldown
 * types (see #493), so a fresh install should not land on the 5.x line.
 *
 * The range spans the majors on purpose rather than naming one. npm resolves
 * it to the newest published version that satisfies, so the same string lands
 * a fresh project on 7.x today and on 8.x the moment 8 is released, without
 * this package needing a follow-up release to switch over. Pinning ^8.0.0
 * early would break `ng add` for everyone until 8 exists.
 */
export const apexchartsVersion = "^6.7.0 || ^7.0.0 || ^8.0.0";
