'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Box, Grid, CircularProgress, Typography, Button } from '@mui/material';
import { fetchAPI } from '@/lib/api';

// Types
import { Stage, Sticker } from './types';

// Hooks
import { useStages, useStickers, useTextSelection } from './hooks';

// Components
import ReadPageHeader from './components/ReadPageHeader';
import TextReader from './components/TextReader';
import SummaryFooter from './components/SummaryFooter';
import StickerColumn from './components/StickerColumn';
import StickerModal from './components/StickerModal';
import TextSelectionMenu from './components/TextSelectionMenu';

export default function ReadPage({ params }: { params: { docId: string } }) {
    const { docId } = params;
    const router = useRouter();
    const textRef = useRef<HTMLDivElement>(null);

    // Custom hooks
    const {
        stages,
        setStages,
        currentStageIdx,
        currentStage,
        loading,
        logs,
        loadStages,
        loadFallback,
        handleStageChange: stageChange
    } = useStages(docId);

    const {
        cueStickers,
        noteStickers,
        highlights,
        summary,
        setSummary,
        saving,
        loadNotesFromStage,
        getCurrentNotes,
        handleDeleteSticker,
        handleSaveSticker,
        handleAddHighlight,
        handleRemoveHighlight
    } = useStickers();

    const {
        selectedText,
        setSelectedText,
        menuPosition,
        menuOpen,
        setMenuOpen,
        isHighlighted,
        handleTextMouseUp
    } = useTextSelection();

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState<'cue' | 'note'>('cue');
    const [editingSticker, setEditingSticker] = useState<Sticker | null>(null);

    // Load stages on mount
    useEffect(() => {
        const init = async () => {
            const firstStage = await loadStages();
            if (firstStage) {
                loadNotesFromStage(firstStage.cornell_note);
            }
        };
        init();
    }, [docId]);

    // Handler: Change stage
    const handleStageChange = (idx: number) => {
        stageChange(idx, getCurrentNotes());
        loadNotesFromStage(stages[idx]?.cornell_note);
    };

    // Handler: Save notes to backend
    const handleSaveNotes = async () => {
        if (!currentStage) return;

        try {
            const payload = {
                cues_stickers: JSON.stringify(cueStickers),
                notes_stickers: JSON.stringify(noteStickers),
                highlights: JSON.stringify(highlights),
                summary_bottom: summary
            };

            await fetchAPI(`/api/stages/${currentStage.id}/cornell`, {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            // Update local state
            setStages(prev => {
                const updated = [...prev];
                updated[currentStageIdx].cornell_note = getCurrentNotes();
                return updated;
            });

            alert('Notes saved!');
        } catch (e) {
            alert('Failed to save notes');
        }
    };

    // Sticker handlers
    const handleAddCue = () => {
        setModalType('cue');
        setEditingSticker(null);
        setSelectedText('');
        setModalOpen(true);
    };

    const handleAddNote = () => {
        setModalType('note');
        setEditingSticker(null);
        setSelectedText('');
        setModalOpen(true);
    };

    const handleEditSticker = (sticker: Sticker, type: 'cue' | 'note') => {
        setModalType(type);
        setEditingSticker(sticker);
        setModalOpen(true);
    };

    const onSaveSticker = (content: string) => {
        handleSaveSticker(content, modalType, editingSticker, selectedText);
    };

    // Menu handlers
    const handleCreateCueFromSelection = () => {
        setModalType('cue');
        setEditingSticker(null);
        setModalOpen(true);
        setMenuOpen(false);
    };

    const handleCreateNoteFromSelection = () => {
        setModalType('note');
        setEditingSticker(null);
        setModalOpen(true);
        setMenuOpen(false);
    };

    const handleHighlight = () => {
        handleAddHighlight(selectedText);
        setMenuOpen(false);
        setSelectedText('');
    };

    const handleRemoveHighlightAction = () => {
        handleRemoveHighlight(selectedText);
        setMenuOpen(false);
    };

    // Loading state
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ ml: 2 }}>Loading reading plan...</Typography>
            </Box>
        );
    }

    // No stages state
    if (!currentStage) {
        return (
            <Container maxWidth="sm" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', textAlign: 'center' }}>
                <Typography variant="h5" gutterBottom color="text.secondary">No stages found.</Typography>
                <Typography variant="body1" paragraph color="text.secondary">
                    The reading plan might still be generating by our AI.
                </Typography>
                <Button variant="contained" onClick={loadStages} sx={{ mr: 2 }}>Refresh Status</Button>
                <Button variant="outlined" color="warning" onClick={loadFallback}>Force Fallback (Load Text)</Button>

                <Box sx={{ mt: 4, p: 2, bgcolor: '#f5f5f5', width: '100%', maxHeight: '200px', overflow: 'auto', textAlign: 'left' }}>
                    <Typography variant="caption" display="block">Debug Logs:</Typography>
                    {logs.map((l: string, i: number) => (
                        <Typography key={i} variant="caption" display="block" sx={{ fontFamily: 'monospace' }}>{l}</Typography>
                    ))}
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth={false} sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'grey.100' }}>
            {/* Header */}
            <ReadPageHeader
                currentStage={currentStage}
                stages={stages}
                currentStageIdx={currentStageIdx}
                saving={saving}
                onBack={() => router.push('/dashboard')}
                onStageChange={handleStageChange}
                onSave={handleSaveNotes}
            />

            {/* Main Content Grid */}
            <Box sx={{ flexGrow: 1, overflow: 'hidden', p: 2 }}>
                <Grid container spacing={2} sx={{ height: '100%' }}>
                    {/* Left Col: Cues */}
                    <Grid item xs={12} md={2} sx={{ height: '100%' }}>
                        <StickerColumn
                            title="CUES / QUESTIONS"
                            stickers={cueStickers}
                            onAdd={handleAddCue}
                            onEdit={(s) => handleEditSticker(s, 'cue')}
                            onDelete={(id) => handleDeleteSticker(id, 'cue')}
                        />
                    </Grid>

                    {/* Center Col: Text */}
                    <Grid item xs={12} md={7} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <TextReader
                            ref={textRef}
                            currentStage={currentStage}
                            highlights={highlights}
                            onMouseUp={handleTextMouseUp}
                        />
                    </Grid>

                    {/* Right Col: Notes */}
                    <Grid item xs={12} md={3} sx={{ height: '100%' }}>
                        <StickerColumn
                            title="NOTES"
                            stickers={noteStickers}
                            onAdd={handleAddNote}
                            onEdit={(s) => handleEditSticker(s, 'note')}
                            onDelete={(id) => handleDeleteSticker(id, 'note')}
                        />
                    </Grid>
                </Grid>
            </Box>

            {/* Footer: Summary */}
            <SummaryFooter summary={summary} onSummaryChange={setSummary} />

            {/* Modal */}
            <StickerModal
                open={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    setEditingSticker(null);
                    setSelectedText('');
                }}
                onSave={onSaveSticker}
                sticker={editingSticker}
                selectedText={selectedText}
            />

            {/* Text Selection Menu */}
            {menuPosition && (
                <TextSelectionMenu
                    anchorPosition={menuPosition}
                    open={menuOpen}
                    onClose={() => setMenuOpen(false)}
                    onCreateCue={handleCreateCueFromSelection}
                    onCreateNote={handleCreateNoteFromSelection}
                    onHighlight={handleHighlight}
                    onRemoveHighlight={handleRemoveHighlightAction}
                    isHighlighted={isHighlighted}
                />
            )}
        </Container>
    );
}
