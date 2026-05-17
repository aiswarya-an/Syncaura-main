import axios from "axios";

export const getRepoInfo = async (owner, repo) => {
  // 1. Repo info
  const repoUrl = `https://api.github.com/repos/${owner}/${repo}`;
  
  // 2. Branches API
  const branchesUrl = `https://api.github.com/repos/${owner}/${repo}/branches`;

  const [repoRes, branchesRes] = await Promise.all([
    axios.get(repoUrl),
    axios.get(branchesUrl)
  ]);

  const repoData = repoRes.data;
  const branchesData = branchesRes.data;

  return {
    name: repoData.name,
    description: repoData.description,
    default_branch: repoData.default_branch,
    branches: branchesData.map(branch => branch.name)
  };
};

export const getPullRequests = async (owner, repo) => {
  const url = `https://api.github.com/repos/${owner}/${repo}/pulls`;

  const response = await axios.get(url);

  // Filter required data
  return response.data.map((pr) => ({
    id: pr.id,
    title: pr.title,
    state: pr.state,
    author: pr.user?.login,
    created_at: pr.created_at
  }));
};

export const getIssues = async (owner, repo) => {
  const url = `https://api.github.com/repos/${owner}/${repo}/issues`;

  const response = await axios.get(url);

  return response.data.map((issue) => ({
    id: issue.id,
    title: issue.title,
    state: issue.state,
    labels: issue.labels.map((label) => label.name),
    assignee: issue.assignee?.login || null
  }));
};