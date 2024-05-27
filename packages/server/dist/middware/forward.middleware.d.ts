import { NestMiddleware } from '@nestjs/common';
import { Request } from 'express';
export declare class ForwardedForMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: () => void): void;
}
