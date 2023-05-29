import { Request, Response } from "express";
import { getGoogleOauthToken, getGoogleUser } from "services/session.service";
import { prisma } from "utils/prisma";
import jwt from "jsonwebtoken";

export const googleOauthHandler = async (req: Request, res: Response) => {
  const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN as unknown as string;

  const code = req.query.code as string;
  const pathUrl = (req.query.state as string) || "/";

  if (!code) {
    return res.status(401).json({
      status: "fail",
      message: "Authorization code not provided!",
    });
  }

  try {
    const { id_token, access_token } = await getGoogleOauthToken({ code });

    const { name, verified_email, email, picture } = await getGoogleUser({
      id_token,
      access_token,
    });

    if (!verified_email) {
      return res.status(403).json({
        status: "fail",
        message: "Google account not verified",
      });
    }

    const user = await prisma.user.upsert({
      where: { email },
      create: {
        createdAt: new Date(),
        name,
        email,
        photo: picture,
        password: "",
        verified: true,
        provider: "Google",
      },
      update: { name, email, photo: picture, provider: "Google" },
    });

    if (!user) return res.redirect(`${FRONTEND_ORIGIN}/oauth/error`);

    const TOKEN_EXPIRES_IN = process.env.TOKEN_EXPIRES_IN as unknown as number;
    const TOKEN_SECRET = process.env.JWT_SECRET as unknown as string;
    const token = jwt.sign({ sub: user.id }, TOKEN_SECRET, {
      expiresIn: `${TOKEN_EXPIRES_IN}m`,
    });

    res.cookie("token", token, {
      expires: new Date(Date.now() + TOKEN_EXPIRES_IN * 60 * 1000),
    });

    res.redirect(`${FRONTEND_ORIGIN}${pathUrl}`);
  } catch (err: any) {
    console.log("Failed to authorize Google User", err);
    return res.redirect(`${FRONTEND_ORIGIN}/oauth/error`);
  }
};
