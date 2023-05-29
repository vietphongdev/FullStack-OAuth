import express from "express";
import { getMeHandler } from "controllers/user.controller";
import { deserializeUser, requireUser } from "middleware";

const router = express.Router();

router.use(deserializeUser, requireUser);

router.get("/me", getMeHandler);

export default router;
