import re

with open('server.ts', 'r') as f:
    content = f.read()

content = content.replace("function seedDatabase(): DbSchema {", "async function seedDatabase(): Promise<DbSchema> {")
content = content.replace("const seeded = seedDatabase();", "const seeded = await seedDatabase();")

with open('server.ts', 'w') as f:
    f.write(content)

