import { JsonValue } from '@angular-devkit/core';
import {
  chain,
  noop,
  Rule,
  SchematicContext,
  Tree,
} from "@angular-devkit/schematics";
import {
  getWorkspace,
  updateWorkspace,
  WorkspaceDefinition,
} from "@schematics/angular/utility/workspace";
import { ProjectType } from "@schematics/angular/utility/workspace-models";
import { addRootImport } from "@schematics/angular/utility/standalone/rules";
import { getProjectFromWorkspace, getProjectTargetOptions } from "../utils";
import { NgApexchartNgAddSchema } from "./schema";

const scriptPath = `/node_modules/apexcharts/dist/apexcharts.min.js`;

export default function (options: NgApexchartNgAddSchema): Rule {
  return async (host: Tree, context: SchematicContext) => {
    const workspace = await getWorkspace(host);
    const project = getProjectFromWorkspace(workspace, options.project);

    if (project.extensions["projectType"] !== ProjectType.Application) {
      context.logger.warn(
        `project '${options.project}' is not an angular application. it look like angular library`,
      );
      return;
    }

    return chain([addNgApexchartsModule(options), addApexchartsToScripts(options)]);
  };
}

function addNgApexchartsModule(options: NgApexchartNgAddSchema) {
  return async (_host: Tree, _context: SchematicContext) => {
    const ngxApexchartModuleoduleName = "NgApexchartsModule";
    const libraryName = "ng-apexcharts";
    return addRootImport(
      options.project!,
      ({ code, external }) =>
        code`${external(ngxApexchartModuleoduleName, libraryName)}`,
    );
  };
}

function addApexchartsToScripts(options: NgApexchartNgAddSchema) {
  return async (host: Tree, _context: SchematicContext): Promise<Rule> => {;
    const scriptPath = `/node_modules/apexcharts/dist/apexcharts.min.js`;
    return chain([addScripts(options.project!, 'build', host, scriptPath), addScripts(options.project!, 'test', host, scriptPath)]);;
  };
}

function addScripts(projectName: string, targetName: string, host: Tree, assetPath: string): Rule {
  return updateWorkspace(workspace => {
    const project = getProjectFromWorkspace(workspace, projectName);
    const targetOptions = getProjectTargetOptions(project, targetName);
    if (!targetOptions) {
      return;
    };
    const scripts = targetOptions['scripts'] as (string | { input: string })[];
    const existingScripts = scripts.map(s => (typeof s === 'string' ? s : s.input));
    for (let [, scriptPath] of existingScripts.entries()) {
      if (scriptPath === assetPath)
        return;
    }
    scripts.unshift(assetPath);
    setUpdatedTargetOptions(host, targetOptions, targetName, projectName)
  })

}

function setUpdatedTargetOptions(host: Tree, targetOptions: Record<string, JsonValue | undefined>, targetName: string, projectName: string) {
  if (host.exists('angular.json')) {
    const currentAngular = JSON.parse(host.read('angular.json')!.toString('utf-8'));
    if (currentAngular['projects'][projectName].targets) {
      currentAngular['projects'][projectName].targets[targetName]['options'] = targetOptions;
    }

    if (currentAngular['projects'][projectName].architect) {
      currentAngular['projects'][projectName].architect[targetName]['options'] = targetOptions;
    }
    host.overwrite('angular.json', JSON.stringify(currentAngular, null, 2));
  }
}

