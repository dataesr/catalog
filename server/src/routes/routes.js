import express from 'express';
import { Octokit } from '@octokit/core';
// eslint-disable-next-line import/no-extraneous-dependencies
import fetch from 'node-fetch';

const router = new express.Router();

router.route('/github').get(async (req, res) => {
  const { page } = req.query;
  const octokitOptions = {
    request: { fetch },
  };

  if (process.env.VITE_GIT_PAT) {
    octokitOptions.auth = process.env.VITE_GIT_PAT;
  }

  const octokit = new Octokit(octokitOptions);

  try {
    let repositories;
    if (process.env.VITE_GIT_PAT) {
      repositories = await octokit.request(`GET /orgs/{org}/repos?sort=updated_at&page=${page}`, {
        org: 'dataesr',
        page: page || 1,
      });
    } else {
      repositories = await octokit.request(`GET /orgs/{org}/repos?sort=updated_at&page=${page}&type=public`, {
        org: 'dataesr',
        page: page || 1,
      });
    }

    const tools = repositories.data.map((item) => ({ name: item.name,
      description: item.description,
      private: item.private,
      language: item.language }));
    res.json({ tools });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Erreur lors de la récupération des dépôts GitHub :', error);
    res.status(500).json({ error: 'Une erreur s\'est produite lors de la récupération des données depuis GitHub.' });
  }
});

export default router;
