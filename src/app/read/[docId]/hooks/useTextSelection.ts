'use client';

import { useState, useCallback, MouseEvent } from 'react';
import { MenuPosition } from '../types';

interface UseTextSelectionReturn {
    selectedText: string;
    setSelectedText: React.Dispatch<React.SetStateAction<string>>;
    menuPosition: MenuPosition | null;
    setMenuPosition: React.Dispatch<React.SetStateAction<MenuPosition | null>>;
    menuOpen: boolean;
    setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isHighlighted: boolean;
    setIsHighlighted: React.Dispatch<React.SetStateAction<boolean>>;
    handleTextMouseUp: (e: MouseEvent<HTMLDivElement>) => void;
    closeMenu: () => void;
}

export function useTextSelection(): UseTextSelectionReturn {
    const [selectedText, setSelectedText] = useState('');
    const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [isHighlighted, setIsHighlighted] = useState(false);

    const handleTextMouseUp = useCallback((e: MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;

        // Check if clicked on a highlight (MARK element)
        if (target.tagName === 'MARK') {
            e.stopPropagation();
            const text = target.innerText;
            setSelectedText(text);
            setIsHighlighted(true);
            setMenuPosition({
                top: e.clientY,
                left: e.clientX
            });
            setMenuOpen(true);
            return;
        }

        const selection = window.getSelection();
        if (selection && selection.toString().trim().length > 0) {
            setSelectedText(selection.toString());
            setIsHighlighted(false);
            setMenuPosition({
                top: e.clientY,
                left: e.clientX
            });
            setMenuOpen(true);
        }
    }, []);

    const closeMenu = useCallback(() => {
        setMenuOpen(false);
        setSelectedText('');
    }, []);

    return {
        selectedText,
        setSelectedText,
        menuPosition,
        setMenuPosition,
        menuOpen,
        setMenuOpen,
        isHighlighted,
        setIsHighlighted,
        handleTextMouseUp,
        closeMenu
    };
}
