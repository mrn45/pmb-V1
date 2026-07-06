import re

with open('server.ts', 'r') as f:
    content = f.read()

# Make routes async
content = re.sub(r'app\.(get|post|put|delete)\("([^"]+)",\s*(authenticate,\s*)?\(req,\s*res\)\s*=>\s*\{', r'app.\1("\2", \3async (req, res) => {', content)

# Replace readDb and writeDb
content = content.replace('const db = readDb();', 'const db = await readDb();')
content = content.replace('writeDb(db);', 'await writeDb(db);')

# Fix a specific case with authenticate
content = re.sub(r'app\.(get|post|put|delete)\("([^"]+)",\s*authenticate,\s*async\s*\(req,\s*res\)\s*=>\s*\{', r'app.\1("\2", authenticate, async (req, res) => {', content)

# Write back
with open('server.ts', 'w') as f:
    f.write(content)
