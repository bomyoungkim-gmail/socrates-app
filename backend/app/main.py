from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
import os
import pika
import json
import io
import shutil

# Text extraction libs
import pdfplumber
import pytesseract
from PIL import Image

from . import models, schemas, crud, database

# Initialize DB
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Socrates Backend API")

# Dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# RabbitMQ Connection Helper
def get_rabbitmq_channel():
    host = os.getenv("RABBITMQ_HOST", "rabbitmq")
    user = os.getenv("RABBITMQ_USER", "user")
    password = os.getenv("RABBITMQ_PASS", "password")
    credentials = pika.PlainCredentials(user, password)
    parameters = pika.ConnectionParameters(host, credentials=credentials)
    connection = pika.BlockingConnection(parameters)
    channel = connection.channel()
    channel.queue_declare(queue='reading_plan_queue', durable=True)
    return connection, channel

# --- Endpoints ---

@app.post("/api/profile", response_model=schemas.UserProfile)
def create_profile(user: schemas.UserProfileCreate, db: Session = Depends(get_db)):
    return crud.create_user(db, user)

@app.get("/api/profile/{user_id}", response_model=schemas.UserProfile)
def get_profile(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@app.post("/api/users/{user_id}/documents", response_model=schemas.Document)
async def upload_document(
    user_id: int, 
    file: UploadFile = File(...), 
    db: Session = Depends(get_db)
):
    # Verify user exists
    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    content_type = file.content_type
    original_filename = file.filename
    raw_text = ""

    # Extract text
    try:
        if content_type == "application/pdf":
            # Read bytes
            pdf_bytes = await file.read()
            with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        raw_text += text + "\n"
        
        elif content_type.startswith("image/"):
            image_bytes = await file.read()
            image = Image.open(io.BytesIO(image_bytes))
            raw_text = pytesseract.image_to_string(image)
        
        elif content_type == "text/plain":
            content_bytes = await file.read()
            raw_text = content_bytes.decode("utf-8")
        
        else:
            # Fallback for others, just try decoding
            content_bytes = await file.read()
            try:
                raw_text = content_bytes.decode("utf-8")
            except:
                raw_text = "[Could not extract text]"

    except Exception as e:
        print(f"Error extracting text: {e}")
        raw_text = "[Error extracting text]"

    if not raw_text.strip():
        raw_text = "[No text content detected]"

    # Save Document
    doc_create = schemas.DocumentCreate(
        original_filename=original_filename,
        content_type=content_type,
        raw_text=raw_text
    )
    db_doc = crud.create_document(db, doc_create, user_id)

    # Publish to RabbitMQ
    try:
        connection, channel = get_rabbitmq_channel()
        message = json.dumps({"user_id": user_id, "document_id": db_doc.id})
        channel.basic_publish(
            exchange='',
            routing_key='reading_plan_queue',
            body=message,
            properties=pika.BasicProperties(
                delivery_mode=2,  # make message persistent
            ))
        connection.close()
    except Exception as e:
        print(f"Failed to publish to RabbitMQ: {e}")
        # Note: In production we should handle this better (retry or fail request)
    
    return db_doc

@app.get("/api/users/{user_id}/documents", response_model=List[schemas.Document])
def list_documents(user_id: int, db: Session = Depends(get_db)):
    return crud.get_documents_by_user(db, user_id)

@app.get("/api/documents/{doc_id}/stages", response_model=List[schemas.ReadingStage])
def get_stages(doc_id: int, db: Session = Depends(get_db)):
    return crud.get_stages(db, doc_id)

@app.get("/api/documents/{doc_id}", response_model=schemas.Document)
def get_document(doc_id: int, db: Session = Depends(get_db)):
    doc = crud.get_document(db, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@app.post("/api/stages/{stage_id}/cornell", response_model=schemas.CornellNote)
def save_cornell_note(stage_id: int, note: schemas.CornellNoteCreate, db: Session = Depends(get_db)):
    stage = crud.get_stage(db, stage_id)
    if not stage:
        raise HTTPException(status_code=404, detail="Stage not found")
    return crud.create_cornell_note(db, note, stage_id)

@app.post("/api/stages/{stage_id}/unknown-words", response_model=schemas.UnknownWord)
def save_unknown_word(stage_id: int, word: schemas.UnknownWordCreate, db: Session = Depends(get_db)):
    stage = crud.get_stage(db, stage_id)
    if not stage:
        raise HTTPException(status_code=404, detail="Stage not found")
    
    # Resolve user_id via document
    doc = crud.get_document(db, stage.document_id)
    return crud.create_unknown_word(db, word, doc.user_id, doc.id, stage_id)

@app.get("/api/documents/{doc_id}/summary", response_model=schemas.DocumentSummary)
def get_summary(doc_id: int, db: Session = Depends(get_db)):
    stages = crud.get_stages(db, doc_id)
    
    total_stages = len(stages)
    total_vocab = 0
    cornell_notes = []
    
    for s in stages:
        if s.suggested_vocab:
            total_vocab += len(s.suggested_vocab)
        if s.cornell_notes:
            cornell_notes.append(s.cornell_notes)
    
    # Ensure cornell notes are sorted by stage index implicitly via stages order
    
    return schemas.DocumentSummary(
        document_id=doc_id,
        total_stages=total_stages,
        total_vocab_suggested=total_vocab,
        cornell_notes=cornell_notes
    )

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, set to specific frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
