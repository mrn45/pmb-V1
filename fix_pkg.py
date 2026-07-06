import json

with open('package.json', 'r') as f:
    data = json.load(f)

data['scripts']['dev'] = "vite"
data['scripts']['build'] = "tsc -b && vite build"
data['scripts']['preview'] = "vite preview"
if 'start' in data['scripts']:
    del data['scripts']['start']

with open('package.json', 'w') as f:
    json.dump(data, f, indent=2)

