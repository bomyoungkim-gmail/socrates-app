'use client';

import { Menu, MenuItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import HighlightIcon from '@mui/icons-material/Highlight';
import DeleteIcon from '@mui/icons-material/Delete';

interface TextSelectionMenuProps {
    anchorPosition: { top: number; left: number } | null;
    open: boolean;
    onClose: () => void;
    onCreateCue: () => void;
    onCreateNote: () => void;
    onHighlight: () => void;
    onRemoveHighlight?: () => void;
    isHighlighted?: boolean;
}

export default function TextSelectionMenu({
    anchorPosition,
    open,
    onClose,
    onCreateCue,
    onCreateNote,
    onHighlight,
    onRemoveHighlight,
    isHighlighted = false
}: TextSelectionMenuProps) {
    return (
        <Menu
            open={open}
            onClose={onClose}
            anchorReference="anchorPosition"
            anchorPosition={
                anchorPosition !== null
                    ? { top: anchorPosition.top, left: anchorPosition.left }
                    : undefined
            }
        >
            <MenuItem onClick={onCreateCue}>
                <ListItemIcon>
                    <QuestionMarkIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText>Criar Cue/Question</ListItemText>
            </MenuItem>

            <MenuItem onClick={onCreateNote}>
                <ListItemIcon>
                    <NoteAddIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText>Criar Note</ListItemText>
            </MenuItem>

            <Divider />

            {!isHighlighted ? (
                <MenuItem onClick={onHighlight}>
                    <ListItemIcon>
                        <HighlightIcon fontSize="small" sx={{ color: 'success.main' }} />
                    </ListItemIcon>
                    <ListItemText>Highlight (verde)</ListItemText>
                </MenuItem>
            ) : (
                <MenuItem onClick={onRemoveHighlight} sx={{ color: 'error.main' }}>
                    <ListItemIcon>
                        <DeleteIcon fontSize="small" color="error" />
                    </ListItemIcon>
                    <ListItemText>Remover Highlight</ListItemText>
                </MenuItem>
            )}
        </Menu>
    );
}
