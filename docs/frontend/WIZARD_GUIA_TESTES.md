# 🧪 GUIA RÁPIDO DE TESTE - WIZARD CONDOMÍNIO COMPLETO
## 📍 URL de Acesso
http://localhost:4200/condominios/criar-completo
## ✅ TESTE COMPLETO (Com Contrato)
### STEP 1: Condomínio
- Nome: Condomínio Teste Wizard
- CNPJ: 99.888.777/0001-66
- Endereço: Av. Paulista, 1000
- Postos: 2
- Funcionários/Posto: 2
- Horário: 06:00
- Email: gestor@teste.com
- Telefone: (11) 98765-4321
### STEP 2: Contrato
☑️ Marcar "Criar contrato neste momento"
- Diária: 100.00
- Benefícios: 350.00
- Impostos: 15%
- Lucro: 15%
- Faltas: 10%
- Duração: 6 meses
### STEP 3: Funcionários
(Pular - opcional)
### Resultado Esperado
✅ Console: Payload enviado
✅ Console: Resposta recebida
✅ Redirecionamento para /condominios/{id}
✅ Dashboard mostra condomínio + contrato + 2 postos
## 🔍 Debugging
### Ver Payload (F12 → Console)
📤 Payload enviado para /api/condominios-completos
### Ver Erros
❌ Status: 400
❌ Error body: { error: "...", message: "..." }
## ✅ Checklist
- [ ] Wizard abre
- [ ] Validações funcionam
- [ ] Cálculos automáticos corretos
- [ ] Submit envia payload
- [ ] Redirecionamento OK
