import {
  ProjectDefinition,
  WorkspaceDefinition,
} from "@schematics/angular/utility/workspace";
import { Tree, SchematicsException } from "@angular-devkit/schematics";

export function getProjectTargetOptions(project: ProjectDefinition, buildTarget: string) {
  if (project?.targets?.get(buildTarget)?.options) {
    return project!.targets!.get(buildTarget)!.options;
  }

  throw new Error(`Cannot determine project target configuration for: ${buildTarget}.`);
}

export function getProjectFromWorkspace(
  workspace: WorkspaceDefinition,
  projectName: string | undefined,
): ProjectDefinition {
  if (!projectName) {
    // TODO(crisbeto): some schematics APIs have the project name as optional so for now it's
    // simpler to allow undefined and checking it at runtime. Eventually we should clean this up.
    throw new SchematicsException("Project name is required.");
  }

  const project = workspace.projects.get(projectName);

  if (!project) {
    throw new SchematicsException(
      `Could not find project in workspace: ${projectName}`,
    );
  }

  return project;
}

export function addPackageToPackageJson(
  host: Tree,
  pkg: string,
  version: string,
): Tree {
  if (host.exists("package.json")) {
    const sourceText = host.read("package.json")!.toString("utf-8");

    const json = JSON.parse(sourceText);

    if (!json.dependencies) {
      json.dependencies = {};
    }

    if (!json.dependencies[pkg]) {
      json.dependencies[pkg] = version;
      json.dependencies = sortObjectByKeys(json.dependencies);
    }

    host.overwrite("package.json", JSON.stringify(json, null, 2));
  }

  return host;
}

function sortObjectByKeys(obj: any): any {
  return Object.keys(obj)
    .sort()
    .reduce((result: any, key: any) => (result[key] = obj[key]) && result, {});
}
