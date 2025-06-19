import { JsonValue } from '@angular-devkit/core';
import {
  chain,
  Rule,
  SchematicContext,
  Tree,
} from "@angular-devkit/schematics";
import {
  getWorkspace,
  updateWorkspace,
} from "@schematics/angular/utility/workspace";
import { ProjectType } from "@schematics/angular/utility/workspace-models";
import { addRootImport } from "@schematics/angular/utility/standalone/rules";
import { addImportToModule } from "@schematics/angular/utility/ast-utils";
import { InsertChange } from "@schematics/angular/utility/change";
import { getProjectFromWorkspace, getProjectTargetOptions } from "../utils";
import { NgApexchartNgAddSchema } from "./schema";
import * as ts from 'typescript';

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
  return async (host: Tree, _context: SchematicContext) => {
    const workspace = await getWorkspace(host);
    const project = getProjectFromWorkspace(workspace, options.project);
    const ngxApexchartModuleName = "NgApexchartsModule";
    const libraryName = "ng-apexcharts";
    
    // Check if this is a standalone application
    const isStandaloneApp = await isStandaloneApplication(host, project);
    
    if (isStandaloneApp) {
      // Use addRootImport for standalone applications
      return addRootImport(
        options.project!,
        ({ code, external }) =>
          code`${external(ngxApexchartModuleName, libraryName)}`,
      );
    } else {
      // Use traditional module import for module-based applications
      return (tree: Tree) => {
        try {
          // Find the app module file - it could be app.module.ts or app-module.ts
          const possibleModulePaths = [
            `/projects/${options.project}/src/app/app.module.ts`,
            `/projects/${options.project}/src/app/app-module.ts`
          ];
          
          let modulePath: string | null = null;
          for (const path of possibleModulePaths) {
            if (tree.exists(path)) {
              modulePath = path;
              break;
            }
          }
          
          if (!modulePath) {
            throw new Error(`Could not find app module file for project ${options.project}`);
          }
          
          // Manually add the import to the module
          addModuleImportToModule(tree, modulePath, ngxApexchartModuleName, libraryName);
          
        } catch (error) {
          throw error;
        }
        return tree;
      };
    }
  };
}

// Custom function to add module import directly to a specific module file
function addModuleImportToModule(host: Tree, modulePath: string, moduleName: string, src: string) {
  const moduleSource = parseSourceFile(host, modulePath);

  if (!moduleSource) {
    throw new Error(`Module not found: ${modulePath}`);
  }

  const changes = addImportToModule(moduleSource, modulePath, moduleName, src);
  const recorder = host.beginUpdate(modulePath);

  changes.forEach((change: any) => {
    if (change instanceof InsertChange) {
      recorder.insertLeft(change.pos, change.toAdd);
    }
  });

  host.commitUpdate(recorder);
}

function parseSourceFile(host: Tree, path: string) {
  const buffer = host.read(path);
  if (!buffer) {
    throw new Error(`Could not read file: ${path}`);
  }
  
  const content = buffer.toString();
  return ts.createSourceFile(path, content, ts.ScriptTarget.Latest, true);
}

async function isStandaloneApplication(host: Tree, project: any): Promise<boolean> {
  try {
    // Get the main file path
    const buildOptions = project.targets?.get('build')?.options;
    if (!buildOptions) {
      return false;
    }
    
    const mainPath = (buildOptions['browser'] || buildOptions['main']) as string;
    if (!mainPath || !host.exists(mainPath)) {
      return false;
    }
    
    // Read the main.ts file to check if it uses bootstrapApplication (standalone) or bootstrapModule (traditional)
    const mainContent = host.read(mainPath)?.toString();
    if (!mainContent) {
      return false;
    }
    
    // If it contains bootstrapApplication, it's a standalone app
    if (mainContent.includes('bootstrapApplication')) {
      return true;
    }
    
    // If it contains bootstrapModule, it's a traditional module-based app
    if (mainContent.includes('bootstrapModule')) {
      return false;
    }
    
    // Default to false (module-based) if we can't determine
    return false;
  } catch (error) {
    // Default to false (module-based) if there's any error
    return false;
  }
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
    
    // Initialize scripts as empty array if it doesn't exist
    if (!targetOptions['scripts']) {
      targetOptions['scripts'] = [];
    }
    
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

