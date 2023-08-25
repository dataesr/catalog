import express from 'express';
import { Octokit } from '@octokit/core';

const router = new express.Router();

router.route('/github/repos').get(async (req, res) => {
  const { page } = req.query;
  try {
    const octokitOptions = process?.env?.VITE_GIT_PAT ? { auth: process.env.VITE_GIT_PAT } : {};
    const octokit = new Octokit(octokitOptions);
    const response = await octokit.request(`GET /orgs/{org}/repos?sort=updated_at&page=${page || 1}`, {
      org: 'dataesr',
    });
    res.status(200).json(response.data);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error while fetching repos :', error);
    res.status(500).json({ error: 'Error while fetching repos' });
  }
});

router.route('/github/contributors').get(async (req, res) => {
  const { repo } = req.query;
  try {
    const octokitOptions = process?.env?.VITE_GIT_PAT ? { auth: process.env.VITE_GIT_PAT } : {};
    const octokit = new Octokit(octokitOptions);
    const response = await octokit.request(`GET /repos/{org}/{repo}/contributors`, {
      org: 'dataesr',
      repo,
    });
    res.status(200).json(response.data);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error while fetching contributors', error);
    res.status(500).json({ error: 'Error while fetching contributors' });
  }
});

export default router;
