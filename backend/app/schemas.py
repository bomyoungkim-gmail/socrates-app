from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# User Profile
class UserProfileBase(BaseModel):
    nome: str
    idade: int
    grau_de_instrucao: str
    education_year: str
    profissao: str
    nacionalidade: str
    lingua_nativa: str

class UserProfileCreate(UserProfileBase):
    pass

class UserProfile(UserProfileBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Document
class DocumentBase(BaseModel):
    original_filename: str
    content_type: str

class DocumentCreate(DocumentBase):
    raw_text: str

class Document(DocumentBase):
    id: int
    user_id: int
    created_at: datetime
    raw_text: str
    
    class Config:
        from_attributes = True

# Cornell Note
class CornellNoteBase(BaseModel):
    cues_left: str = ""
    notes_right: str = ""
    summary_bottom: str = ""
    cues_stickers: str = "[]"  # JSON string
    notes_stickers: str = "[]"  # JSON string
    highlights: str = "[]"  # JSON string

class CornellNoteCreate(CornellNoteBase):
    pass

class CornellNote(CornellNoteBase):
    id: int
    stage_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Vocabulary
class VocabItem(BaseModel):
    word: str
    definition: str

# Reading Stage
class ReadingStageBase(BaseModel):
    stage_index: int
    title: str
    objective: str
    stage_text: str
    suggested_vocab: List[VocabItem]

class ReadingStage(ReadingStageBase):
    id: int
    document_id: int
    created_at: datetime
    cornell_note: Optional[CornellNote] = None

    class Config:
        from_attributes = True

# Unknown Word
class UnknownWordCreate(BaseModel):
    word: str
    context_sentence: Optional[str] = None

class UnknownWord(UnknownWordCreate):
    id: int
    user_id: int
    
    class Config:
        from_attributes = True

# Summary
class DocumentSummary(BaseModel):
    document_id: int
    total_stages: int
    total_vocab_suggested: int
    cornell_notes: List[CornellNote]
