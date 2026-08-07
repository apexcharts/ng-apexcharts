import { JsonArray } from "@angular-devkit/core";
import {
  chain,
  Rule,
  SchematicContext,
  Tree,
} from "@angular-devkit/schematics";
import {
  getWorkspace,
  ProjectDefinition,
  updateWorkspace,
} from "@schematics/angular/utility/workspace";
import { ProjectType } from "@schematics/angular/utility/workspace-models";
import {
  getAppModulePath,
  isStandaloneApp,
} from "@schematics/angular/utility/ng-ast-utils";
import {
  addModuleImportToRootModule,
  getProjectFromWorkspace,
  getProjectMainFile,
  hasNgModuleImport,
} from "../utils";
import { NgApexchartNgAddSchema } from "./schema";

const MODULE_NAME = "NgApexchartsModule";
const LIBRARY_NAME = "ng-apexcharts";

/**
 * Older versions of this schematic pushed the pre-bundled ApexCharts UMD build
 * into the `scripts` array of `angular.json`. That is now actively harmful:
 * the chart components load their own bundle through a dynamic `import()`, so
 * the global script is dead weight (~940 KB) that also defeats the
 * tree-shaking `<apx-chart-core>` entry point. Re-running `ng add` cleans it up.
 */
const LEGACY_GLOBAL_SCRIPT = "apexcharts/dist/apexcharts.min.js";

export default function (options: NgApexchartNgAddSchema): Rule {
  return async (host: Tree, context: SchematicContext) => {
    const workspace = await getWorkspace(host);
    const project = getProjectFromWorkspace(workspace, options.project);

    if (project.extensions["projectType"] !== ProjectType.Application) {
      context.logger.warn(
        `Project "${options.project}" is not an Angular application (it looks ` +
          `like a library), so there is no application config to set up. ` +
          `Import the chart components directly where you use them.`,
      );
      return;
    }

    return chain([
      removeLegacyGlobalScript(options.project!, context),
      registerComponents(project, context),
    ]);
  };
}

/**
 * Makes the chart components reachable from templates.
 *
 * Standalone applications intentionally get no code change. The components are
 * standalone, so they are imported by whichever component renders them. Adding
 * `NgApexchartsModule` to the application config would be dead code: the module
 * only re-exports standalone components and declares no providers, so
 * `importProvidersFrom(NgApexchartsModule)` contributes nothing and still
 * leaves `<apx-chart>` unresolved in templates.
 */
function registerComponents(
  project: ProjectDefinition,
  context: SchematicContext,
): Rule {
  return (host: Tree) => {
    const mainFile = getProjectMainFile(project);

    if (isStandaloneApp(host, mainFile)) {
      logStandaloneUsage(context);
      return host;
    }

    const modulePath = getAppModulePath(host, mainFile);

    if (hasNgModuleImport(host, modulePath, MODULE_NAME)) {
      context.logger.info(
        `  ↳ ${MODULE_NAME} is already imported in ${modulePath}, skipping.`,
      );
      return host;
    }

    addModuleImportToRootModule(host, MODULE_NAME, LIBRARY_NAME, project);
    context.logger.info(`  ↳ Added ${MODULE_NAME} to ${modulePath}.`);

    return host;
  };
}

function logStandaloneUsage(context: SchematicContext): void {
  context.logger.info(
    [
      "",
      "  ng-apexcharts ships standalone components, so there is nothing to",
      "  register globally. Import the one you need where you use it:",
      "",
      '    import { ChartComponent } from "ng-apexcharts";',
      "",
      "    @Component({",
      "      imports: [ChartComponent],",
      "      template: `<apx-chart [series]=\"series\" [chart]=\"chart\" />`,",
      "    })",
      "",
      "  Other entry points: ChartCoreComponent (<apx-chart-core>, smaller",
      "  bundle), ChartSSRComponent + ChartHydrateComponent (server rendering).",
      "",
    ].join("\n"),
  );
}

/** Drops the redundant global ApexCharts script left behind by older versions. */
function removeLegacyGlobalScript(
  projectName: string,
  context: SchematicContext,
): Rule {
  return updateWorkspace((workspace) => {
    const project = workspace.projects.get(projectName);

    if (!project) {
      return;
    }

    for (const targetName of ["build", "test"]) {
      const targetOptions = project.targets.get(targetName)?.options;
      const scripts = targetOptions?.["scripts"];

      if (!targetOptions || !Array.isArray(scripts)) {
        continue;
      }

      const remaining = scripts.filter((script) => {
        const input =
          typeof script === "string"
            ? script
            : (script as { input?: string } | null)?.input;

        return !input?.endsWith(LEGACY_GLOBAL_SCRIPT);
      });

      if (remaining.length !== scripts.length) {
        targetOptions["scripts"] = remaining as JsonArray;
        context.logger.info(
          `  ↳ Removed the redundant ${LEGACY_GLOBAL_SCRIPT} global script ` +
            `from the "${targetName}" target. The chart components load ` +
            `ApexCharts on demand.`,
        );
      }
    }
  });
}
