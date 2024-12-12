import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { generateAccessToken, generateRefreshToken } from '../utils/tokenUtils';

export class AuthController {
  static async handleAuthCallback(req: Request, res: Response) {
    try {
      const { token } = req.query;

      if (!token || typeof token !== 'string') {
        return res.status(400).json({ error: 'Invalid token' });
      }

      // Verify the JWT token from the SITE
      const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
      let decoded: any;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (verifyError) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      // Find user by email
      const user = await User.findOne({ 
        where: { email: decoded.email },
        attributes: { 
          exclude: ['password'] // Never return password
        }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Generate new access and refresh tokens
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      // Update user's refresh token in database
      await User.update(
        { refreshToken },
        { where: { id: user.id } }
      );

      // Redirect to frontend with tokens
      // Use a secure, HttpOnly cookie for refresh token
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Redirect to user's account page with access token
      const redirectUrl = new URL('/account', process.env.FRONTEND_URL);
      redirectUrl.searchParams.append('token', accessToken);
      redirectUrl.searchParams.append('userId', user.id.toString());

      res.redirect(redirectUrl.toString());
    } catch (error) {
      console.error('Auth callback error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async refreshAccessToken(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token' });
    }

    try {
      // Verify refresh token
      const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
      const decoded: any = jwt.verify(refreshToken, JWT_SECRET);

      // Find user with this refresh token
      const user = await User.findOne({ 
        where: { 
          id: decoded.id, 
          refreshToken 
        }
      });

      if (!user) {
        return res.status(403).json({ error: 'Invalid refresh token' });
      }

      // Generate new access token
      const newAccessToken = generateAccessToken(user);

      res.json({ token: newAccessToken });
    } catch (error) {
      res.status(403).json({ error: 'Invalid refresh token' });
    }
  }
}
