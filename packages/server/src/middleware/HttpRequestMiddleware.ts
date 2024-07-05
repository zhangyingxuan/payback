/**
 * 自定义请求信息日志记录中间件
 */
import { NextFunction, Request, Response } from 'express';
import { NestMiddleware } from '@nestjs/common';

export class HttpRequestMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    next();

    // 组装日志信息
    // const logFormat = {
    //   httpType: 'Request',
    //   ip: req.ip.split(':').pop(),
    //   reqUrl: `${req.headers.host}${req.originalUrl}`,
    //   reqMethod: req.method,
    //   httpCode: res.statusCode,
    //   params: req.params,
    //   query: req.query,
    //   body: req.body,
    // };

    console.log(JSON.stringify(req.headers));
  }
}
