import { NextFunction, Request, Response } from 'express';
import { NestMiddleware } from '@nestjs/common';
export declare class HttpRequestMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction): void;
}
