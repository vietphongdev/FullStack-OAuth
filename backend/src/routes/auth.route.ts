import express from "express";
import {
  loginHandler,
  logoutHandler,
  registerHandler,
} from "controllers/auth.controller";

import { createUserSchema, loginUserSchema } from "schema/user.schema";
import { deserializeUser, requireUser, validate } from "middleware";
import { githubOauthHandler } from "controllers/github.oauth.controller";
import { googleOauthHandler } from "controllers/google.oauth.controller";

const router = express.Router();

// Register user route
router.post("/register", validate(createUserSchema), registerHandler);

// Login user route
router.post("/login", validate(loginUserSchema), loginHandler);

// Login with Google
router.get("/oauth/google", googleOauthHandler);

// Login with Github
router.get("/oauth/github", githubOauthHandler);

// Logout User
router.get("/logout", deserializeUser, requireUser, logoutHandler);

export default router;
