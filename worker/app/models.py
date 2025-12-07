from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class UserProfile(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    idade = Column(Integer)
    grau_de_instrucao = Column(String)
    profissao = Column(String)
    nacionalidade = Column(String)
    lingua_nativa = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    documents = relationship("Document", back_populates="user")
    unknown_words = relationship("UnknownWord", back_populates="user")

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    original_filename = Column(String)
    content_type = Column(String) # pdf, image, text
    raw_text = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("UserProfile", back_populates="documents")
    stages = relationship("ReadingStage", back_populates="document", cascade="all, delete-orphan")

class ReadingStage(Base):
    __tablename__ = "reading_stages"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"))
    stage_index = Column(Integer)
    title = Column(String)
    objective = Column(Text)
    stage_text = Column(Text)
    suggested_vocab = Column(JSON) # list of { word, definition }
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="stages")
    cornell_notes = relationship("CornellNote", back_populates="stage", uselist=False, cascade="all, delete-orphan")

class CornellNote(Base):
    __tablename__ = "cornell_notes"

    id = Column(Integer, primary_key=True, index=True)
    stage_id = Column(Integer, ForeignKey("reading_stages.id"))
    cues_left = Column(Text) # Column A
    notes_right = Column(Text) # Column B
    summary_bottom = Column(Text) # Summary
    created_at = Column(DateTime, default=datetime.utcnow)

    stage = relationship("ReadingStage", back_populates="cornell_notes")

class UnknownWord(Base):
    __tablename__ = "unknown_words"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=True)
    stage_id = Column(Integer, ForeignKey("reading_stages.id"), nullable=True)
    word = Column(String)
    context_sentence = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("UserProfile", back_populates="unknown_words")
