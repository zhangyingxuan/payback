import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
export declare class HttpExceptionFilter implements ExceptionFilter {
    private readonly httpAdapterHost;
    constructor(httpAdapterHost: HttpAdapterHost);
    catch(exception: any, host: ArgumentsHost): void;
}
