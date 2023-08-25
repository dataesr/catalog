import express from 'express';

const router = new express.Router();

router.route('/privatemetadata').get(async (req, res) => {
  try {
    if (process?.env?.VITE_PRIVATE_METADATA_URL) {
      const response = await fetch(process.env.VITE_PRIVATE_METADATA_URL);
      const privateMetadata = await response.json();
      res.status(200).json(privateMetadata);
    } else {
      res.status(200).json({});
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error while fetching privateMetadata :', error);
    res.status(500).json({ error: 'Error while fetching privateMetadata' });
  }
});

export default router;
