import re

with open('server.ts', 'r') as f:
    content = f.read()

# I will just write a simple parser to remove function readDb and function writeDb if they are synchronous
def remove_function(code, func_name):
    start = code.find(f"function {func_name}(")
    if start == -1:
        return code
    
    # Check if it's the async one
    # Wait, the async ones are `async function writeDb`
    # The old ones are `function writeDb(db: DbSchema) {`
    
    bracket_count = 0
    in_func = False
    end = start
    for i in range(start, len(code)):
        if code[i] == '{':
            if not in_func:
                in_func = True
            bracket_count += 1
        elif code[i] == '}':
            bracket_count -= 1
            if in_func and bracket_count == 0:
                end = i + 1
                break
    
    return code[:start] + code[end:]

content = remove_function(content, "readDb")
content = remove_function(content, "writeDb")
content = remove_function(content, "getBundledDbPath")

with open('server.ts', 'w') as f:
    f.write(content)

