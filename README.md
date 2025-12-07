# Socrates Learning Platform MVP

A microservices-based learning platform using the Cornell Method, powered by AI.

## Architecture

- **Frontend**: Next.js + Tailwind CSS (Port 3000)
- **Backend**: FastAPI (Port 8000)
- **AI Service**: FastAPI + LangChain (Port 8001)
- **Worker**: Python + RabbitMQ
- **Database**: PostgreSQL (Port 5432)
- **Broker**: RabbitMQ (Port 5672/15672)

## Prerequisites

- Docker Desktop
- Docker Compose

## Setup & Run

1. **Environment Variables**:
   Create a `.env` file in the root directory (same level as `docker-compose.yml`) with your OpenAI API Key:
   ```
   OPENAI_API_KEY=sk-your-key-here
   ```

2. **Start the Stack**:
   ```bash
   docker compose up --build
   ```

3. **Access the App**:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend Docs: [http://localhost:8000/docs](http://localhost:8000/docs)
   - RabbitMQ Management: [http://localhost:15672](http://localhost:15672) (user/password)

## Usage Flow

1. **Profile**: Go to the frontend. Create a user profile.
2. **Dashboard**: After profile creation, you will see the dashboard.
3. **Upload**: Upload a PDF, Image, or Text file.
   - The system will extract text and send it to the background worker.
   - The AI Service will generate a reading plan.
4. **Read**: Click "Read" on the document.
   - Navigate through stages.
   - Use the Cornell notes layout (Cues, Notes, Summary).
   - Click on words in the text to mark them as "Unknown".
5. **Summary**: View your progress and compiled notes.

## Development Notes

- Services are mounted via volumes, so code changes in `backend/`, `ia-service/`, etc., will reload automatically.
- Database data is persisted in a Docker volume `pgdata`.
