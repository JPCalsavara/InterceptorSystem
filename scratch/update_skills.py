import os

skills_dir = '.agents/skills'

integracoes_text = """
## Integrações
- Delega commits e PRs para o **git-flow**.
- Delega tratativas de erro para o **bug-workflow**.
- (Se aplicável) Delega testes para **backend-test-workflow** ou **frontend-test-workflow**.
"""

regras_text = """
## Regras Críticas (Guardrails)
- O output deve seguir os padrões arquiteturais de Clean Architecture, Single-File Components (no frontend) e Fail-Fast (no backend).
- Mantenha o escopo isolado da tarefa.
"""

for root, dirs, files in os.walk(skills_dir):
    for file in files:
        if file == 'SKILL.md':
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()
            
            needs_update = False
            if '## Integrações' not in content:
                content += integracoes_text
                needs_update = True
            
            if '## Regras Críticas (Guardrails)' not in content and '## Regras Críticas' not in content:
                content += regras_text
                needs_update = True
                
            if needs_update:
                with open(filepath, 'w') as f:
                    f.write(content)
                print(f"Updated {filepath}")
