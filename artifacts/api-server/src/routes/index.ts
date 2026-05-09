import { Router, type IRouter } from "express";
import healthRouter from "./health";
import generateRouter from "./generate";
import generateWebsiteRouter from "./generate-website";
import generateChatbotRouter from "./generate-chatbot";
import generateAutomationRouter from "./generate-automation";
import authRouter from "./auth";
import projectsRouter from "./projects";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(projectsRouter);
router.use(generateRouter);
router.use(generateWebsiteRouter);
router.use(generateChatbotRouter);
router.use(generateAutomationRouter);

export default router;
