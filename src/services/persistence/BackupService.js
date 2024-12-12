const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

class BackupService {
    async createBackup(userId, backupType) {
        try {
            // Start backup process
            const backup = await prisma.dataBackup.create({
                data: {
                    userId,
                    backupType,
                    status: 'PENDING',
                    data: {},
                    checksum: '',
                    size: 0,
                },
            });

            // Update status to in progress
            await this.updateBackupStatus(backup.id, 'IN_PROGRESS');

            // Collect data based on backup type
            const data = await this.collectBackupData(userId, backupType);

            // Calculate checksum and size
            const checksum = this.calculateChecksum(data);
            const size = Buffer.byteLength(JSON.stringify(data));

            // Update backup with collected data
            const updatedBackup = await prisma.dataBackup.update({
                where: { id: backup.id },
                data: {
                    data,
                    checksum,
                    size,
                    status: 'COMPLETED',
                    completedAt: new Date(),
                },
            });

            return updatedBackup;
        } catch (error) {
            console.error('Backup creation error:', error);
            if (backup?.id) {
                await this.updateBackupStatus(backup.id, 'FAILED');
            }
            throw error;
        }
    }

    async collectBackupData(userId, backupType) {
        const data = {};

        try {
            switch (backupType) {
                case 'FULL':
                    // Collect all user-related data
                    data.user = await prisma.user.findUnique({
                        where: { id: userId },
                        include: {
                            preferences: true,
                            activities: true,
                            sessions: true,
                        },
                    });
                    break;

                case 'SETTINGS':
                    // Collect only user preferences
                    data.preferences = await prisma.userPreference.findUnique({
                        where: { userId },
                    });
                    break;

                case 'REPORTS':
                    // Collect user's reports and related data
                    data.activities = await prisma.userActivity.findMany({
                        where: { userId },
                    });
                    break;

                default:
                    throw new Error(`Unsupported backup type: ${backupType}`);
            }

            return data;
        } catch (error) {
            console.error('Data collection error:', error);
            throw error;
        }
    }

    calculateChecksum(data) {
        return crypto
            .createHash('sha256')
            .update(JSON.stringify(data))
            .digest('hex');
    }

    async updateBackupStatus(backupId, status) {
        try {
            await prisma.dataBackup.update({
                where: { id: backupId },
                data: { status },
            });
        } catch (error) {
            console.error('Backup status update error:', error);
            throw error;
        }
    }

    async restoreFromBackup(backupId) {
        try {
            const backup = await prisma.dataBackup.findUnique({
                where: { id: backupId },
            });

            if (!backup) {
                throw new Error('Backup not found');
            }

            // Verify checksum
            const currentChecksum = this.calculateChecksum(backup.data);
            if (currentChecksum !== backup.checksum) {
                throw new Error('Backup data integrity check failed');
            }

            // Restore data based on backup type
            switch (backup.backupType) {
                case 'FULL':
                    await this.restoreFullBackup(backup.data);
                    break;
                case 'SETTINGS':
                    await this.restoreSettings(backup.data);
                    break;
                case 'REPORTS':
                    await this.restoreReports(backup.data);
                    break;
            }

            return true;
        } catch (error) {
            console.error('Backup restore error:', error);
            throw error;
        }
    }

    async restoreFullBackup(data) {
        const { user } = data;
        await prisma.user.update({
            where: { id: user.id },
            data: {
                ...user,
                preferences: {
                    upsert: {
                        create: user.preferences,
                        update: user.preferences,
                    },
                },
            },
        });
    }

    async restoreSettings(data) {
        const { preferences } = data;
        await prisma.userPreference.upsert({
            where: { userId: preferences.userId },
            create: preferences,
            update: preferences,
        });
    }

    async restoreReports(data) {
        const { activities } = data;
        // Restore activities one by one to maintain integrity
        for (const activity of activities) {
            await prisma.userActivity.create({
                data: activity,
            });
        }
    }

    async cleanupOldBackups(userId, keepCount = 5) {
        try {
            const backups = await prisma.dataBackup.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                skip: keepCount,
            });

            if (backups.length > 0) {
                await prisma.dataBackup.deleteMany({
                    where: {
                        id: {
                            in: backups.map(b => b.id),
                        },
                    },
                });
            }
        } catch (error) {
            console.error('Backup cleanup error:', error);
            throw error;
        }
    }
}

module.exports = new BackupService();
