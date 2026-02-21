import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      const time = new Date().toISOString();

      console.log(
        `[${time}] ${method} ${originalUrl} → ${res.statusCode} (${duration}ms)`,
      );
    });

    next();
  }
}
