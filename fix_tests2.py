import os
import re

dir_path = "backend/src/InterceptorSystem.Tests"
for root, _, files in os.walk(dir_path):
    for file in files:
        if file.endswith(".cs"):
            filepath = os.path.join(root, file)
            with open(filepath, 'r') as f:
                content = f.read()
            
            new_content = re.sub(r'new CreatePostoInput\(\s*([^,]+),', r'new CreatePostoInput(\1, Guid.NewGuid(),', content)
            
            if "ClienteOrquestradorServiceTests.cs" in file:
                new_content = re.sub(
                    r'new ClienteOrquestradorService\(\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^,]+),\s*([^)]+)\)',
                    r'new ClienteOrquestradorService(\1, \2, \3, \4, new Moq.Mock<InterceptorSystem.Application.BoundedContexts.Operacoes.Interfaces.IFuncionarioAppService>().Object, \5, \6)',
                    new_content
                )
                
            if content != new_content:
                with open(filepath, 'w') as f:
                    f.write(new_content)
