import express from "express";
import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
} from "../controllers/projectController.js";
import { auth } from "../middlewares/auth.js";

const router = express.Router();

// Protected routes
router.post("/", auth, createProject);
router.get("/", auth, getAllProjects);
router.get("/:id", auth, getProjectById);
router.put("/:id", auth, updateProject);
router.delete("/:id", auth, deleteProject);

export default router;
