from fastapi import FastAPI
from routers import support

app = FastAPI(
    title="InterceptorSystem AI Service",
    description="Serviço de Inteligência Artificial para RAG e suporte via WhatsApp",
    version="1.0.0"
)

# Adiciona o roteador focado no fluxo do WhatsApp (Suporte)
app.include_router(support.router, prefix="/api/support", tags=["WhatsApp Support"])

@app.get("/health")
def health_check() -> dict:
    return {"status": "ok", "service": "ai-service"}
