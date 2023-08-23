import express from 'express';

import Router from './routes/routes';

const router = new express.Router();

router.use(Router);

export default router;
