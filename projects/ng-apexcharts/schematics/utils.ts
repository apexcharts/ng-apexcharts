import { Path } from "@angular-devkit/core";
import {
  Rule,
  SchematicContext,
  SchematicsException,
  Tree,
} from "@angular-devkit/schematics";
import { InsertChange } from "@schematics/angular/utility/change";
import {
  ProjectDefinition,
  WorkspaceDefinition,
} from "@schematics/angular/utility/workspace";
import { addImportToModule } from "@schematics/angular/utility/ast-utils";
import { getAppModulePath } from "@schematics/angular/utility/ng-ast-utils";
import * as stripJsonComments from "strip-json-comments";

import * as ts from "@schematics/angular/third_party/github.com/Microsoft/TypeScript/lib/typescript";

export function readJsonInTree<T = unknown>(host: Tree, path: string): T {
  if (!host.exists(path)) {
    throw new Error(`Cannot find ${path}`);
  }
  const contents = stripJsonComments(
    (host.read(path) as Buffer).toString("utf-8"),
  );
  try {
    return JSON.parse(contents);
  } catch (e) {
    throw new Error(
      `Cannot parse ${path}: ${e instanceof Error ? e.message : ""}`,
    );
  }
}

export function updateJsonInTree<T = unknown, O = T>(
  path: string,
  callback: (json: T, context: SchematicContext) => O,
): Rule {
  return (host: Tree, context: SchematicContext): Tree => {
    if (!host.exists(path)) {
      host.create(path, serializeJson(callback({} as T, context)));
      return host;
    }
    host.overwrite(
      path,
      serializeJson(callback(readJsonInTree(host, path), context)),
    );
    return host;
  };
}

function serializeJson(json: unknown): string {
  return `${JSON.stringify(json, null, 2)}\n`;
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

function sortObjectByKeys<T extends object>(obj: T): T {
  return Object.keys(obj)
    .sort()
    .reduce(
      (result: T, key: string & keyof T) => (result[key] = obj[key]) && result,
      {} as T,
    );
}

export function getProjectTargetOptions(
  project: ProjectDefinition,
  buildTarget: string,
) {
  if (project?.targets?.get(buildTarget)?.options) {
    return project!.targets!.get(buildTarget)!.options;
  }

  throw new Error(
    `Cannot determine project target configuration for: ${buildTarget}.`,
  );
}

export function getProjectMainFile(project: ProjectDefinition): string {
  const buildOptions = getProjectTargetOptions(project, "build");
  if (!buildOptions) {
    throw new SchematicsException(
      "Could not find the project main file inside of the " +
        `workspace config (${project.sourceRoot})`,
    );
  }
  // `browser` is for the `@angular-devkit/build-angular:application` builder while
  // `main` is for the `@angular-devkit/build-angular:browser` builder.
  const mainPath = (buildOptions["browser"] || buildOptions["main"]) as
    | Path
    | undefined;

  if (!mainPath) {
    throw new SchematicsException(
      "Could not find the project main file inside of the " +
        `workspace config (${project.sourceRoot})`,
    );
  }

  return mainPath;
}

/**
 * Whether the Angular module in the given path imports the specified module class name.
 */
export function hasNgModuleImport(
  tree: Tree,
  modulePath: string,
  className: string,
): boolean {
  const moduleFileContent = tree.read(modulePath);

  if (!moduleFileContent) {
    throw new SchematicsException(
      `Could not read Angular module file: ${modulePath}`,
    );
  }

  const parsedFile = ts.createSourceFile(
    modulePath,
    moduleFileContent.toString(),
    ts.ScriptTarget.Latest,
    true,
  );
  const ngModuleMetadata = findNgModuleMetadata(parsedFile);

  if (!ngModuleMetadata) {
    throw new SchematicsException(
      `Could not find NgModule declaration inside: "${modulePath}"`,
    );
  }

  for (const property of ngModuleMetadata!.properties) {
    if (
      !ts.isPropertyAssignment(property) ||
      property.name.getText() !== "imports" ||
      !ts.isArrayLiteralExpression(property.initializer)
    ) {
      continue;
    }

    if (
      property.initializer.elements.some(
        (element) => element.getText() === className,
      )
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Finds a NgModule declaration within the specified TypeScript node and returns the
 * corresponding metadata for it. This function searches breadth first because
 * NgModule's are usually not nested within other expressions or declarations.
 */
function findNgModuleMetadata(
  rootNode: ts.Node,
): ts.ObjectLiteralExpression | null {
  // Add immediate child nodes of the root node to the queue.
  const nodeQueue: ts.Node[] = [...rootNode.getChildren()];

  while (nodeQueue.length) {
    const node = nodeQueue.shift()!;

    if (
      ts.isDecorator(node) &&
      ts.isCallExpression(node.expression) &&
      isNgModuleCallExpression(node.expression)
    ) {
      return node.expression.arguments[0] as ts.ObjectLiteralExpression;
    } else {
      nodeQueue.push(...node.getChildren());
    }
  }

  return null;
}

/** Whether the specified call expression is referring to a NgModule definition. */
function isNgModuleCallExpression(callExpression: ts.CallExpression): boolean {
  if (
    !callExpression.arguments.length ||
    !ts.isObjectLiteralExpression(callExpression.arguments[0])
  ) {
    return false;
  }

  // The `NgModule` call expression name is never referring to a `PrivateIdentifier`.
  const decoratorIdentifier = resolveIdentifierOfExpression(
    callExpression.expression,
  );
  return decoratorIdentifier ? decoratorIdentifier.text === "NgModule" : false;
}

/**
 * Resolves the last identifier that is part of the given expression. This helps resolving
 * identifiers of nested property access expressions (e.g. myNamespace.core.NgModule).
 */
function resolveIdentifierOfExpression(
  expression: ts.Expression,
): ts.Identifier | null {
  if (ts.isIdentifier(expression)) {
    return expression;
  } else if (
    ts.isPropertyAccessExpression(expression) &&
    ts.isIdentifier(expression.name)
  ) {
    return expression.name;
  }
  return null;
}

export function addModuleImportToRootModule(
  host: Tree,
  moduleName: string,
  src: string,
  project: ProjectDefinition,
) {
  const modulePath = getAppModulePath(host, getProjectMainFile(project));
  addModuleImportToModule(host, modulePath, moduleName, src);
}

/**
 * Import and add module to specific module path.
 * @param host the tree we are updating
 * @param modulePath src location of the module to import
 * @param moduleName name of module to import
 * @param src src location to import
 */
function addModuleImportToModule(
  host: Tree,
  modulePath: string,
  moduleName: string,
  src: string,
) {
  const moduleSource = parseSourceFile(host, modulePath);

  if (!moduleSource) {
    throw new SchematicsException(`Module not found: ${modulePath}`);
  }

  const changes = addImportToModule(moduleSource, modulePath, moduleName, src);
  const recorder = host.beginUpdate(modulePath);

  changes.forEach((change) => {
    if (change instanceof InsertChange) {
      recorder.insertLeft(change.pos, change.toAdd);
    }
  });

  host.commitUpdate(recorder);
}

function parseSourceFile(host: Tree, path: string): ts.SourceFile {
  const buffer = host.read(path);
  if (!buffer) {
    throw new SchematicsException(`Could not find file for path: ${path}`);
  }
  return ts.createSourceFile(
    path,
    buffer.toString(),
    ts.ScriptTarget.Latest,
    true,
  );
}
