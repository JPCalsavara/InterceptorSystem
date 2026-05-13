# UML - Diagrama de Caso de Uso

Diagrama de caso de uso do **InterceptorSystem** baseado no README: autenticacao SaaS, operacoes de seguranca patrimonial e fluxo conversacional de substituicao via WhatsApp.

```mermaid
flowchart LR
    classDef actor fill:#1f2937,stroke:#e5e7eb,color:#f9fafb,stroke-width:1px;
    classDef usecase fill:#111827,stroke:#f59e0b,color:#fbbf24,stroke-width:1.5px;
    classDef include fill:#111827,stroke:#22c55e,color:#86efac,stroke-width:1.2px;
    classDef ext fill:#111827,stroke:#60a5fa,color:#93c5fd,stroke-width:1.2px;
    classDef extactor fill:#0f172a,stroke:#cbd5e1,color:#e2e8f0,stroke-width:1px;

    CONTA[Administrador da Conta]:::actor
    OPERADOR[Operador de Operacoes]:::actor
    GESTOR[Gestor/Financeiro]:::actor
    COLAB[Colaborador via WhatsApp]:::actor

    META[Meta WhatsApp API]:::extactor
    SMTP[Servidor SMTP]:::extactor

    UC1((Registrar conta)):::usecase
    UC2((Autenticar login JWT)):::usecase
    UC3((Confirmar e-mail)):::include
    UC4((Gerenciar conta e plano)):::usecase
    UC5((Confirmar telefone via WhatsApp)):::ext

    UC6((Gerenciar clientes, postos e funcionarios)):::usecase
    UC7((Gerenciar contratos e tags)):::usecase
    UC8((Criar cliente completo em cascata)):::ext
    UC9((Lancar diarias em lote)):::usecase
    UC10((Aplicar regras de diaria)):::include
    UC11((Calcular valor total de contrato)):::usecase

    UC12((Processar webhook WhatsApp)):::usecase
    UC13((Conduzir conversa de substituicao)):::include
    UC14((Classificar substitutos por disponibilidade)):::include
    UC15((Cancelar sessao por comando global)):::ext

    UC16((Enviar e-mail transacional)):::include

    CONTA --> UC1
    CONTA --> UC2
    CONTA --> UC4
    CONTA --> UC11

    OPERADOR --> UC6
    OPERADOR --> UC7
    OPERADOR --> UC8
    OPERADOR --> UC9

    GESTOR --> UC11

    COLAB --> UC12

    UC1 -. include .-> UC3
    UC1 -. include .-> UC16
    UC4 -. extends .-> UC5

    UC8 -. extends .-> UC6
    UC9 -. include .-> UC10

    UC12 -. include .-> UC13
    UC12 -. include .-> UC14
    UC15 -. extends .-> UC13

    SMTP --> UC16
    META --> UC12
```

## Escopo do diagrama

- **Autenticacao e SaaS**: registro, login, verificacao de e-mail, gestao de conta/plano e telefone.
- **Operacoes core**: clientes, funcionarios, postos, contratos, tags, diarias e criacao em cascata.
- **Financeiro**: calculo de contrato por endpoint dedicado.
- **WhatsApp bot**: webhook, estado de conversa e ranking de substitutos.
