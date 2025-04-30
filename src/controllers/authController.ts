import { Request, Response } from "express";
import User, { IUser } from "../models/User";
import jwt from "jsonwebtoken";
import { sendSuccess, sendError } from "../utils/apiResponse";

export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      sendError(res, null, "User already exists", 400);
      return;
    }

    const user: IUser = new User({ username, email, password });
    await user.save();

    const token = jwt.sign(
      { id: user._id.toString() },
      process.env.JWT_SECRET!,
      { expiresIn: "30d" }
    );

    sendSuccess(res, { token }, 201);
  } catch (error) {
    sendError(res, error, "Failed to register user");
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user: IUser | null = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      sendError(res, null, "Invalid credentials", 400);
      return;
    }

    const token = jwt.sign(
      { id: user._id.toString() },
      process.env.JWT_SECRET!,
      { expiresIn: "30d" }
    );

    sendSuccess(res, { token });
  } catch (error) {
    sendError(res, error, "Failed to login");
  }
};
