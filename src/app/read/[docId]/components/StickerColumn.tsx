'use client';

import { Box, Typography, IconButton, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import StickerCard, { Sticker } from './StickerCard';

interface StickerColumnProps {
    title: string;
    stickers: Sticker[];
    onAdd: () => void;
    onEdit: (sticker: Sticker) => void;
    onDelete: (id: string) => void;
}

export default function StickerColumn({
    title,
    stickers,
    onAdd,
    onEdit,
    onDelete
}: StickerColumnProps) {
    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header com título e botão (+) */}
            <Paper
                sx={{
                    p: 1,
                    bgcolor: 'grey.50',
                    borderBottom: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
            >
                <Typography variant="subtitle2" color="text.secondary">
                    {title}
                </Typography>
                <IconButton
                    size="small"
                    onClick={onAdd}
                    color="primary"
                    sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'primary.dark' }
                    }}
                >
                    <AddIcon fontSize="small" />
                </IconButton>
            </Paper>

            {/* Lista de stickers (scrollable) */}
            <Box
                sx={{
                    flexGrow: 1,
                    overflowY: 'auto',
                    p: 1,
                    bgcolor: 'background.default'
                }}
            >
                {stickers.length === 0 ? (
                    <Typography
                        variant="caption"
                        color="text.disabled"
                        sx={{ display: 'block', textAlign: 'center', mt: 2 }}
                    >
                        Nenhuma nota ainda.
                        <br />
                        Clique no (+) para adicionar.
                    </Typography>
                ) : (
                    stickers.map((sticker) => (
                        <StickerCard
                            key={sticker.id}
                            sticker={sticker}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))
                )}
            </Box>
        </Box>
    );
}
