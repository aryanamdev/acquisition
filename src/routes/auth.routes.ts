import {
  login,
  logout,
  refreshAccessToken,
  register,
  verifyEmail,
} from '#controllers/auth.controller.js';
import express from 'express';

const router = express.Router({});

router.post('/register', register);
router.get('/verify-email', verifyEmail);
router.post('/login', login);
router.post('/refresh-token', refreshAccessToken);
router.post('/logout', logout);

export default router;
