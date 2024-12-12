const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const BackupService = require('../persistence/BackupService');
const DataExportService = require('../persistence/DataExportService');
const ChangeHistoryService = require('../persistence/ChangeHistoryService');
const DataVersionService = require('../persistence/DataVersionService');

const prisma = new PrismaClient();

class BackupScheduler {
    constructor() {
        this.schedules = [];
    }

    start() {
        // Daily full backup at 2 AM
        this.schedules.push(
            cron.schedule('0 2 * * *', async () => {
                console.log('Starting daily full backup...');
                try {
                    const users = await prisma.user.findMany();
                    for (const user of users) {
                        await BackupService.createBackup(user.id, 'FULL');
                    }
                    console.log('Daily full backup completed');
                } catch (error) {
                    console.error('Daily backup error:', error);
                }
            })
        );

        // Weekly cleanup at 3 AM on Sundays
        this.schedules.push(
            cron.schedule('0 3 * * 0', async () => {
                console.log('Starting weekly cleanup...');
                try {
                    await Promise.all([
                        BackupService.cleanupOldBackups(),
                        DataExportService.cleanupExpiredExports(),
                        ChangeHistoryService.cleanupOldChanges(),
                        DataVersionService.pruneOldVersions(),
                    ]);
                    console.log('Weekly cleanup completed');
                } catch (error) {
                    console.error('Weekly cleanup error:', error);
                }
            })
        );

        // Hourly settings backup
        this.schedules.push(
            cron.schedule('0 * * * *', async () => {
                console.log('Starting hourly settings backup...');
                try {
                    const users = await prisma.user.findMany({
                        where: {
                            preferences: {
                                isNot: null,
                            },
                        },
                    });
                    for (const user of users) {
                        await BackupService.createBackup(user.id, 'SETTINGS');
                    }
                    console.log('Hourly settings backup completed');
                } catch (error) {
                    console.error('Hourly settings backup error:', error);
                }
            })
        );

        // Daily activity log export at 1 AM
        this.schedules.push(
            cron.schedule('0 1 * * *', async () => {
                console.log('Starting daily activity log export...');
                try {
                    const users = await prisma.user.findMany({
                        where: {
                            role: 'ADMIN',
                        },
                    });
                    for (const user of users) {
                        await DataExportService.requestExport(user.id, 'ACTIVITY_LOG', 'json');
                    }
                    console.log('Daily activity log export completed');
                } catch (error) {
                    console.error('Daily activity log export error:', error);
                }
            })
        );
    }

    stop() {
        this.schedules.forEach(schedule => schedule.stop());
        this.schedules = [];
    }
}

module.exports = new BackupScheduler();
