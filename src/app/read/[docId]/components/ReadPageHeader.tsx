'use client';

import { AppBar, Toolbar, Button, Typography, Box } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Stage } from '../types';

interface ReadPageHeaderProps {
    currentStage: Stage;
    stages: Stage[];
    currentStageIdx: number;
    saving: boolean;
    onBack: () => void;
    onStageChange: (idx: number) => void;
    onSave: () => void;
}

export default function ReadPageHeader({
    currentStage,
    stages,
    currentStageIdx,
    saving,
    onBack,
    onStageChange,
    onSave
}: ReadPageHeaderProps) {
    return (
        <AppBar position="static" color="default" elevation={1}>
            <Toolbar variant="dense">
                <Button onClick={onBack} startIcon={<ArrowBackIcon />}>
                    Dashboard
                </Button>
                <Typography
                    variant="h6"
                    sx={{
                        flexGrow: 1,
                        ml: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}
                >
                    {currentStage.title}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', maxWidth: '40%' }}>
                    {stages.map((s: Stage, i: number) => (
                        <Button
                            key={s.id}
                            variant={i === currentStageIdx ? "contained" : "outlined"}
                            size="small"
                            onClick={() => onStageChange(i)}
                            sx={{ minWidth: 'auto', whiteSpace: 'nowrap' }}
                        >
                            Stage {s.stage_index}
                        </Button>
                    ))}
                </Box>
                <Box sx={{ ml: 2 }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={onSave}
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save Notes'}
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
}
