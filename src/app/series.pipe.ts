import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "series",
  standalone: true,
})
export class SeriesPipe implements PipeTransform {
  transform(value: any, args: any): any {
    return value.map((c) => ({ name: c.name, data: c.data }));
  }
}
