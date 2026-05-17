import express from "express";
import { getIssues, getPullRequests, getRepoInfo } from "../services/githubAPI.js";

const router = express.Router();

router.get("/repo", async (req, res) => {
  const { owner, repo } = req.query;
  const data = await getRepoInfo(owner, repo);
  res.json(data);
});

router.get("/prs", async (req, res) => {
  try {
    const { owner, repo } = req.query;

    const data = await getPullRequests(owner, repo);

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Error fetching PRs" });
  }
});

router.get("/issues", async (req, res) => {
  try {
    const { owner, repo } = req.query;

    const data = await getIssues(owner, repo);

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Error fetching issues" });
  }
});

export default router;