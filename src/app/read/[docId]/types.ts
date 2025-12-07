// Types for the Read Page components

export interface Vocab {
    word: string;
    definition: string;
}

export interface Highlight {
    id: string;
    text: string;
    startOffset: number;
    endOffset: number;
}

export interface CornellNote {
    cues_stickers?: string | Sticker[];
    notes_stickers?: string | Sticker[];
    highlights?: string | Highlight[];
    summary_bottom: string;
}

export interface Stage {
    id: number;
    stage_index: number;
    title: string;
    objective: string;
    stage_text: string;
    suggested_vocab: Vocab[];
    cornell_note?: CornellNote;
}

export interface Sticker {
    id: string;
    content: string;
    selectedText?: string;
    createdAt: string;
}

export interface MenuPosition {
    top: number;
    left: number;
}
