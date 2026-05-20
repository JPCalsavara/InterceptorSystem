import os
import re

dir_path = "frontend/src/app"
for root, _, files in os.walk(dir_path):
    for file in files:
        if file.endswith(".spec.ts"):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()
            
            # Find objects that have `clienteId: '...'` or similar, and check if it's a Posto mock.
            # E.g. `{ id: 'p1', clienteId: 'c1', nome: 'Posto 1',`
            new_content = re.sub(
                r"(clienteId:\s*['\"][^'\"]+['\"])(,)",
                r"\1, contratoId: 'mock-contrato',",
                content
            )
            
            if content != new_content:
                with open(filepath, 'w') as f:
                    f.write(new_content)
