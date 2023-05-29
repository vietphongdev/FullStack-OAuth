import { Request, Response } from "express";
import { getGithubOathToken, getGithubUser } from "services/session.service";
import { prisma } from "utils/prisma";
import jwt from "jsonwebtoken";

export const githubOauthHandler = async (req: Request, res: Response) => {
  const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN as unknown as string;

  if (req.query.error) {
    return res.redirect(`${FRONTEND_ORIGIN}/login`);
  }

  const code = req.query.code as string;
  const pathUrl = (req.query.state as string) ?? "/";

  if (!code) {
    return res.status(401).json({
      status: "error",
      message: "Authorization code not provided!",
    });
  }

  try {
    const { access_token } = await getGithubOathToken({ code });

    const { email, avatar_url, login } = await getGithubUser({ access_token });

    const user = await prisma.user.upsert({
      where: { email },
      create: {
        createdAt: new Date(),
        name: login,
        email,
        photo: avatar_url,
        password: "",
        verified: true,
        provider: "GitHub",
      },
      update: { name: login, email, photo: avatar_url, provider: "GitHub" },
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
    return res.redirect(`${FRONTEND_ORIGIN}/oauth/error`);
  }
};
