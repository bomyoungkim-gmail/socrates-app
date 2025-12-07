from sqlalchemy.orm import Session
from . import models, schemas
import json

def create_user(db: Session, user: schemas.UserProfileCreate):
    db_user = models.UserProfile(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user(db: Session, user_id: int):
    return db.query(models.UserProfile).filter(models.UserProfile.id == user_id).first()

def create_document(db: Session, document: schemas.DocumentCreate, user_id: int):
    db_doc = models.Document(**document.dict(), user_id=user_id)
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    return db_doc

def get_documents_by_user(db: Session, user_id: int):
    return db.query(models.Document).filter(models.Document.user_id == user_id).order_by(models.Document.created_at.desc()).all()

def get_document(db: Session, doc_id: int):
    return db.query(models.Document).filter(models.Document.id == doc_id).first()

def get_stages(db: Session, doc_id: int):
    return db.query(models.ReadingStage).filter(models.ReadingStage.document_id == doc_id).order_by(models.ReadingStage.stage_index).all()

def get_stage(db: Session, stage_id: int):
    return db.query(models.ReadingStage).filter(models.ReadingStage.id == stage_id).first()

def create_cornell_note(db: Session, note: schemas.CornellNoteCreate, stage_id: int):
    # Check if exists
    existing = db.query(models.CornellNote).filter(models.CornellNote.stage_id == stage_id).first()
    if existing:
        # Update ALL fields including sticky notes
        existing.cues_left = note.cues_left
        existing.notes_right = note.notes_right
        existing.summary_bottom = note.summary_bottom
        existing.cues_stickers = note.cues_stickers
        existing.notes_stickers = note.notes_stickers
        existing.highlights = note.highlights
        db.commit()
        db.refresh(existing)
        return existing
    
    db_note = models.CornellNote(**note.dict(), stage_id=stage_id)
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note

def create_unknown_word(db: Session, word: schemas.UnknownWordCreate, user_id: int, document_id: int = None, stage_id: int = None):
    db_word = models.UnknownWord(
        user_id=user_id,
        document_id=document_id,
        stage_id=stage_id,
        word=word.word,
        context_sentence=word.context_sentence
    )
    db.add(db_word)
    db.commit()
    db.refresh(db_word)
    return db_word
