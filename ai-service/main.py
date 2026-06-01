from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import support

app = FastAPI(
    title="InterceptorSystem AI Service",
    description="Serviço de Inteligência Artificial para RAG e suporte via WhatsApp",
    version="1.0.0"
)

# Adiciona CORS para permitir requisições do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Adiciona o roteador focado no fluxo do WhatsApp (Suporte)
app.include_router(support.router, prefix="/api/support", tags=["WhatsApp Support"])

@app.get("/health")
def health_check() -> dict:
    return {"status": "ok", "service": "ai-service"}
