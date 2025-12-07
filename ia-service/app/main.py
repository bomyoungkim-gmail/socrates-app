from fastapi import FastAPI, HTTPException
from . import schemas
import os
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate

from langchain_core.output_parsers import JsonOutputParser
from typing import List

app = FastAPI(title="Socrates AI Service")

# Initialize LLM
# Handle missing key gracefully for testing
llm = None
try:
    if os.getenv("OPENAI_API_KEY") and not os.getenv("OPENAI_API_KEY").startswith("your-key"):
        llm = ChatOpenAI(temperature=0.7, model_name="gpt-4o")
    else:
        print("WARNING: OPENAI_API_KEY not set or invalid. Running in MOCK MODE.")
except Exception as e:
    print(f"Failed to initialize LLM: {e}")

# --- Prompts ---

PLAN_READING_PROMPT = """
You are an expert teacher helping a student understand a text.
The student profile is:
Name: {name}
Age: {age}
Education: {education}
Profession: {profession}
Nationality: {nationality}
Target Language: Portuguese (assuming the text is in Portuguese/English, adapt to the text language).

Analyze the following text and divide it into 3 to 7 logical reading stages using the Cornell Method.
For each stage, provide:
1. title: A short title.
2. objective: A learning objective adapted to the student's level.
3. stage_text: The exact excerpt of the text for this stage.
4. suggested_vocab: 5 to 15 key words with definitions in the student's native language ({nativa}).

Return the result as a JSON object with the key "stages" which is a list.

Text:
{text}
"""

EXPLAIN_WORD_PROMPT = """
Explain the word '{word}' for a student with the following profile:
Native Language: {nativa}
Education: {education}
Context: {context}

Provide a definition, an example sentence, and synonyms.
Return JSON: {{ "definition": "...", "example": "...", "synonyms": ["...", "..."] }}
"""

parser_plan = JsonOutputParser(pydantic_object=schemas.PlanReadingResponse)
parser_explain = JsonOutputParser(pydantic_object=schemas.ExplainWordResponse)

@app.post("/ia/plan-reading", response_model=schemas.PlanReadingResponse)
async def plan_reading(request: schemas.PlanReadingRequest):
    # Mock Mode Check
    if not llm:
        print("Using MOCK response for plan_reading")
        # Split text into chunks for mock stages
        text_len = len(request.raw_text)
        chunk_size = text_len // 3 if text_len > 100 else text_len
        
        stages = []
        for i in range(3):
            start = i * chunk_size
            end = (i + 1) * chunk_size if i < 2 else text_len
            stage_text = request.raw_text[start:end]
            
            stages.append({
                "stage_index": i + 1,
                "title": f"Stage {i+1} (Mock)",
                "objective": "Understand the main concepts of this section (Mock Objective)",
                "stage_text": stage_text,
                "suggested_vocab": [
                    {"word": "Example", "definition": "A representative form or pattern."},
                    {"word": "Mock", "definition": "Not authentic or real, but without the intention to deceive."}
                ]
            })
        return {"stages": stages}

    try:
        if not request.raw_text.strip():
             # Return empty or error? Let's return error or mock if text is too short
             if len(request.raw_text) < 10:
                 raise HTTPException(status_code=400, detail="Text too short")

        prompt = PromptTemplate(
            template=PLAN_READING_PROMPT + "\n{format_instructions}",
            input_variables=["name", "age", "education", "profession", "nationality", "nativa", "text"],
            partial_variables={"format_instructions": parser_plan.get_format_instructions()}
        )
        
        chain = prompt | llm | parser_plan
        
        result = chain.invoke({
            "name": request.profile.nome,
            "age": request.profile.idade,
            "education": request.profile.grau_de_instrucao,
            "profession": request.profile.profissao,
            "nationality": request.profile.nacionalidade,
            "nativa": request.profile.lingua_nativa,
            "text": request.raw_text[:15000] # Limit context window just in case
        })
        
        return result

    except Exception as e:
        print(f"Error in plan_reading: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ia/explain-word", response_model=schemas.ExplainWordResponse)
async def explain_word(request: schemas.ExplainWordRequest):
    if not llm:
        return {
            "definition": f"Mock definition for {request.word}",
            "example": f"This is a mock example for {request.word}.",
            "synonyms": ["mock1", "mock2"]
        }

    try:
        prompt = PromptTemplate(
            template=EXPLAIN_WORD_PROMPT + "\n{format_instructions}",
            input_variables=["word", "nativa", "education", "context"],
            partial_variables={"format_instructions": parser_explain.get_format_instructions()}
        )
        
        chain = prompt | llm | parser_explain
        
        result = chain.invoke({
            "word": request.word,
            "nativa": request.profile.lingua_nativa,
            "education": request.profile.grau_de_instrucao,
            "context": request.context
        })
        
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
# --- Prompts ---

PLAN_READING_PROMPT = """
You are an expert teacher helping a student understand a text.
The student profile is:
Name: {name}
Age: {age}
Education: {education}
Profession: {profession}
Nationality: {nationality}
Target Language: Portuguese (assuming the text is in Portuguese/English, adapt to the text language).

Analyze the following text and divide it into 3 to 7 logical reading stages using the Cornell Method.
For each stage, provide:
1. title: A short title.
2. objective: A learning objective adapted to the student's level.
3. stage_text: The exact excerpt of the text for this stage.
4. suggested_vocab: 5 to 15 key words with definitions in the student's native language ({nativa}).

Return the result as a JSON object with the key "stages" which is a list.

Text:
{text}
"""

EXPLAIN_WORD_PROMPT = """
Explain the word '{word}' for a student with the following profile:
Native Language: {nativa}
Education: {education}
Context: {context}

Provide a definition, an example sentence, and synonyms.
Return JSON: {{ "definition": "...", "example": "...", "synonyms": ["...", "..."] }}
"""

parser_plan = JsonOutputParser(pydantic_object=schemas.PlanReadingResponse)
parser_explain = JsonOutputParser(pydantic_object=schemas.ExplainWordResponse)

@app.post("/ia/plan-reading", response_model=schemas.PlanReadingResponse)
async def plan_reading(request: schemas.PlanReadingRequest):
    try:
        if not request.raw_text.strip():
             # Return empty or error? Let's return error or mock if text is too short
             if len(request.raw_text) < 10:
                 raise HTTPException(status_code=400, detail="Text too short")

        prompt = PromptTemplate(
            template=PLAN_READING_PROMPT + "\n{format_instructions}",
            input_variables=["name", "age", "education", "profession", "nationality", "nativa", "text"],
            partial_variables={"format_instructions": parser_plan.get_format_instructions()}
        )
        
        chain = prompt | llm | parser_plan
        
        result = chain.invoke({
            "name": request.profile.nome,
            "age": request.profile.idade,
            "education": request.profile.grau_de_instrucao,
            "profession": request.profile.profissao,
            "nationality": request.profile.nacionalidade,
            "nativa": request.profile.lingua_nativa,
            "text": request.raw_text[:15000] # Limit context window just in case
        })
        
        return result

    except Exception as e:
        print(f"Error in plan_reading: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ia/explain-word", response_model=schemas.ExplainWordResponse)
async def explain_word(request: schemas.ExplainWordRequest):
    try:
        prompt = PromptTemplate(
            template=EXPLAIN_WORD_PROMPT + "\n{format_instructions}",
            input_variables=["word", "nativa", "education", "context"],
            partial_variables={"format_instructions": parser_explain.get_format_instructions()}
        )
        
        chain = prompt | llm | parser_explain
        
        result = chain.invoke({
            "word": request.word,
            "nativa": request.profile.lingua_nativa,
            "education": request.profile.grau_de_instrucao,
            "context": request.context
        })
        
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
