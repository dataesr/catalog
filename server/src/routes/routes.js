import express from 'express';
import { Octokit } from '@octokit/core';
// eslint-disable-next-line import/no-extraneous-dependencies
import fetch from 'node-fetch';

const router = new express.Router();

router.route('/github/repos').get(async (req, res) => {
  const { page } = req.query;
  const octokitOptions = {
    request: { fetch },
  };

  if (process.env.VITE_GIT_PAT) {
    octokitOptions.auth = process.env.VITE_GIT_PAT;
  }
  const octokit = new Octokit(octokitOptions);
  try {
    const response = await octokit.request(`GET /orgs/{org}/repos?sort=updated_at&page=${page || 1}`, {
      org: 'dataesr',
    });
    const repositories = response.data;

    res.json(repositories);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error while fetching repos :', error);
    res.status(500).json({ error: 'Error while fetching repos' });
  }
});

router.route('/github/contributors').get(async (req, res) => {
  const { repo } = req.query;
  const octokitOptions = {
    request: { fetch },
  };

  if (process.env.VITE_GIT_PAT) {
    octokitOptions.auth = process.env.VITE_GIT_PAT;
  }

  const octokit = new Octokit(octokitOptions);

  try {
    const response = await octokit.request(`GET /repos/{org}/{repo}/contributors`, {
      org: 'dataesr',
      repo,
    });
    const contributors = response.data;
    res.json(contributors);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error while fetching contributors', error);
    res.status(500).json({ error: 'Error while fetching contributors' });
  }
});

export default router;
