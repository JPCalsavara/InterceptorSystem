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
        
        # Contexto base fixo simulando o RAG enquanto ChromaDB não está ativado
        system_context = """
Base de Conhecimento do InterceptorSystem:
1. O InterceptorSystem é um sistema SaaS de gestão operacional para empresas de segurança patrimonial.
2. Navegação Básica:
   - Dashboard: Visão financeira e status geral.
   - Clientes e Contratos: Gerencia dados dos clientes e define margens de lucro. Contratos vencidos mudam de status automaticamente.
   - Postos e Funcionários: Postos têm turnos de 12 horas. Funcionários devem ter CPF único.
   - Diárias: Permite gerenciar a alocação (escala). Pode ser visualizada em lista, semanal ou mensal (calendário).
3. Regras Importantes:
   - Substituições podem ser feitas pelo sistema ou automaticamente pelo bot do WhatsApp.
   - Funcionários não podem trabalhar dias seguidos sem descanso obrigatório, exceto quando marcado como 'Dobra Programada'.
   - O faturamento dos contratos é calculado com base nas Tags: Custo Total × (1 + Margens).
"""

        prompt = (
            f"Você é a IA assistente oficial do InterceptorSystem. Seu objetivo é ajudar os usuários (gestores e supervisores) "
            f"a tirar dúvidas sobre as regras de negócio da empresa e a navegar no sistema.\n"
            f"Seja claro, profissional e proativo. Baseie-se APENAS no contexto fornecido.\n\n"
            f"{system_context}\n"
            f"Dúvida do usuário: {message}\n"
            f"Sua resposta:"
        )
        
        response = await llm.ainvoke(prompt)
        return response.content
    except Exception as e:
        return f"Desculpe, tive uma instabilidade na minha rede neural ao buscar a resposta: {str(e)}"
