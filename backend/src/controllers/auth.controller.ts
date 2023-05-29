import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { CreateUserInput, LoginUserInput } from "schema/user.schema";
import { prisma } from "utils/prisma";
import { exclude } from "utils/exclude";

export const registerHandler = async (
  req: Request<{}, {}, CreateUserInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await prisma.user.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        createdAt: new Date(),
      },
    });

    res.status(201).json({
      status: "success",
      data: {
        user: exclude(user, ["password"]),
      },
    });
  } catch (err: any) {
    if (err.code === "P2002") {
      return res.status(409).json({
        status: "fail",
        message: "Email already exist",
      });
    }
    next(err);
  }
};

export const loginHandler = async (
  req: Request<{}, {}, LoginUserInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: req.body.email },
    });

    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid email or password",
      });
    }

    if (user.provider === "GitHub") {
      return res.status(401).json({
        status: "fail",
        message: `Use ${user.provider} OAuth2 instead`,
      });
    }

    const TOKEN_EXPIRES_IN = process.env.TOKEN_EXPIRES_IN as unknown as number;
    const TOKEN_SECRET = process.env.JWT_SECRET as unknown as string;

    const token = jwt.sign({ sub: user.id }, TOKEN_SECRET, {
      expiresIn: `${TOKEN_EXPIRES_IN}m`,
    });

    res.cookie("token", token, {
      expires: new Date(Date.now() + TOKEN_EXPIRES_IN * 60 * 1000),
    });

    res.status(200).json({
      status: "success",
    });
  } catch (err: any) {
    next(err);
  }
};

export const logoutHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.cookie("token", "", { maxAge: -1 });
    res.status(200).json({ status: "success" });
  } catch (err: any) {
    next(err);
  }
};
