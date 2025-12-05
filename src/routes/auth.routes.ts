import express from 'express';

const router = express.Router({});

router.post('register', (req, res) => {
  console.log({ req, res });
});

router.post('login', (req, res) => {
  console.log({ req, res });
});

export default router;
