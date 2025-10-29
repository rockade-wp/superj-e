// src/routes/spjRoutes.ts
import { Router } from "express";
import { createSpjSubmission, updateSpjForm } from "../services/spjService";
import { authenticateToken, authorizeRole } from "../middleware/authMiddleware";

const router = Router();

router.post(
  "/",
  authenticateToken,
  authorizeRole("OPERATOR"),
  async (req, res) => {
    try {
      const { rupId, year, activityName } = req.body;
      const submission = await createSpjSubmission(
        rupId,
        year,
        activityName,
        req.user!.id
      );
      res.status(201).json(submission);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

// Tambahkan route ini di bawah route POST /
router.patch(
  "/:spjId/form/:formType",
  authenticateToken,
  authorizeRole("OPERATOR"),
  async (req, res) => {
    try {
      const { spjId, formType } = req.params;
      const formData = req.body; // Data form dari frontend

      await updateSpjForm(spjId, parseInt(formType), formData, req.user!.id);

      res.json({ message: "Form updated successfully" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
);

export default router;
