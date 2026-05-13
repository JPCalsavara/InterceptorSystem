import re

with open("build_output.txt", "r") as f:
    lines = f.readlines()

fixes = {}

for line in lines:
    if "CS0854" in line:
        m = re.match(r"^(.*?\.cs)\((\d+),(\d+)\): error CS0854", line)
        if m:
            file_path = m.group(1)
            line_num = int(m.group(2))
            if file_path not in fixes: fixes[file_path] = []
            fixes[file_path].append(line_num - 1)

for file_path, line_nums in fixes.items():
    with open(file_path, "r") as f: content_lines = f.readlines()
        
    for l_idx in sorted(set(line_nums)):
        text = content_lines[l_idx]
        for method in ["GetByIdAsync", "GetByCpfAsync", "GetByContratoIdAsync", "ExisteContratoVigenteAsync", "ExisteDiariaNaDataAsync", "GetAtivosByClienteIdAsync", "GetAllAsync", "CommitAsync", "UpdateStatusAsync", "CreateAsync", "CreateBatchAsync", "UpdateAsync"]:
            if method + "(" in text and "CancellationToken" not in text:
                idx = text.find(method + "(")
                start_args = idx + len(method) + 1
                paren_count = 1
                end_args = start_args
                while end_args < len(text) and paren_count > 0:
                    if text[end_args] == '(': paren_count += 1
                    elif text[end_args] == ')': paren_count -= 1
                    end_args += 1
                end_args -= 1
                
                args_str = text[start_args:end_args]
                if args_str.strip() == "": insertion = "It.IsAny<CancellationToken>()"
                else: insertion = ", It.IsAny<CancellationToken>()"
                    
                text = text[:end_args] + insertion + text[end_args:]
                content_lines[l_idx] = text

    with open(file_path, "w") as f: f.writelines(content_lines)

# Also fix .Verify for the methods that don't throw CS0854
files = [
    "Unity/ClienteAppServiceUnityTests.cs",
    "Unity/DiariaBatchAppServiceTests.cs",
    "Unity/PostoAppServiceTests.cs",
    "Unity/FuncionarioAppServiceTests.cs",
    "Unity/DiariaAppServiceTests.cs",
    "Unity/ContratoAppServiceTests.cs",
    "Unity/ClienteOrquestradorServiceTests.cs"
]
for file_name in files:
    try:
        with open(file_name, "r") as f: content_lines = f.readlines()
        for i, text in enumerate(content_lines):
            if ".Verify" in text and "CancellationToken" not in text:
                for method in ["GetByIdAsync", "GetByCpfAsync", "GetByContratoIdAsync", "ExisteContratoVigenteAsync", "ExisteDiariaNaDataAsync", "GetAtivosByClienteIdAsync", "GetAllAsync", "CommitAsync"]:
                    if method + "(" in text:
                        idx = text.find(method + "(")
                        start_args = idx + len(method) + 1
                        paren_count = 1
                        end_args = start_args
                        while end_args < len(text) and paren_count > 0:
                            if text[end_args] == '(': paren_count += 1
                            elif text[end_args] == ')': paren_count -= 1
                            end_args += 1
                        end_args -= 1
                        args_str = text[start_args:end_args]
                        if args_str.strip() == "": insertion = "It.IsAny<CancellationToken>()"
                        else: insertion = ", It.IsAny<CancellationToken>()"
                        text = text[:end_args] + insertion + text[end_args:]
                        content_lines[i] = text
        with open(file_name, "w") as f: f.writelines(content_lines)
    except Exception: pass
