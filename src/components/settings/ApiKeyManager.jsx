import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Box,
    List,
    ListItem,
    ListItemText,
    Link,
    Alert,
    IconButton,
    Collapse
} from '@mui/material';
import {
    Add as AddIcon,
    Delete as DeleteIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { apiKeyService } from '../../services/apiKeyService';

const ApiKeyManager = ({ open, onClose }) => {
    const [keys, setKeys] = useState({});
    const [newKey, setNewKey] = useState('');
    const [selectedPlatform, setSelectedPlatform] = useState('');
    const [error, setError] = useState('');
    const [showInstructions, setShowInstructions] = useState(false);
    const [showKey, setShowKey] = useState(false);

    useEffect(() => {
        loadKeys();
    }, []);

    const loadKeys = () => {
        const storedKeys = apiKeyService.getAllKeys();
        setKeys(storedKeys);
    };

    const handleAddKey = () => {
        try {
            apiKeyService.saveKey(selectedPlatform, newKey);
            loadKeys();
            setNewKey('');
            setSelectedPlatform('');
            setError('');
        } catch (error) {
            setError(error.message);
        }
    };

    const handleRemoveKey = (platform) => {
        try {
            apiKeyService.removeKey(platform);
            loadKeys();
        } catch (error) {
            setError(error.message);
        }
    };

    const renderInstructions = () => {
        if (!selectedPlatform) return null;

        const instructions = apiKeyService.getApiKeyInstructions(selectedPlatform);
        if (!instructions) return null;

        return (
            <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                    {instructions.title}
                </Typography>
                <List dense>
                    {instructions.steps.map((step, index) => (
                        <ListItem key={index}>
                            <ListItemText primary={`${index + 1}. ${step}`} />
                        </ListItem>
                    ))}
                </List>
                <Link href={instructions.url} target="_blank" rel="noopener">
                    Official Documentation
                </Link>
            </Box>
        );
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Manage Social Media API Keys</DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Current API Keys
                    </Typography>
                    <List>
                        {Object.entries(keys).map(([platform, key]) => (
                            <ListItem
                                key={platform}
                                secondaryAction={
                                    <IconButton edge="end" onClick={() => handleRemoveKey(platform)}>
                                        <DeleteIcon />
                                    </IconButton>
                                }
                            >
                                <ListItemText
                                    primary={platform.charAt(0).toUpperCase() + platform.slice(1)}
                                    secondary={
                                        showKey 
                                            ? key 
                                            : '••••••••' + key.slice(-4)
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                </Box>

                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Add New API Key
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <Button
                            variant={selectedPlatform === 'tiktok' ? 'contained' : 'outlined'}
                            onClick={() => setSelectedPlatform('tiktok')}
                        >
                            TikTok
                        </Button>
                        <Button
                            variant={selectedPlatform === 'instagram' ? 'contained' : 'outlined'}
                            onClick={() => setSelectedPlatform('instagram')}
                        >
                            Instagram
                        </Button>
                        <Button
                            variant={selectedPlatform === 'youtube' ? 'contained' : 'outlined'}
                            onClick={() => setSelectedPlatform('youtube')}
                        >
                            YouTube
                        </Button>
                    </Box>

                    {selectedPlatform && (
                        <>
                            <TextField
                                fullWidth
                                label={`${selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)} API Key`}
                                value={newKey}
                                onChange={(e) => setNewKey(e.target.value)}
                                type={showKey ? 'text' : 'password'}
                                InputProps={{
                                    endAdornment: (
                                        <IconButton onClick={() => setShowKey(!showKey)}>
                                            {showKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                        </IconButton>
                                    ),
                                }}
                                sx={{ mb: 1 }}
                            />
                            <Button
                                variant="text"
                                onClick={() => setShowInstructions(!showInstructions)}
                                endIcon={showInstructions ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            >
                                How to get API Key
                            </Button>
                            <Collapse in={showInstructions}>
                                {renderInstructions()}
                            </Collapse>
                        </>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    onClick={handleAddKey}
                    variant="contained"
                    disabled={!selectedPlatform || !newKey}
                >
                    Add Key
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ApiKeyManager;
