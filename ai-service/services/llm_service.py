from langchain_google_genai import ChatGoogleGenerativeAI
from core.config import settings

# Instância base do LLM usando a chave de ambiente do Gemini
llm = ChatGoogleGenerativeAI(
    google_api_key=settings.gemini_api_key,
    model=settings.model_name,
    temperature=0.3
)

async def process_support_message(message: str, tenant_id: str) -> str:
    """
    Processa a mensagem via LLM, simulando um RAG simples.
    Para um banco de Q&A pequeno, futuramente injetaremos o ChromaDB aqui.
    """
    
    # Previne que o Docker quebre localmente se a API Key real não estiver no .env
    if settings.gemini_api_key == "mock-key" or not settings.gemini_api_key:
        return (f"[Modo Dev / Sem Chave Gemini] Olá! Percebi que sua dúvida é: '{message}'. "
                "Para testar o fluxo real, adicione sua GEMINI_API_KEY no arquivo ai-service/.env.")
    
    try:
        # TODO: Implementar busca no banco vetorial ChromaDB
        # documents = vector_store.similarity_search(message, filter={"tenant_id": tenant_id})
        # context = "\n".join([doc.page_content for doc in documents])
        
        prompt = (
            f"Você é um assistente virtual prestativo do setor de Recursos Humanos. "
            f"Responda à dúvida do funcionário de forma empática e direta.\n\n"
            f"Dúvida do usuário: {message}"
        )
        
        response = await llm.ainvoke(prompt)
        return response.content
    except Exception as e:
        return f"Desculpe, tive uma instabilidade na minha rede neural ao buscar a resposta: {str(e)}"
