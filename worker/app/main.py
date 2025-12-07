import pika
import os
import json
import time
import requests
from sqlalchemy.orm import Session
from app import database, models

# Environment config
RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "rabbitmq")
RABBITMQ_USER = os.getenv("RABBITMQ_USER", "user")
RABBITMQ_PASS = os.getenv("RABBITMQ_PASS", "password")
IA_SERVICE_URL = os.getenv("IA_SERVICE_URL", "http://ia-service:8001")

def get_db_session():
    return database.SessionLocal()

def process_message(ch, method, properties, body):
    db: Session = get_db_session()
    try:
        data = json.loads(body)
        user_id = data.get("user_id")
        doc_id = data.get("document_id")
        
        print(f" [x] Processing Doc ID: {doc_id} for User ID: {user_id}")
        
        # 1. Fetch User and Document
        user = db.query(models.UserProfile).filter(models.UserProfile.id == user_id).first()
        document = db.query(models.Document).filter(models.Document.id == doc_id).first()
        
        if not user or not document:
            print("User or Document not found.")
            ch.basic_ack(delivery_tag=method.delivery_tag)
            return

        # 2. Call AI Service
        payload = {
            "profile": {
                "nome": user.nome,
                "idade": user.idade,
                "grau_de_instrucao": user.grau_de_instrucao,
                "profissao": user.profissao,
                "nacionalidade": user.nacionalidade,
                "lingua_nativa": user.lingua_nativa
            },
            "raw_text": document.raw_text
        }
        
        try:
            response = requests.post(f"{IA_SERVICE_URL}/ia/plan-reading", json=payload)
            response.raise_for_status()
            ai_data = response.json()
        except Exception as e:
            print(f"Error calling AI service: {e}")
            # If AI service fails, we might want to retry or dead-letter.
            # For MVP, we ack but maybe log error. 
            # Or nack with requeue=False.
            # Let's simple ack to unblock.
            ch.basic_ack(delivery_tag=method.delivery_tag)
            return

        # 3. Save Stages
        # Remove existing stages for this doc (idempotency)
        db.query(models.ReadingStage).filter(models.ReadingStage.document_id == doc_id).delete()
        
        stages = ai_data.get("stages", [])
        for i, stage_data in enumerate(stages):
            new_stage = models.ReadingStage(
                document_id=doc_id,
                stage_index=i + 1,
                title=stage_data.get("title"),
                objective=stage_data.get("objective"),
                stage_text=stage_data.get("stage_text"),
                suggested_vocab=stage_data.get("suggested_vocab")
            )
            db.add(new_stage)
        
        db.commit()
        print(f" [x] Saved {len(stages)} stages for Document {doc_id}")
        
        ch.basic_ack(delivery_tag=method.delivery_tag)

    except Exception as e:
        print(f"Error processing message: {e}")
        db.rollback()
        # Ack or Nack?
        ch.basic_ack(delivery_tag=method.delivery_tag)
    finally:
        db.close()

def main():
    while True:
        try:
            credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASS)
            parameters = pika.ConnectionParameters(RABBITMQ_HOST, credentials=credentials)
            connection = pika.BlockingConnection(parameters)
            channel = connection.channel()

            channel.queue_declare(queue='reading_plan_queue', durable=True)

            channel.basic_qos(prefetch_count=1)
            channel.basic_consume(queue='reading_plan_queue', on_message_callback=process_message)

            print(' [*] Waiting for messages. To exit press CTRL+C')
            channel.start_consuming()
        except pika.exceptions.AMQPConnectionError:
            print("RabbitMQ not ready, retrying in 5 seconds...")
            time.sleep(5)
        except Exception as e:
            print(f"Unexpected error: {e}")
            time.sleep(5)

if __name__ == "__main__":
    main()
