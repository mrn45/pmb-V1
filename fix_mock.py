import re

with open('src/mockApi.ts', 'r') as f:
    content = f.read()

replacement = """
  const originalFetch = window.fetch;
  Object.defineProperty(window, 'fetch', {
    value: async (...args: any[]) => {
"""

content = content.replace("  const originalFetch = window.fetch;\n  window.fetch = async (...args) => {", replacement)
content = content.replace("    return originalFetch(...args);\n  };\n}", "    return originalFetch(...args);\n  }\n  });\n}")

with open('src/mockApi.ts', 'w') as f:
    f.write(content)
