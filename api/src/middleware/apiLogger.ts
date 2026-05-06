import { Request, Response, NextFunction } from 'express';
import ApiLog from '../models/ApiLog';

/**
 * Middleware that logs every API request to the database.
 * Captures origin, IP, method, path, status code, response time, etc.
 */
const apiLogger = (req: Request, res: Response, next: NextFunction): void => {
  // Skip logging for health check to reduce noise
  if (req.path === '/api/health') {
    next();
    return;
  }

  const start = Date.now();

  // Capture the original end to intercept the status code
  const originalEnd = res.end;

  res.end = function (this: Response, ...args: any[]): Response {
    const responseTime = Date.now() - start;
    const statusCode = res.statusCode;

    // Determine if the request came from internal (port 5001 / same origin) or external
    const origin = req.headers.origin || '';
    const referer = req.headers.referer || '';
    const host = req.headers.host || '';
    const userAgent = req.headers['user-agent'] || '';

    // Internal sources: same host, localhost, or no origin (server-to-server)
    let source: 'internal' | 'external' = 'external';

    if (!origin && !referer) {
      // No origin/referer typically means server-to-server or direct API calls
      // Check if it's from localhost or same host
      const ip = req.ip || req.socket.remoteAddress || '';
      if (ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1') {
        source = 'internal';
      }
    } else {
      const originHost = origin ? new URL(origin).hostname : '';
      const refererHost = referer ? new URL(referer).hostname : '';
      const requestHost = host.split(':')[0]; // strip port

      if (
        originHost === requestHost ||
        originHost === 'localhost' ||
        originHost === '127.0.0.1' ||
        refererHost === requestHost ||
        refererHost === 'localhost' ||
        refererHost === '127.0.0.1'
      ) {
        source = 'internal';
      }
    }

    // Fire-and-forget: log to DB asynchronously (don't await to avoid slowing response)
    ApiLog.create({
      method: req.method,
      path: req.path,
      fullUrl: req.originalUrl,
      statusCode,
      ipAddress: req.ip || req.socket.remoteAddress || 'unknown',
      origin,
      referer,
      userAgent,
      source,
      responseTime,
    }).catch((err) => {
      console.error('Failed to log API request:', err.message);
    });

    return originalEnd.apply(this, args as any);
  } as typeof res.end;

  next();
};

export default apiLogger;
