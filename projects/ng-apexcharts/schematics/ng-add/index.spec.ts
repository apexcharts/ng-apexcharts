import "jasmine";
import {
  SchematicTestRunner,
  UnitTestTree,
} from "@angular-devkit/schematics/testing";
import {
  Schema as ApplicationOptions,
  Style,
} from "@schematics/angular/application/schema";
import { Schema as WorkspaceOtions } from "@schematics/angular/workspace/schema";
import * as path from "path";
import { apexchartsVersion } from "../version";

const LEGACY_GLOBAL_SCRIPT = "/node_modules/apexcharts/dist/apexcharts.min.js";

describe("ng add ng-apexcharts", () => {
  const collectionPath = path.join(__dirname, "../collection.json");
  const runner = new SchematicTestRunner("schematics", collectionPath);
  const workspaceOptions: WorkspaceOtions = {
    name: "workspace",
    newProjectRoot: "projects",
    version: "1.0.0",
  };
  const moduleAppOptions: ApplicationOptions = {
    name: "ng-apexcharts-app",
    inlineStyle: false,
    inlineTemplate: false,
    routing: false,
    style: Style.Scss,
    skipTests: false,
    skipPackageJson: false,
    standalone: false,
  };
  const standaloneAppOptions: ApplicationOptions = {
    name: "ng-apexcharts-standalone-app",
    inlineStyle: false,
    inlineTemplate: false,
    routing: false,
    style: Style.Scss,
    skipTests: false,
    skipPackageJson: false,
    standalone: true,
  };

  let appTree: UnitTestTree;

  beforeEach(async () => {
    let tree = await runner.runExternalSchematic(
      "@schematics/angular",
      "workspace",
      workspaceOptions,
    );
    tree = await runner.runExternalSchematic(
      "@schematics/angular",
      "application",
      moduleAppOptions,
      tree,
    );
    appTree = await runner.runExternalSchematic(
      "@schematics/angular",
      "application",
      standaloneAppOptions,
      tree,
    );
  });

  /** Freshly generated Angular apps have no `options` on the `test` target. */
  function targetsFor(angularJson: any, project: string) {
    const projectConfig = angularJson.projects[project];

    return projectConfig.architect ?? projectConfig.targets;
  }

  function scriptsFor(
    tree: UnitTestTree,
    project: string,
    target: string,
  ): unknown[] {
    const angularJson = JSON.parse(tree.readContent("angular.json"));

    return targetsFor(angularJson, project)[target]?.options?.scripts ?? [];
  }

  it("adds a supported apexcharts version to package.json", async () => {
    const tree = await runner.runSchematic(
      "ng-add",
      { project: "ng-apexcharts-app" },
      appTree,
    );
    const packageJson = tree.readJson("package.json") as {
      dependencies: Record<string, string>;
    };

    expect(packageJson.dependencies?.apexcharts).toBe(apexchartsVersion);
  });

  describe("NgModule application", () => {
    const options = { project: "ng-apexcharts-app" };

    it("imports NgApexchartsModule into the root module", async () => {
      const tree = await runner.runSchematic(
        "ng-add-setup-project",
        options,
        appTree,
      );
      const appModule = tree.readContent(
        "/projects/ng-apexcharts-app/src/app/app-module.ts",
      );

      expect(appModule).toMatch(
        /import\s*\{\s*NgApexchartsModule\s*\}\s*from\s*'ng-apexcharts'/,
      );
      expect(appModule).toContain("NgApexchartsModule");
    });

    it("is idempotent", async () => {
      let tree = await runner.runSchematic(
        "ng-add-setup-project",
        options,
        appTree,
      );
      tree = await runner.runSchematic("ng-add-setup-project", options, tree);

      const appModule = tree.readContent(
        "/projects/ng-apexcharts-app/src/app/app-module.ts",
      );
      const occurrences = appModule.split("NgApexchartsModule").length - 1;

      // One import statement, one entry in the imports array.
      expect(occurrences)
        .withContext("Re-running ng add must not duplicate the module import")
        .toBe(2);
    });
  });

  describe("standalone application", () => {
    const options = { project: "ng-apexcharts-standalone-app" };
    const appConfigPath =
      "projects/ng-apexcharts-standalone-app/src/app/app.config.ts";

    it("leaves the application config untouched", async () => {
      const before = appTree.readContent(appConfigPath);
      const tree = await runner.runSchematic(
        "ng-add-setup-project",
        options,
        appTree,
      );

      // `NgApexchartsModule` only re-exports standalone components and declares
      // no providers, so `importProvidersFrom(NgApexchartsModule)` would be dead
      // code that still leaves `<apx-chart>` unresolved in templates.
      expect(tree.readContent(appConfigPath))
        .withContext("Standalone apps import the components where they are used")
        .toBe(before);
      expect(tree.readContent(appConfigPath)).not.toContain("NgApexchartsModule");
    });
  });

  describe("global ApexCharts script", () => {
    it("is never added", async () => {
      for (const project of [
        "ng-apexcharts-app",
        "ng-apexcharts-standalone-app",
      ]) {
        const tree = await runner.runSchematic(
          "ng-add-setup-project",
          { project },
          appTree,
        );

        for (const target of ["build", "test"]) {
          // The components dynamically import their own ApexCharts bundle, so a
          // global script is redundant and defeats <apx-chart-core> tree-shaking.
          expect(scriptsFor(tree, project, target))
            .withContext(`${project} / ${target}`)
            .not.toContain(LEGACY_GLOBAL_SCRIPT);
        }
      }
    });

    it("is removed when a previous version left it behind", async () => {
      const project = "ng-apexcharts-app";
      const angularJson = JSON.parse(appTree.readContent("angular.json"));
      const targets = targetsFor(angularJson, project);

      for (const target of ["build", "test"]) {
        targets[target].options ??= {};
        targets[target].options.scripts = [
          LEGACY_GLOBAL_SCRIPT,
          "some-other-script.js",
        ];
      }
      appTree.overwrite("angular.json", JSON.stringify(angularJson, null, 2));

      const tree = await runner.runSchematic(
        "ng-add-setup-project",
        { project },
        appTree,
      );

      for (const target of ["build", "test"]) {
        const scripts = scriptsFor(tree, project, target);
        expect(scripts)
          .withContext(`${target} target keeps unrelated scripts`)
          .toContain("some-other-script.js");
        expect(scripts)
          .withContext(`${target} target drops the redundant global script`)
          .not.toContain(LEGACY_GLOBAL_SCRIPT);
      }
    });
  });
});
