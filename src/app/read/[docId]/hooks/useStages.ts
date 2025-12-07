'use client';

import { useState, useCallback } from 'react';
import { fetchAPI } from '@/lib/api';
import { Stage, CornellNote, Sticker, Highlight } from '../types';

interface UseStagesReturn {
    stages: Stage[];
    setStages: React.Dispatch<React.SetStateAction<Stage[]>>;
    currentStageIdx: number;
    currentStage: Stage | null;
    loading: boolean;
    logs: string[];
    loadStages: () => Promise<void>;
    loadFallback: () => Promise<void>;
    handleStageChange: (idx: number, currentNotes: CornellNote) => void;
}

export function useStages(docId: string): UseStagesReturn {
    const [stages, setStages] = useState<Stage[]>([]);
    const [currentStageIdx, setCurrentStageIdx] = useState(0);
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = useCallback((msg: string) => {
        setLogs(prev => [...prev, `${new Date().toISOString().split('T')[1]} - ${msg}`]);
    }, []);

    const loadFallback = useCallback(async () => {
        try {
            addLog("Fetching raw document text...");
            const docData = await fetchAPI(`/api/documents/${docId}`);
            addLog(`Document data received. Raw len: ${docData?.raw_text?.length}`);

            if (docData && docData.raw_text) {
                const fallbackStage: Stage = {
                    id: 0,
                    stage_index: 1,
                    title: "Full Document (Raw)",
                    objective: "Read the full document.",
                    stage_text: docData.raw_text,
                    suggested_vocab: []
                };
                setStages([fallbackStage]);
                return fallbackStage;
            } else {
                addLog("Document data missing raw_text");
            }
        } catch (ex: unknown) {
            const error = ex as Error;
            addLog(`Fallback failed: ${error.message}`);
        }
        return null;
    }, [docId, addLog]);

    const loadStages = useCallback(async () => {
        try {
            addLog(`Fetching stages for doc: ${docId}`);
            const data = await fetchAPI(`/api/documents/${docId}/stages`);
            addLog(`Stages data length: ${data ? data.length : 'null'}`);

            if (data && data.length > 0) {
                setStages(data);
                return data[0];
            } else {
                addLog("No stages found. Triggering fallback...");
                return await loadFallback();
            }
        } catch (e: unknown) {
            const error = e as Error;
            addLog(`Error loading stages: ${error.message}`);
            addLog("Attempting fallback due to error...");
            return await loadFallback();
        } finally {
            setLoading(false);
        }
    }, [docId, addLog, loadFallback]);

    const handleStageChange = useCallback((idx: number, currentNotes: CornellNote) => {
        setStages(prev => {
            const updated = [...prev];
            updated[currentStageIdx] = {
                ...updated[currentStageIdx],
                cornell_note: currentNotes
            };
            return updated;
        });
        setCurrentStageIdx(idx);
    }, [currentStageIdx]);

    return {
        stages,
        setStages,
        currentStageIdx,
        currentStage: stages[currentStageIdx] || null,
        loading,
        logs,
        loadStages,
        loadFallback,
        handleStageChange
    };
}
