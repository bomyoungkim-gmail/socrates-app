
import asyncio
import os
from app.services import process_document
from app.database import SessionLocal
from app import models

# Mocking the event loop run
async def run_manual_process(doc_id):
    db = SessionLocal()
    print(f"Checking document {doc_id}...")
    doc = db.query(models.Document).filter(models.Document.id == doc_id).first()
    if not doc:
        print("Document not found!")
        return

    print(f"Found document: {doc.filename}. Triggering process_document...")
    await process_document(doc.id, doc.storage_path)
    print("Process finished!")

if __name__ == "__main__":
    import sys
    doc_id = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    asyncio.run(run_manual_process(doc_id))
