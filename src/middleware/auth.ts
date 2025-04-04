import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";

export interface AuthRequest
  extends Request<Record<string, any>, any, any, any> {
  user?: IUser;
}

const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: string;
      };

      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        res.status(401).json({ message: "User not found" });
        return;
      }

      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

export default protect;
