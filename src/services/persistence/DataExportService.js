const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
// const { Storage } = require('@google-cloud/storage');
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');

class DataExportService {
    constructor() {
        // this.storage = new Storage({
        //     keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
        //     projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
        // });
        // this.bucket = this.storage.bucket(process.env.GOOGLE_CLOUD_BUCKET);
    }

    async requestExport(userId, exportType, format = 'json') {
        try {
            // Create export request
            const export_ = await prisma.dataExport.create({
                data: {
                    userId,
                    exportType,
                    format,
                    status: 'REQUESTED',
                },
            });

            // Process export asynchronously
            this.processExport(export_.id).catch(error => {
                console.error('Export processing error:', error);
            });

            return export_;
        } catch (error) {
            console.error('Export request error:', error);
            throw error;
        }
    }

    async processExport(exportId) {
        try {
            // Update status to processing
            await this.updateExportStatus(exportId, 'PROCESSING');

            const export_ = await prisma.dataExport.findUnique({
                where: { id: exportId },
                include: { user: true },
            });

            // Collect data based on export type
            const data = await this.collectExportData(export_.userId, export_.exportType);

            // Create temporary file
            const tempFile = path.join(process.env.TEMP_DIR || '/tmp', `export_${exportId}.${export_.format}`);
            
            // Format and save data
            await this.formatAndSaveData(data, export_.format, tempFile);

            // Upload to cloud storage
            // const downloadUrl = await this.uploadToStorage(tempFile, exportId);

            // Set expiration date (7 days from now)
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);

            // Update export record
            await prisma.dataExport.update({
                where: { id: exportId },
                data: {
                    status: 'COMPLETED',
                    // downloadUrl,
                    expiresAt,
                },
            });

            // Cleanup temporary file
            fs.unlinkSync(tempFile);
        } catch (error) {
            console.error('Export processing error:', error);
            await this.updateExportStatus(exportId, 'FAILED');
            throw error;
        }
    }

    async collectExportData(userId, exportType) {
        const data = {};

        try {
            switch (exportType) {
                case 'FULL_ACCOUNT':
                    data.user = await prisma.user.findUnique({
                        where: { id: userId },
                        include: {
                            preferences: true,
                            activities: true,
                            sessions: true,
                            backups: true,
                        },
                    });
                    break;

                case 'SETTINGS':
                    data.preferences = await prisma.userPreference.findUnique({
                        where: { userId },
                    });
                    break;

                case 'ACTIVITY_LOG':
                    data.activities = await prisma.userActivity.findMany({
                        where: { userId },
                        orderBy: { createdAt: 'desc' },
                    });
                    break;

                default:
                    throw new Error(`Unsupported export type: ${exportType}`);
            }

            return data;
        } catch (error) {
            console.error('Data collection error:', error);
            throw error;
        }
    }

    async formatAndSaveData(data, format, filePath) {
        try {
            switch (format.toLowerCase()) {
                case 'json':
                    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
                    break;

                case 'csv':
                    // Convert data to CSV format
                    const csv = await this.convertToCSV(data);
                    await fs.promises.writeFile(filePath, csv);
                    break;

                case 'zip':
                    // Create a zip archive with JSON files
                    const output = fs.createWriteStream(filePath);
                    const archive = archiver('zip', {
                        zlib: { level: 9 },
                    });

                    archive.pipe(output);

                    // Add each data section as a separate JSON file
                    for (const [key, value] of Object.entries(data)) {
                        archive.append(JSON.stringify(value, null, 2), { name: `${key}.json` });
                    }

                    await archive.finalize();
                    break;

                default:
                    throw new Error(`Unsupported format: ${format}`);
            }
        } catch (error) {
            console.error('Data formatting error:', error);
            throw error;
        }
    }

    // async uploadToStorage(filePath, exportId) {
    //     try {
    //         const fileName = `exports/${exportId}/${path.basename(filePath)}`;
    //         await this.bucket.upload(filePath, {
    //             destination: fileName,
    //             metadata: {
    //                 cacheControl: 'private, max-age=0',
    //             },
    //         });

    //         // Generate signed URL that expires in 7 days
    //         const [url] = await this.bucket.file(fileName).getSignedUrl({
    //             action: 'read',
    //             expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    //         });

    //         return url;
    //     } catch (error) {
    //         console.error('Storage upload error:', error);
    //         throw error;
    //     }
    // }

    async updateExportStatus(exportId, status) {
        try {
            await prisma.dataExport.update({
                where: { id: exportId },
                data: { status },
            });
        } catch (error) {
            console.error('Export status update error:', error);
            throw error;
        }
    }

    async cleanupExpiredExports() {
        try {
            const expiredExports = await prisma.dataExport.findMany({
                where: {
                    expiresAt: {
                        lt: new Date(),
                    },
                    status: 'COMPLETED',
                },
            });

            for (const export_ of expiredExports) {
                // Delete from cloud storage
                // const fileName = `exports/${export_.id}/${path.basename(export_.downloadUrl)}`;
                // await this.bucket.file(fileName).delete().catch(() => {});

                // Update database record
                await prisma.dataExport.update({
                    where: { id: export_.id },
                    data: {
                        downloadUrl: null,
                        status: 'EXPIRED',
                    },
                });
            }
        } catch (error) {
            console.error('Export cleanup error:', error);
            throw error;
        }
    }

    convertToCSV(data) {
        // Implementation of data to CSV conversion
        // This would need to be customized based on the data structure
        return '';
    }
}

module.exports = new DataExportService();
