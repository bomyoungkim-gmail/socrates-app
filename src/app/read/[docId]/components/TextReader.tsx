'use client';

import { forwardRef, MouseEvent } from 'react';
import { Paper, Box, Typography, Grid } from '@mui/material';
import { Stage, Vocab, Highlight } from '../types';

interface TextReaderProps {
    currentStage: Stage;
    highlights: Highlight[];
    onMouseUp: (e: MouseEvent<HTMLDivElement>) => void;
}

const TextReader = forwardRef<HTMLDivElement, TextReaderProps>(function TextReader(
    { currentStage, highlights, onMouseUp },
    ref
) {
    // Render text with highlights
    const renderTextWithHighlights = (text: string) => {
        if (!highlights || highlights.length === 0) {
            return text;
        }

        // Sort highlights by text length (longest first) to avoid partial matches
        const sortedHighlights = [...highlights].sort((a, b) => b.text.length - a.text.length);

        let processedText = text;
        const replacements: Array<{ original: string; highlighted: string }> = [];

        sortedHighlights.forEach((highlight, index) => {
            // Escape special regex characters
            const escapedText = highlight.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`(${escapedText})`, 'gi');

            // Create unique placeholder to avoid conflicts
            const placeholder = `___HIGHLIGHT_${index}___`;

            // Replace all occurrences with placeholder
            processedText = processedText.replace(regex, placeholder);

            // Store the replacement mapping
            replacements.push({
                original: placeholder,
                highlighted: `<mark style="background-color: #ffeb3b; padding: 2px 0; border-radius: 2px; cursor: pointer;">${highlight.text}</mark>`
            });
        });

        // Apply all replacements back
        replacements.forEach(({ original, highlighted }) => {
            const regex = new RegExp(original, 'g');
            processedText = processedText.replace(regex, highlighted);
        });

        return <span dangerouslySetInnerHTML={{ __html: processedText }} />;
    };

    return (
        <Paper
            ref={ref}
            sx={{ flexGrow: 1, overflowY: 'auto', p: 4, bgcolor: 'white' }}
            elevation={2}
            onMouseUp={onMouseUp}
            onContextMenu={(e: MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
            }}
        >
            <Box mb={3} p={2} borderRadius={1} sx={{ bgcolor: 'rgba(25, 118, 210, 0.08)' }}>
                <Typography variant="subtitle1" color="primary.main" fontWeight="bold">
                    Objective
                </Typography>
                <Typography variant="body2" color="primary.dark">
                    {currentStage.objective}
                </Typography>
            </Box>

            <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.1rem', whiteSpace: 'pre-wrap' }}>
                {renderTextWithHighlights(currentStage.stage_text)}
            </Typography>

            {/* Suggested Vocab */}
            {currentStage.suggested_vocab && currentStage.suggested_vocab.length > 0 && (
                <Box mt={4} pt={2} borderTop={1} borderColor="divider">
                    <Typography variant="h6" gutterBottom>Suggested Vocabulary</Typography>
                    <Grid container spacing={1}>
                        {currentStage.suggested_vocab.map((v: Vocab, i: number) => (
                            <Grid item xs={12} sm={6} key={i}>
                                <Paper variant="outlined" sx={{ p: 1 }}>
                                    <Typography variant="subtitle2" color="primary">{v.word}</Typography>
                                    <Typography variant="caption" color="text.secondary">{v.definition}</Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}
        </Paper>
    );
});

export default TextReader;
