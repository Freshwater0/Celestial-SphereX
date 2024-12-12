const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

class DataIntegrityService {
    async verifyDataIntegrity(options = {}) {
        const {
            checkRelations = true,
            verifyBackups = true,
            validateExports = true,
        } = options;

        const issues = [];

        try {
            // Check for orphaned records
            if (checkRelations) {
                const orphanedIssues = await this.checkOrphanedRecords();
                issues.push(...orphanedIssues);
            }

            // Verify backup integrity
            if (verifyBackups) {
                const backupIssues = await this.verifyBackups();
                issues.push(...backupIssues);
            }

            // Validate exports
            if (validateExports) {
                const exportIssues = await this.validateExports();
                issues.push(...exportIssues);
            }

            // Check for data inconsistencies
            const consistencyIssues = await this.checkDataConsistency();
            issues.push(...consistencyIssues);

            return {
                hasIssues: issues.length > 0,
                issues,
                checkedAt: new Date(),
            };
        } catch (error) {
            console.error('Data integrity check error:', error);
            throw error;
        }
    }

    async checkOrphanedRecords() {
        const issues = [];

        try {
            // Check for orphaned preferences
            const orphanedPreferences = await prisma.userPreference.findMany({
                where: {
                    user: null,
                },
            });
            
            if (orphanedPreferences.length > 0) {
                issues.push({
                    type: 'ORPHANED_RECORDS',
                    entity: 'UserPreference',
                    count: orphanedPreferences.length,
                    ids: orphanedPreferences.map(p => p.id),
                });
            }

            // Check for orphaned sessions
            const orphanedSessions = await prisma.session.findMany({
                where: {
                    user: null,
                },
            });

            if (orphanedSessions.length > 0) {
                issues.push({
                    type: 'ORPHANED_RECORDS',
                    entity: 'Session',
                    count: orphanedSessions.length,
                    ids: orphanedSessions.map(s => s.id),
                });
            }

            // Add more orphaned record checks as needed

            return issues;
        } catch (error) {
            console.error('Orphaned record check error:', error);
            throw error;
        }
    }

    async verifyBackups() {
        const issues = [];

        try {
            const backups = await prisma.dataBackup.findMany({
                where: {
                    status: 'COMPLETED',
                },
            });

            for (const backup of backups) {
                // Verify checksum
                const calculatedChecksum = crypto
                    .createHash('sha256')
                    .update(JSON.stringify(backup.data))
                    .digest('hex');

                if (calculatedChecksum !== backup.checksum) {
                    issues.push({
                        type: 'BACKUP_INTEGRITY',
                        entity: 'DataBackup',
                        id: backup.id,
                        issue: 'Checksum mismatch',
                    });
                }
            }

            return issues;
        } catch (error) {
            console.error('Backup verification error:', error);
            throw error;
        }
    }

    async validateExports() {
        const issues = [];

        try {
            const exports = await prisma.dataExport.findMany({
                where: {
                    status: 'COMPLETED',
                },
            });

            for (const export_ of exports) {
                // Check if download URL is still valid
                if (export_.downloadUrl && export_.expiresAt) {
                    if (new Date() > export_.expiresAt) {
                        issues.push({
                            type: 'EXPIRED_EXPORT',
                            entity: 'DataExport',
                            id: export_.id,
                            issue: 'Download URL expired',
                        });
                    }
                }
            }

            return issues;
        } catch (error) {
            console.error('Export validation error:', error);
            throw error;
        }
    }

    async checkDataConsistency() {
        const issues = [];

        try {
            // Check user subscription consistency
            const users = await prisma.user.findMany({
                include: {
                    subscription: true,
                },
            });

            for (const user of users) {
                // Check subscription status consistency
                if (user.subscription && user.subscription.status === 'ACTIVE') {
                    if (user.subscription.expiresAt && new Date() > user.subscription.expiresAt) {
                        issues.push({
                            type: 'SUBSCRIPTION_INCONSISTENCY',
                            entity: 'User',
                            id: user.id,
                            issue: 'Active subscription is expired',
                        });
                    }
                }

                // Check session consistency
                const activeSessions = await prisma.session.count({
                    where: {
                        userId: user.id,
                        isValid: true,
                        expiresAt: {
                            gt: new Date(),
                        },
                    },
                });

                if (activeSessions > 10) {
                    issues.push({
                        type: 'SESSION_LIMIT_EXCEEDED',
                        entity: 'User',
                        id: user.id,
                        issue: `Excessive active sessions: ${activeSessions}`,
                    });
                }
            }

            return issues;
        } catch (error) {
            console.error('Data consistency check error:', error);
            throw error;
        }
    }

    async fixIssues(issues) {
        const results = [];

        try {
            for (const issue of issues) {
                switch (issue.type) {
                    case 'ORPHANED_RECORDS':
                        await this.cleanupOrphanedRecords(issue);
                        results.push({
                            issue,
                            status: 'FIXED',
                            action: 'Deleted orphaned records',
                        });
                        break;

                    case 'BACKUP_INTEGRITY':
                        await this.recreateBackup(issue);
                        results.push({
                            issue,
                            status: 'FIXED',
                            action: 'Recreated backup',
                        });
                        break;

                    case 'EXPIRED_EXPORT':
                        await this.cleanupExpiredExport(issue);
                        results.push({
                            issue,
                            status: 'FIXED',
                            action: 'Cleaned up expired export',
                        });
                        break;

                    case 'SUBSCRIPTION_INCONSISTENCY':
                        await this.fixSubscriptionStatus(issue);
                        results.push({
                            issue,
                            status: 'FIXED',
                            action: 'Updated subscription status',
                        });
                        break;

                    case 'SESSION_LIMIT_EXCEEDED':
                        await this.cleanupExcessSessions(issue);
                        results.push({
                            issue,
                            status: 'FIXED',
                            action: 'Cleaned up excess sessions',
                        });
                        break;

                    default:
                        results.push({
                            issue,
                            status: 'SKIPPED',
                            action: 'Unknown issue type',
                        });
                }
            }

            return results;
        } catch (error) {
            console.error('Issue fix error:', error);
            throw error;
        }
    }

    async cleanupOrphanedRecords(issue) {
        switch (issue.entity) {
            case 'UserPreference':
                await prisma.userPreference.deleteMany({
                    where: {
                        id: {
                            in: issue.ids,
                        },
                    },
                });
                break;

            case 'Session':
                await prisma.session.deleteMany({
                    where: {
                        id: {
                            in: issue.ids,
                        },
                    },
                });
                break;
        }
    }

    async recreateBackup(issue) {
        const backup = await prisma.dataBackup.findUnique({
            where: { id: issue.id },
        });

        if (backup) {
            await BackupService.createBackup(backup.userId, backup.backupType);
            await prisma.dataBackup.delete({
                where: { id: backup.id },
            });
        }
    }

    async cleanupExpiredExport(issue) {
        await DataExportService.cleanupExpiredExports();
    }

    async fixSubscriptionStatus(issue) {
        await prisma.subscription.update({
            where: {
                userId: issue.id,
            },
            data: {
                status: 'EXPIRED',
            },
        });
    }

    async cleanupExcessSessions(issue) {
        const sessions = await prisma.session.findMany({
            where: {
                userId: issue.id,
                isValid: true,
            },
            orderBy: {
                lastActive: 'desc',
            },
            take: 10,
        });

        if (sessions.length === 10) {
            const lastSessionDate = sessions[9].lastActive;
            await prisma.session.updateMany({
                where: {
                    userId: issue.id,
                    lastActive: {
                        lt: lastSessionDate,
                    },
                },
                data: {
                    isValid: false,
                },
            });
        }
    }
}

module.exports = new DataIntegrityService();
