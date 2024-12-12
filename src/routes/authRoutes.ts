import express from 'express';
import { AuthController } from '../controllers/authController';

const router = express.Router();

// Authentication callback from external site
router.get('/callback', AuthController.handleAuthCallback);

// Refresh access token
router.post('/refresh-token', AuthController.refreshAccessToken);

export default router;
