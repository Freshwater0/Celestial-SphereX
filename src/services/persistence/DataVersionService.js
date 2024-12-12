const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class DataVersionService {
    async createVersion(entityType, entityId, data, changes, userId) {
        try {
            // Get latest version number
            const latestVersion = await prisma.dataVersion.findFirst({
                where: {
                    entityType,
                    entityId,
                },
                orderBy: {
                    version: 'desc',
                },
            });

            const version = (latestVersion?.version || 0) + 1;

            // Create new version
            return await prisma.dataVersion.create({
                data: {
                    entityType,
                    entityId,
                    version,
                    data,
                    changes,
                    createdBy: userId,
                },
            });
        } catch (error) {
            console.error('Version creation error:', error);
            throw error;
        }
    }

    async getVersionHistory(entityType, entityId) {
        try {
            return await prisma.dataVersion.findMany({
                where: {
                    entityType,
                    entityId,
                },
                orderBy: {
                    version: 'desc',
                },
                include: {
                    user: true,
                },
            });
        } catch (error) {
            console.error('Get version history error:', error);
            throw error;
        }
    }

    async restoreVersion(entityType, entityId, version) {
        try {
            const versionData = await prisma.dataVersion.findFirst({
                where: {
                    entityType,
                    entityId,
                    version,
                },
            });

            if (!versionData) {
                throw new Error('Version not found');
            }

            // Restore the data based on entity type
            switch (entityType) {
                case 'User':
                    await prisma.user.update({
                        where: { id: entityId },
                        data: versionData.data,
                    });
                    break;
                case 'UserPreference':
                    await prisma.userPreference.update({
                        where: { id: entityId },
                        data: versionData.data,
                    });
                    break;
                // Add more cases as needed
                default:
                    throw new Error(`Unsupported entity type: ${entityType}`);
            }

            return versionData;
        } catch (error) {
            console.error('Version restore error:', error);
            throw error;
        }
    }

    async pruneOldVersions(entityType, entityId, keepCount = 10) {
        try {
            const versions = await prisma.dataVersion.findMany({
                where: {
                    entityType,
                    entityId,
                },
                orderBy: {
                    version: 'desc',
                },
                skip: keepCount,
            });

            if (versions.length > 0) {
                await prisma.dataVersion.deleteMany({
                    where: {
                        id: {
                            in: versions.map(v => v.id),
                        },
                    },
                });
            }
        } catch (error) {
            console.error('Version pruning error:', error);
            throw error;
        }
    }
}

module.exports = new DataVersionService();
