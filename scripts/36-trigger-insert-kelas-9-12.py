#!/usr/bin/env python3
import urllib.request
import json

print('[v0] Triggering Kelas 9-12 insert endpoint...')

urls = [
    'http://localhost:3000/api/insert-kelas-9-12',
    'http://127.0.0.1:3000/api/insert-kelas-9-12',
]

for url in urls:
    try:
        print(f'[v0] Trying {url}')
        req = urllib.request.Request(url, method='POST', headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req, timeout=60) as response:
            result = json.loads(response.read().decode())
            print(f'[v0] ✓ Success!')
            print(f'[v0] Response: {result}')
            exit(0)
    except Exception as e:
        print(f'[v0] Failed: {str(e)[:80]}')

print('[v0] Could not trigger endpoint via HTTP')
print('[v0] Please manually call: curl -X POST http://localhost:3000/api/insert-kelas-9-12')
