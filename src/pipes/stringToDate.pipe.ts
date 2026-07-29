
import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class StringToDatePipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata) {
    const newDate=new Date(value+'T00:00:00.000Z')
    return newDate
  }
}
