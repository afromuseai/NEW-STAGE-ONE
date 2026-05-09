import { Router } from "express";
import { db, projectsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { z } from "zod";

const router = Router();

const CreateProjectBody = z.object({
  title: z.string().min(1),
  businessIdea: z.string().min(1),
  output: z.record(z.unknown()).optional().nullable(),
  websiteOutput: z.record(z.unknown()).optional().nullable(),
});

const UpdateProjectBody = z.object({
  title: z.string().min(1).optional(),
  output: z.record(z.unknown()).optional().nullable(),
  websiteOutput: z.record(z.unknown()).optional().nullable(),
});

router.get("/projects", requireAuth, async (req, res): Promise<void> => {
  const userId = req.user!.userId;
  const projects = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.userId, userId))
    .orderBy(desc(projectsTable.updatedAt));
  res.json({ projects });
});

router.post("/projects", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
    return;
  }
  const userId = req.user!.userId;
  const [project] = await db.insert(projectsTable).values({
    userId,
    title: parsed.data.title,
    businessIdea: parsed.data.businessIdea,
    output: parsed.data.output ?? null,
    websiteOutput: parsed.data.websiteOutput ?? null,
  }).returning();
  res.status(201).json({ project });
});

router.get("/projects/:id", requireAuth, async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const userId = req.user!.userId;
  const [project] = await db
    .select()
    .from(projectsTable)
    .where(and(eq(projectsTable.id, id), eq(projectsTable.userId, userId)));
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.json({ project });
});

router.patch("/projects/:id", requireAuth, async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const userId = req.user!.userId;
  const parsed = UpdateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "Invalid input" });
    return;
  }
  const updates: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) updates.title = parsed.data.title;
  if (parsed.data.output !== undefined) updates.output = parsed.data.output;
  if (parsed.data.websiteOutput !== undefined) updates.websiteOutput = parsed.data.websiteOutput;
  const [project] = await db
    .update(projectsTable)
    .set(updates)
    .where(and(eq(projectsTable.id, id), eq(projectsTable.userId, userId)))
    .returning();
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.json({ project });
});

router.delete("/projects/:id", requireAuth, async (req, res): Promise<void> => {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const userId = req.user!.userId;
  const [deleted] = await db
    .delete(projectsTable)
    .where(and(eq(projectsTable.id, id), eq(projectsTable.userId, userId)))
    .returning();
  if (!deleted) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
