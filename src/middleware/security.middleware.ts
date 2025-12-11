import {arcJet as aj} from '#config/arcJet.js';
import {logger} from '#config/logger.js';
import { User } from '#controllers/auth.controller.js';
import { slidingWindow } from '@arcjet/node';
import { Request, Response, NextFunction } from 'express';

interface PostAuthReq extends Request {
    user: User
}

const securityMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const role = (req as PostAuthReq).user?.role || 'guest';

    let limit;

    switch (role) {
      case 'admin':
        limit = 20;
        break;
      case 'user':
        limit = 10;
        break;
      case 'guest':
        limit = 5;
        break;
    }

    const client = aj.withRule(
      slidingWindow({
        mode: 'LIVE',
        interval: '1m',
        max: limit ?? 0,
      })
    );

    const decision = await client.protect(req, {requested: 0});

    // if (decision.isDenied() && decision.reason.isBot()) {
    //   logger.warn('Bot request blocked', {
    //     ip: req.ip,
    //     userAgent: req.get('User-Agent'),
    //     path: req.path,
    //   });

    //   return res
    //     .status(403)
    //     .json({
    //       error: 'Forbidden',
    //       message: 'Automated requests are not allowed',
    //     });
    // }

    if (decision.isDenied() && decision.reason.isShield()) {
      logger.warn('Shield Blocked request', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method,
      });

      return res
        .status(403)
        .json({
          error: 'Forbidden',
          message: 'Request blocked by security policy',
        });
    }

    if (decision.isDenied() && decision.reason.isRateLimit()) {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
      });

      return res
        .status(403)
        .json({ error: 'Forbidden', message: 'Too many requests' });
    }

    next();
  } catch (e) {
    console.error('Arcjet middleware error:', e);
    res
      .status(500)
      .json({
        errro: 'Internal server error',
        message: 'Something went wrong with security middleware',
      });
  }
};
export default securityMiddleware;