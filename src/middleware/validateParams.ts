import { Request, Response, NextFunction } from "express";

export const requireParams = (params: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    for (const param of params) {
      if (!req.params[param] && !req.query[param]) {
        res.status(400).json({ error: `${param} is required` });
        return;
      }
    }
    next();
  };
};
