import { CookieOptions } from 'express';
import { Response, Request } from 'express';

type Cookies = {
  getOptions: () => CookieOptions;
  set: (
    res: Response,
    name: string,
    value: string,
    options: CookieOptions
  ) => void;
  clear: (res: Response, name: string, options: CookieOptions) => void;
  get: (req: Request, name: string) => string;
};

/**
 * Returns cookie methods: (get, set, clear)
 */
export const cookies: Cookies = {
  getOptions: () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, //15 minutes
  }),
  set: (res: Response, name: string, value: string, options: CookieOptions) => {
    res.cookie(name, value, { ...cookies.getOptions(), ...options });
  },
  clear: (res: Response, name: string, options: CookieOptions) => {
    res.clearCookie(name, { ...cookies.getOptions(), ...options });
  },
  get: (req: Request, name: string) => {
    return req.cookies[name];
  },
};
