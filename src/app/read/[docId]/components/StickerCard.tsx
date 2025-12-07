'use client';

import { Card, CardContent, Typography, IconButton, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export interface Sticker {
    id: string;
    content: string;
    selectedText?: string;
    createdAt: string;
}

interface StickerCardProps {
    sticker: Sticker;
    onEdit: (sticker: Sticker) => void;
    onDelete: (id: string) => void;
}

export default function StickerCard({ sticker, onEdit, onDelete }: StickerCardProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Pega preview de 2 linhas
    const getPreview = (text: string) => {
        const lines = text.split('\n');
        return lines.slice(0, 2).join('\n');
    };

    return (
        <Card
            onClick={() => onEdit(sticker)}
            sx={{
                mb: 1,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                    boxShadow: 3,
                    transform: 'translateY(-2px)'
                },
                bgcolor: '#fffbea',
                border: '1px solid #f0e68c'
            }}
        >
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                {/* Preview do conteúdo */}
                <Typography
                    variant="body2"
                    sx={{
                        mb: 0.5,
                        whiteSpace: 'pre-line',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        minHeight: '2.5em'
                    }}
                >
                    {sticker.content || '(vazio)'}
                </Typography>

                {/* Footer com data e botões */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                        {formatDate(sticker.createdAt)}
                    </Typography>

                    <Box onClick={(e) => e.stopPropagation()}>
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(sticker);
                            }}
                            sx={{ p: 0.5 }}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(sticker.id);
                            }}
                            color="error"
                            sx={{ p: 0.5, ml: 0.5 }}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}
