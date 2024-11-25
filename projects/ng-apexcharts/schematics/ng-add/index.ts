import { Rule, SchematicContext, Tree } from "@angular-devkit/schematics";
import {
  NodePackageInstallTask,
  RunSchematicTask,
} from "@angular-devkit/schematics/tasks";

import { NgApexchartNgAddSchema } from "./schema";
import { addPackageToPackageJson } from "../utils";
import { apexchartsVersion } from "../version";

export default function (options: NgApexchartNgAddSchema): Rule {
  return async (_host: Tree, _context: SchematicContext) => {
    addPackageToPackageJson(_host, "apexcharts", apexchartsVersion);
    const installTaskId = _context.addTask(new NodePackageInstallTask());
    _context.addTask(new RunSchematicTask("ng-add-setup-project", options), [
      installTaskId,
    ]);
    _context.logger.log("info", '✅️ Added "ng-apexcharts"');
  };
}
