import os

files = [
    "Unity/ClienteAppServiceUnityTests.cs",
    "Unity/DiariaBatchAppServiceTests.cs",
    "Unity/PostoAppServiceTests.cs",
    "Unity/FuncionarioAppServiceTests.cs",
    "Unity/DiariaAppServiceTests.cs",
    "Unity/ContratoAppServiceTests.cs",
    "Unity/ClienteOrquestradorServiceTests.cs"
]

methods_to_fix = [
    "GetByIdAsync",
    "GetByCpfAsync",
    "GetByContratoIdAsync",
    "ExisteContratoVigenteAsync",
    "ExisteDiariaNaDataAsync",
    "GetAtivosByClienteIdAsync",
    "GetAllAsync",
    "CommitAsync"
]

for file_name in files:
    if not os.path.exists(file_name): continue
    with open(file_name, "r") as f: content = f.read()
    
    for method in methods_to_fix:
        # We need to find `method(` and insert `, It.IsAny<CancellationToken>()` before its closing parenthesis.
        # But only if it doesn't already have CancellationToken!
        
        idx = 0
        while True:
            idx = content.find(method + "(", idx)
            if idx == -1: break
            
            start_args = idx + len(method) + 1
            # find matching parenthesis
            paren_count = 1
            end_args = start_args
            while end_args < len(content) and paren_count > 0:
                if content[end_args] == '(': paren_count += 1
                elif content[end_args] == ')': paren_count -= 1
                end_args += 1
                
            end_args -= 1 # points to the closing ')'
            
            args_str = content[start_args:end_args]
            if "CancellationToken" not in args_str:
                if args_str.strip() == "":
                    insertion = "It.IsAny<CancellationToken>()"
                else:
                    insertion = ", It.IsAny<CancellationToken>()"
                
                content = content[:end_args] + insertion + content[end_args:]
                idx = end_args + len(insertion)
            else:
                idx = end_args
                
    with open(file_name, "w") as f: f.write(content)
