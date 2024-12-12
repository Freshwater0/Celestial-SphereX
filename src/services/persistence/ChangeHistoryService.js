const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ChangeHistoryService {
    async logChange(entityType, entityId, changeType, changes, userId, metadata = null) {
        try {
            return await prisma.changeHistory.create({
                data: {
                    entityType,
                    entityId,
                    changeType,
                    changes,
                    userId,
                    metadata,
                },
            });
        } catch (error) {
            console.error('Change logging error:', error);
            throw error;
        }
    }

    async getChangeHistory(entityType, entityId, options = {}) {
        const {
            limit = 50,
            offset = 0,
            startDate = null,
            endDate = null,
            changeTypes = null,
        } = options;

        try {
            const whereClause = {
                entityType,
                entityId,
                ...(startDate && endDate && {
                    createdAt: {
                        gte: startDate,
                        lte: endDate,
                    },
                }),
                ...(changeTypes && {
                    changeType: {
                        in: changeTypes,
                    },
                }),
            };

            return await prisma.changeHistory.findMany({
                where: whereClause,
                take: limit,
                skip: offset,
                orderBy: {
                    createdAt: 'desc',
                },
                include: {
                    user: true,
                },
            });
        } catch (error) {
            console.error('Get change history error:', error);
            throw error;
        }
    }

    async getEntityTimeline(entityType, entityId) {
        try {
            const changes = await prisma.changeHistory.findMany({
                where: {
                    entityType,
                    entityId,
                },
                orderBy: {
                    createdAt: 'asc',
                },
                include: {
                    user: true,
                },
            });

            return this.reconstructTimeline(changes);
        } catch (error) {
            console.error('Get entity timeline error:', error);
            throw error;
        }
    }

    reconstructTimeline(changes) {
        const timeline = [];
        let currentState = {};

        for (const change of changes) {
            switch (change.changeType) {
                case 'CREATE':
                    currentState = { ...change.changes };
                    break;
                case 'UPDATE':
                    currentState = { ...currentState, ...change.changes };
                    break;
                case 'DELETE':
                    currentState = null;
                    break;
                case 'RESTORE':
                    currentState = { ...change.changes };
                    break;
            }

            timeline.push({
                timestamp: change.createdAt,
                changeType: change.changeType,
                changes: change.changes,
                state: currentState ? { ...currentState } : null,
                user: change.user,
                metadata: change.metadata,
            });
        }

        return timeline;
    }

    async getChangeStats(entityType, userId = null) {
        try {
            const whereClause = {
                entityType,
                ...(userId && { userId }),
            };

            const stats = await prisma.changeHistory.groupBy({
                by: ['changeType'],
                where: whereClause,
                _count: {
                    changeType: true,
                },
            });

            return stats.reduce((acc, stat) => {
                acc[stat.changeType] = stat._count.changeType;
                return acc;
            }, {});
        } catch (error) {
            console.error('Get change stats error:', error);
            throw error;
        }
    }

    async cleanupOldChanges(retentionDays = 365) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

            await prisma.changeHistory.deleteMany({
                where: {
                    createdAt: {
                        lt: cutoffDate,
                    },
                },
            });
        } catch (error) {
            console.error('Change cleanup error:', error);
            throw error;
        }
    }
}

module.exports = new ChangeHistoryService();
