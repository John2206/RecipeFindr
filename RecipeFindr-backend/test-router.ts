import express from 'express';
const router = express.Router();
router.post('/test', (req, res) => {
  res.json({ test: 'ok' });
});
export default router;
