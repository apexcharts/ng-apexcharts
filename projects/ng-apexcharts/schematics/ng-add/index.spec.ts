import 'jasmine';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { Schema as ApplicationOptions, Style } from '@schematics/angular/application/schema';
import { Schema as WorkspaceOtions } from '@schematics/angular/workspace/schema';
import * as path from 'path';

describe('ng add ngx-apexcharts', () => {
  const collectionPath = path.join(__dirname, '../collection.json');
  const runner = new SchematicTestRunner('schematics', collectionPath);
  const workspaceOptions: WorkspaceOtions = {
    name: 'workspace',
    newProjectRoot: 'projects',
    version: '1.0.0',
  };
  const appOptions: ApplicationOptions = {
    name: 'ng-apexcharts-app',
    inlineStyle: false,
    inlineTemplate: false,
    routing: false,
    style: Style.Scss,
    skipTests: false,
    skipPackageJson: false,
  };

  let appTree: UnitTestTree | undefined;

  beforeAll(async () => {
    appTree = await runner.runExternalSchematic('@schematics/angular', 'workspace', workspaceOptions);
    appTree = await runner.runExternalSchematic('@schematics/angular', 'application', appOptions, appTree);
  });

  it('add NgApexchartsModule in angular project', async () => {
    const options = { project: 'ng-apexcharts-app' };
    const tree = await runner.runSchematic('ng-add', options, appTree);
    const appmodule = tree.readContent('/projects/ng-apexcharts-app/src/app/app.module.ts');
    expect(appmodule).toMatch(/import.*NgApexchartsModule.*from 'ng-apexcharts'/);
    expect(appmodule).toMatch(/imports:\s*\[[^\]]+?,\r?\n\s+NgApexchartsModule\r?\n/m)
    let packageJson = tree.readJson('package.json') as { dependencies: { apexcharts: string } };
    if (typeof packageJson === 'string') {
      packageJson = JSON.parse(packageJson);
    }
    expect(packageJson.dependencies?.apexcharts).toBe('~3.41.0');
    const angularJson = JSON.parse(tree.readContent('angular.json'));
    expect(angularJson.projects[options.project].architect.build.options.scripts)
      .toEqual(jasmine.arrayContaining(['/node_modules/apexcharts/dist/apexcharts.min.js']));
    expect(angularJson.projects[options.project].architect.test.options.scripts)
      .toEqual(jasmine.arrayContaining(['/node_modules/apexcharts/dist/apexcharts.min.js']));

  });
});

