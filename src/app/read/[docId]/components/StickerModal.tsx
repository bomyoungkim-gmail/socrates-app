'use client';

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, Box } from '@mui/material';
import { useState, useEffect } from 'react';
import { Sticker } from './StickerCard';

interface StickerModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (content: string) => void;
    sticker?: Sticker | null;
    selectedText?: string;
}

export default function StickerModal({
    open,
    onClose,
    onSave,
    sticker,
    selectedText
}: StickerModalProps) {
    const [content, setContent] = useState('');

    useEffect(() => {
        if (sticker) {
            setContent(sticker.content);
        } else {
            setContent('');
        }
    }, [sticker, selectedText, open]);

    const handleSave = () => {
        if (content.trim()) {
            onSave(content);
            setContent('');
            onClose();
        }
    };

    const handleClose = () => {
        setContent('');
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>
                {sticker ? 'Editar Nota' : 'Nova Nota'}
            </DialogTitle>

            <DialogContent>
                {/* Texto selecionado (se houver) */}
                {(sticker?.selectedText || selectedText) && (
                    <Box sx={{ mb: 2, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary" gutterBottom>
                            Texto selecionado:
                        </Typography>
                        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                            "{sticker?.selectedText || selectedText}"
                        </Typography>
                    </Box>
                )}

                {/* Campo de texto */}
                <TextField
                    autoFocus
                    multiline
                    rows={6}
                    fullWidth
                    variant="outlined"
                    placeholder="Digite sua nota aqui..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    sx={{ mt: 1 }}
                />
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose} color="inherit">
                    Cancelar
                </Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    disabled={!content.trim()}
                >
                    Salvar
                </Button>
            </DialogActions>
        </Dialog>
    );
}
