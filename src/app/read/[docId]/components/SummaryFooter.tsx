'use client';

import { ChangeEvent } from 'react';
import { Box, Typography, TextField } from '@mui/material';

interface SummaryFooterProps {
    summary: string;
    onSummaryChange: (value: string) => void;
}

export default function SummaryFooter({ summary, onSummaryChange }: SummaryFooterProps) {
    return (
        <Box sx={{
            p: 2,
            bgcolor: 'white',
            borderTop: 1,
            borderColor: 'divider',
            height: '150px',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                SUMMARY
            </Typography>
            <TextField
                multiline
                fullWidth
                rows={3}
                variant="outlined"
                placeholder="Summarize this stage..."
                value={summary}
                onChange={(e: ChangeEvent<HTMLInputElement>) => onSummaryChange(e.target.value)}
                sx={{ flexGrow: 1 }}
            />
        </Box>
    );
}
