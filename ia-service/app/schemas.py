from pydantic import BaseModel
from typing import List, Optional

class Profile(BaseModel):
    nome: str
    idade: int
    grau_de_instrucao: str
    profissao: str
    nacionalidade: str
    lingua_nativa: str

class PlanReadingRequest(BaseModel):
    profile: Profile
    raw_text: str

class VocabItem(BaseModel):
    word: str
    definition: str

class Stage(BaseModel):
    title: str
    objective: str
    stage_text: str
    suggested_vocab: List[VocabItem]

class PlanReadingResponse(BaseModel):
    stages: List[Stage]

class ExplainWordRequest(BaseModel):
    profile: Profile
    word: str
    context: str

class ExplainWordResponse(BaseModel):
    definition: str
    example: str
    synonyms: List[str]
