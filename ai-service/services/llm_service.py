async def process_support_message(message: str, tenant_id: str) -> str:
    """
    Simula a orquestração do LangChain/OpenAI.
    No futuro, faremos:
    1. Recuperar contexto do Tenant (RAG).
    2. Chamar o modelo com um prompt humanizado.
    """
    
    # Mock inicial focado na humanização do WhatsApp
    return f"Olá! Entendi que você precisa de ajuda com '{message}'. " \
           f"Nossa IA está sendo estruturada para consultar os dados da empresa (Tenant {tenant_id}) " \
           f"e te dar uma resposta baseada nas suas políticas internas em breve!"
