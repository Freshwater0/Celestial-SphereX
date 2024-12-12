const jwt = require('jsonwebtoken');
const SessionService = require('../services/session/SessionService');
const UserActivityService = require('../services/user/UserActivityService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const authenticate = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'No authentication token, authorization denied' });
        }

        // Validate session
        const session = await SessionService.validateSession(token);
        
        if (!session) {
            return res.status(401).json({ message: 'Invalid or expired session' });
        }

        // Check if user account is locked
        const user = await prisma.user.findUnique({
            where: { id: session.userId }
        });

        if (user.accountLocked) {
            if (user.lockExpiresAt && new Date() < user.lockExpiresAt) {
                return res.status(403).json({ 
                    message: 'Account is temporarily locked. Please try again later.' 
                });
            } else {
                // Unlock account if lock period has expired
                await prisma.user.update({
                    where: { id: user.id },
                    data: { 
                        accountLocked: false,
                        lockExpiresAt: null,
                        failedLoginAttempts: 0
                    }
                });
            }
        }

        // Log activity
        await UserActivityService.logActivity(
            session.userId,
            'API_ACCESS',
            `Accessed ${req.method} ${req.path}`,
            null,
            req.ip,
            req.get('user-agent')
        );

        // Add user and session to request
        req.user = user;
        req.session = session;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({ message: 'Authentication failed' });
    }
};

const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied: insufficient permissions' });
        }

        next();
    };
};

const requireVerified = async (req, res, next) => {
    if (!req.user.isVerified) {
        return res.status(403).json({ 
            message: 'Please verify your email address to access this resource' 
        });
    }
    next();
};

const requireActiveSubscription = async (req, res, next) => {
    try {
        const subscription = await prisma.subscription.findUnique({
            where: { userId: req.user.id }
        });

        if (!subscription || subscription.status !== 'ACTIVE') {
            return res.status(403).json({ 
                message: 'Active subscription required to access this resource' 
            });
        }
        next();
    } catch (error) {
        console.error('Subscription check error:', error);
        res.status(500).json({ message: 'Error checking subscription status' });
    }
};

module.exports = {
    authenticate,
    requireRole,
    requireVerified,
    requireActiveSubscription
};
