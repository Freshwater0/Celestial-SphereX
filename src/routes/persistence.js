const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const DataVersionService = require('../services/persistence/DataVersionService');
const BackupService = require('../services/persistence/BackupService');
const DataExportService = require('../services/persistence/DataExportService');
const ChangeHistoryService = require('../services/persistence/ChangeHistoryService');
const DataIntegrityService = require('../services/persistence/DataIntegrityService');

// Version Control Routes
router.get('/versions/:entityType/:entityId', authenticate, async (req, res) => {
    try {
        const { entityType, entityId } = req.params;
        const versions = await DataVersionService.getVersionHistory(entityType, parseInt(entityId));
        res.json(versions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/versions/:entityType/:entityId/restore/:version', authenticate, async (req, res) => {
    try {
        const { entityType, entityId, version } = req.params;
        await DataVersionService.restoreVersion(entityType, parseInt(entityId), parseInt(version));
        res.json({ message: 'Version restored successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Backup Routes
router.post('/backups', authenticate, async (req, res) => {
    try {
        const { backupType } = req.body;
        const backup = await BackupService.createBackup(req.user.id, backupType);
        res.json(backup);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/backups', authenticate, async (req, res) => {
    try {
        const backups = await prisma.dataBackup.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
        });
        res.json(backups);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/backups/:backupId/restore', authenticate, async (req, res) => {
    try {
        const { backupId } = req.params;
        await BackupService.restoreFromBackup(parseInt(backupId));
        res.json({ message: 'Backup restored successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Data Export Routes
router.post('/exports', authenticate, async (req, res) => {
    try {
        const { exportType, format } = req.body;
        const export_ = await DataExportService.requestExport(req.user.id, exportType, format);
        res.json(export_);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/exports', authenticate, async (req, res) => {
    try {
        const exports = await prisma.dataExport.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
        });
        res.json(exports);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/exports/:exportId/status', authenticate, async (req, res) => {
    try {
        const { exportId } = req.params;
        const export_ = await prisma.dataExport.findUnique({
            where: { id: parseInt(exportId) },
        });
        
        if (!export_ || export_.userId !== req.user.id) {
            return res.status(404).json({ message: 'Export not found' });
        }
        
        res.json(export_);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Change History Routes
router.get('/changes/:entityType/:entityId', authenticate, async (req, res) => {
    try {
        const { entityType, entityId } = req.params;
        const { limit, offset, startDate, endDate, changeTypes } = req.query;
        
        const changes = await ChangeHistoryService.getChangeHistory(
            entityType,
            parseInt(entityId),
            {
                limit: parseInt(limit) || 50,
                offset: parseInt(offset) || 0,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                changeTypes: changeTypes ? changeTypes.split(',') : null,
            }
        );
        res.json(changes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/changes/:entityType/:entityId/timeline', authenticate, async (req, res) => {
    try {
        const { entityType, entityId } = req.params;
        const timeline = await ChangeHistoryService.getEntityTimeline(entityType, parseInt(entityId));
        res.json(timeline);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Data Integrity Routes
router.post('/integrity/check', authenticate, requireRole(['ADMIN']), async (req, res) => {
    try {
        const options = req.body;
        const results = await DataIntegrityService.verifyDataIntegrity(options);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/integrity/fix', authenticate, requireRole(['ADMIN']), async (req, res) => {
    try {
        const { issues } = req.body;
        const results = await DataIntegrityService.fixIssues(issues);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin Routes
router.post('/admin/cleanup', authenticate, requireRole(['ADMIN']), async (req, res) => {
    try {
        await Promise.all([
            DataVersionService.pruneOldVersions(),
            BackupService.cleanupOldBackups(),
            DataExportService.cleanupExpiredExports(),
            ChangeHistoryService.cleanupOldChanges(),
        ]);
        res.json({ message: 'Cleanup completed successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
