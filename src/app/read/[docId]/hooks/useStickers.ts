'use client';

import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Sticker, Highlight, CornellNote } from '../types';

interface UseStickersReturn {
    cueStickers: Sticker[];
    setCueStickers: React.Dispatch<React.SetStateAction<Sticker[]>>;
    noteStickers: Sticker[];
    setNoteStickers: React.Dispatch<React.SetStateAction<Sticker[]>>;
    highlights: Highlight[];
    setHighlights: React.Dispatch<React.SetStateAction<Highlight[]>>;
    summary: string;
    setSummary: React.Dispatch<React.SetStateAction<string>>;
    saving: boolean;
    loadNotesFromStage: (cornellNote?: CornellNote) => void;
    getCurrentNotes: () => CornellNote;
    handleAddSticker: (type: 'cue' | 'note', selectedText: string) => Sticker;
    handleEditSticker: (sticker: Sticker, type: 'cue' | 'note') => void;
    handleDeleteSticker: (id: string, type: 'cue' | 'note') => boolean;
    handleSaveSticker: (content: string, type: 'cue' | 'note', editingSticker: Sticker | null, selectedText: string) => void;
    handleAddHighlight: (text: string) => void;
    handleRemoveHighlight: (text: string) => void;
}

// Helper to parse JSON strings or return array
function parseJsonField<T>(field: string | T[] | undefined, fallback: T[] = []): T[] {
    if (!field) return fallback;
    if (typeof field === 'string') {
        try {
            return JSON.parse(field) || fallback;
        } catch {
            return fallback;
        }
    }
    return field;
}

export function useStickers(): UseStickersReturn {
    const [cueStickers, setCueStickers] = useState<Sticker[]>([]);
    const [noteStickers, setNoteStickers] = useState<Sticker[]>([]);
    const [highlights, setHighlights] = useState<Highlight[]>([]);
    const [summary, setSummary] = useState('');
    const [saving, setSaving] = useState(false);

    const loadNotesFromStage = useCallback((cornellNote?: CornellNote) => {
        if (cornellNote) {
            setCueStickers(parseJsonField<Sticker>(cornellNote.cues_stickers, []));
            setNoteStickers(parseJsonField<Sticker>(cornellNote.notes_stickers, []));
            setHighlights(parseJsonField<Highlight>(cornellNote.highlights, []));
            setSummary(cornellNote.summary_bottom || '');
        } else {
            setCueStickers([]);
            setNoteStickers([]);
            setHighlights([]);
            setSummary('');
        }
    }, []);

    const getCurrentNotes = useCallback((): CornellNote => ({
        cues_stickers: cueStickers,
        notes_stickers: noteStickers,
        highlights: highlights,
        summary_bottom: summary
    }), [cueStickers, noteStickers, highlights, summary]);

    const handleAddSticker = useCallback((type: 'cue' | 'note', selectedText: string): Sticker => {
        const newSticker: Sticker = {
            id: uuidv4(),
            content: '',
            selectedText,
            createdAt: new Date().toISOString()
        };
        return newSticker;
    }, []);

    const handleEditSticker = useCallback((sticker: Sticker, type: 'cue' | 'note') => {
        // This is handled by the modal
    }, []);

    const handleDeleteSticker = useCallback((id: string, type: 'cue' | 'note'): boolean => {
        if (!confirm('Apagar esta nota?')) return false;

        if (type === 'cue') {
            setCueStickers(prev => prev.filter((s: Sticker) => s.id !== id));
        } else {
            setNoteStickers(prev => prev.filter((s: Sticker) => s.id !== id));
        }
        return true;
    }, []);

    const handleSaveSticker = useCallback((
        content: string,
        type: 'cue' | 'note',
        editingSticker: Sticker | null,
        selectedText: string
    ) => {
        if (editingSticker) {
            const updated = { ...editingSticker, content };
            if (type === 'cue') {
                setCueStickers(prev => prev.map((s: Sticker) => s.id === updated.id ? updated : s));
            } else {
                setNoteStickers(prev => prev.map((s: Sticker) => s.id === updated.id ? updated : s));
            }
        } else {
            const newSticker: Sticker = {
                id: uuidv4(),
                content,
                selectedText,
                createdAt: new Date().toISOString()
            };
            if (type === 'cue') {
                setCueStickers(prev => [...prev, newSticker]);
            } else {
                setNoteStickers(prev => [...prev, newSticker]);
            }
        }
    }, []);

    const handleAddHighlight = useCallback((text: string) => {
        if (text) {
            const newHighlight: Highlight = {
                id: uuidv4(),
                text,
                startOffset: 0,
                endOffset: 0
            };
            setHighlights(prev => [...prev, newHighlight]);
        }
    }, []);

    const handleRemoveHighlight = useCallback((text: string) => {
        if (text) {
            setHighlights(prev => prev.filter((h: Highlight) => h.text !== text));
        }
    }, []);

    return {
        cueStickers,
        setCueStickers,
        noteStickers,
        setNoteStickers,
        highlights,
        setHighlights,
        summary,
        setSummary,
        saving,
        loadNotesFromStage,
        getCurrentNotes,
        handleAddSticker,
        handleEditSticker,
        handleDeleteSticker,
        handleSaveSticker,
        handleAddHighlight,
        handleRemoveHighlight
    };
}
