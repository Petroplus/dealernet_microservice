import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException } from '@nestjs/common';
import { unwind, flatten } from '@json2csv/transforms';
import { Parser } from '@json2csv/plainjs';
import { Observable, map } from 'rxjs';

const parseAsyncCSV = (data: any) => {
  try {
    const parser = new Parser({ delimiter: ';', transforms: [unwind(), flatten()] });
    return parser.parse(data);
  } catch (error) {
    throw new BadRequestException(error.message);
  }
};

const parseAsyncBinary = (data: any): string => {
  try {
    const str = JSON.stringify(data);

    // eslint-disable-next-line prettier/prettier
    const binaryResult = str?.split('')?.map((char) => char.charCodeAt(0).toString(2).padStart(8, '0'))?.join('');

    return binaryResult;
  } catch (error) {
    throw new BadRequestException(error.message);
  }
};

@Injectable()
export class InjectTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> | Promise<Observable<any>> {
    // get content-type
    const accept = context.switchToHttp().getRequest().headers.accept;
    switch (accept) {
      case 'text/csv':
        return next.handle().pipe(map((data) => parseAsyncCSV(data)));
      case 'application/octet-stream':
        return next.handle().pipe(map((data) => parseAsyncBinary(data)));
      default:
        return next.handle().pipe(map((data) => data));
    }
  }
}
