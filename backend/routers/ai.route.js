import { Router } from "express";
import * as aiController from "../controllers/ai.controller.js";

const router = Router();

router.post("/generate", aiController.generateContentController);

export default router;