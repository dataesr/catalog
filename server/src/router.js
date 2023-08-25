import express from 'express';

import githubRouter from './routes/github';
import privatemetadataRouter from './routes/privatemetadata'

const router = new express.Router();

router.use(githubRouter);
router.use(privatemetadataRouter);

export default router;
