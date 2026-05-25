from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.llm_service import process_support_message

router = APIRouter()

# Data Transfer Objects usando Pydantic
class SupportRequest(BaseModel):
    phone_number: str
    tenant_id: str
    message: str

class SupportResponse(BaseModel):
    reply: str

@router.post("/", response_model=SupportResponse)
async def ask_support(request: SupportRequest) -> SupportResponse:
    """
    Recebe a requisição do C# (Webhook do WhatsApp) e processa a intenção com IA.
    """
    try:
        reply = await process_support_message(request.message, request.tenant_id)
        return SupportResponse(reply=reply)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno de IA: {str(e)}")
