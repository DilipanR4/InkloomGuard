import os
import hmac
import time
from typing import List, Set, Dict, Any, Optional
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from dotenv import load_dotenv

load_dotenv()


def load_service_token() -> str:
    token = os.getenv("AI_SERVICE_TOKEN", "").strip()
    if not token:
        raise RuntimeError("AI_SERVICE_TOKEN is required to start the AI service.")
    return token


def load_trusted_origins() -> List[str]:
    origins = [origin.strip() for origin in os.getenv("AI_ALLOWED_ORIGINS", "").split(",") if origin.strip()]
    if any("*" in origin for origin in origins):
        raise RuntimeError("AI_ALLOWED_ORIGINS must contain explicit origins; wildcard origins are not allowed.")
    return origins


SERVICE_TOKEN = load_service_token()
TRUSTED_ORIGINS = load_trusted_origins()

from app.schemas.review import (
    ReviewRequest,
    ReviewResponse,
    KnowledgePayload,
    FindingItem
)
from app.services.preprocessor import TextPreprocessor
from app.retrieval.vector_store import global_vector_index
from app.rules.rule_engine import DeterministicRuleEngine
from app.services.llm_reviewer import LLMReviewer
from app.validators.finding_validator import FindingValidator

app = FastAPI(
    title="Inkloom AI — Brand Governance AI Service",
    description="Intelligent pre-publication review engine grounded in brand knowledge and vector retrieval. Domain: https://inkloomguard.xyz",
    version="1.0.0"
)

# CORS is disabled for browsers unless exact trusted origins are configured.
app.add_middleware(
    CORSMiddleware,
    allow_origins=TRUSTED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
)

llm_reviewer = LLMReviewer()
bearer_auth = HTTPBearer(auto_error=False)


def require_service_auth(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_auth),
):
    supplied = credentials.credentials if credentials and credentials.scheme.lower() == "bearer" else ""
    if not hmac.compare_digest(supplied.encode("utf-8"), SERVICE_TOKEN.encode("utf-8")):
        raise HTTPException(status_code=401, detail="Invalid or missing service credentials.")

@app.get("/")
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Inkloom AI / AI Review Engine",
        "brand_identity": "InkloomGuard",
        "domain": "https://inkloomguard.xyz",
        "gemini_configured": llm_reviewer.is_configured(),
        "indexed_chunks": len(global_vector_index.chunks)
    }

@app.post("/v1/index", dependencies=[Depends(require_service_auth)])
def index_knowledge(payload: KnowledgePayload):
    """
    Indexes or updates guidelines and facts into the retrieval vector space.
    """
    guidelines_dicts = [g.model_dump() for g in payload.guidelines]
    facts_dicts = [f.model_dump() for f in payload.facts]
    
    total_indexed = global_vector_index.build_index(guidelines_dicts, facts_dicts)
    return {
        "success": True,
        "message": f"Successfully indexed {total_indexed} knowledge chunks into vector store.",
        "chunks_count": total_indexed
    }

@app.post("/v1/review", response_model=ReviewResponse, dependencies=[Depends(require_service_auth)])
def review_content(request: ReviewRequest):
    """
    End-to-end Brand Governance Review Pipeline:
    1. Preprocess & redact sensitive data
    2. Synchronize vector store with provided knowledge
    3. Run deterministic terminology rules
    4. Retrieve relevant guidelines & facts via vector similarity
    5. Run LLM tone, claim, and messaging review
    6. Validate citations, excerpts, and evidence statuses
    7. Compute governance score
    """
    start_time = time.time()

    # 1. Preprocess Text
    cleaned_text = TextPreprocessor.clean_and_normalize(request.submitted_text)
    if not cleaned_text:
        raise HTTPException(status_code=400, detail="Submitted content text cannot be empty.")

    redacted_text, redactions = TextPreprocessor.redact_pii(cleaned_text)

    # Collect knowledge items
    knowledge = request.knowledge
    guidelines_list = [g.model_dump() for g in knowledge.guidelines] if knowledge else []
    terminology_list = [t.model_dump() for t in knowledge.terminology] if knowledge else []
    facts_list = [f.model_dump() for f in knowledge.facts] if knowledge else []

    # Valid Source IDs Set
    valid_source_ids: Set[str] = set()
    for g in guidelines_list:
        valid_source_ids.add(g.get("id"))
    for t in terminology_list:
        valid_source_ids.add(t.get("id"))
    for f in facts_list:
        valid_source_ids.add(f.get("id"))

    # 2. Update Vector Store
    if guidelines_list or facts_list:
        global_vector_index.build_index(guidelines_list, facts_list)

    findings: List[FindingItem] = []

    # 3. Deterministic Rules (Terminology & exact brand spelling)
    deterministic_findings = DeterministicRuleEngine.evaluate_terminology(
        request.submitted_text,
        terminology_list
    )
    findings.extend(deterministic_findings)

    # Deterministic tone & exclamation checks
    tone_heuristics = DeterministicRuleEngine.evaluate_formatting_and_tone_heuristics(
        request.submitted_text,
        guidelines_list
    )
    findings.extend(tone_heuristics)

    # 4. Vector Retrieval for Content (grounded on sanitized text without PII)
    retrieved_chunks = global_vector_index.retrieve(redacted_text, top_k=5)

    # 5. LLM Tone & Claim Analysis (strictly receives redacted text only)
    llm_findings = llm_reviewer.analyze_content(
        submitted_text=redacted_text,
        content_type=request.content_type or "General Marketing",
        retrieved_context=retrieved_chunks,
        all_guidelines=guidelines_list,
        all_facts=facts_list
    )

    # Restore any redaction placeholders in excerpts/suggestions back to original text
    if redactions:
        llm_findings = TextPreprocessor.restore_pii_in_findings(
            findings=llm_findings,
            original_text=request.submitted_text,
            redactions=redactions
        )
    findings.extend(llm_findings)

    # 6. Verification and Validation Layer
    prohibited_terms = []
    for t in terminology_list:
        prohibited_terms.extend(t.get("prohibited_terms", []))

    validated_findings = FindingValidator.validate_findings(
        findings=findings,
        submitted_text=request.submitted_text,
        valid_source_ids=valid_source_ids,
        approved_facts=facts_list,
        prohibited_terms=prohibited_terms,
        redacted_text=redacted_text,
        redactions=redactions
    )

    # 7. Calculate Governance Health Score (0 - 100)
    penalty = 0
    for f in validated_findings:
        if f.severity == "high":
            penalty += 25
        elif f.severity == "medium":
            penalty += 15
        elif f.severity == "low":
            penalty += 8
        else:
            penalty += 4

    governance_score = max(10, min(100, 100 - penalty))
    processing_time_ms = round((time.time() - start_time) * 1000, 2)

    return ReviewResponse(
        content_id=request.content_id,
        version_number=request.version_number,
        governance_score=governance_score,
        findings=validated_findings,
        processing_metadata={
            "engine": "inkloom_hybrid_rag",
            "processing_time_ms": processing_time_ms,
            "pii_redacted_count": len(redactions),
            "retrieved_context_count": len(retrieved_chunks),
            "total_findings": len(validated_findings),
            "brand_identity": "InkloomGuard"
        }
    )
