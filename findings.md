# Findings: Correções de Estado Frontend

## 1. HTTP Flood no Frontend
Foi identificado que o serviço `EntityCacheCoordinatorService` na função `invalidateAll()` estava percorrendo a lista de chaves cadastradas e emitindo individualmente, e logo em seguida emitindo `'all'`. Como não existia um debounce na `SidebarComponent`, o `loadCounts()` (que dispara 6 observables HTTP em paralelo) era chamado 8 vezes seguidas, resultando em até 48 chamadas simultâneas à API local, resultando em exaustão do limite de conexões do browser e cancelamento silencioso de chamadas. Isso causou tanto a não atualização dos contadores quanto a falha da recarga da tela de clientes.

## 2. Serialização de Enums
Há variação de como os enums de `StatusContrato` são tratados na UI baseada na serialização via `System.Text.Json`. O `StatusContrato.ATIVO` precisa de tolerância explícita a formato String (uppercase) ou int no frontend para que a Sidebar seja blindada contra perdas de informação ao calcular os totais.
