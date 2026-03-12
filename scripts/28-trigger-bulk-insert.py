#!/usr/bin/env python3
import urllib.request
import json

print('[v0] Triggering bulk insert via API endpoint')

url = 'http://localhost:3000/api/bulk-insert'

try:
    req = urllib.request.Request(url, method='POST')
    req.add_header('Content-Type', 'application/json')
    
    with urllib.request.urlopen(req, timeout=600) as response:
        data = json.loads(response.read().decode())
        print(f'[v0] Response: {data}')
        if data.get('success'):
            print(f'[v0] Total videos now: {data.get("totalVideos")}')
except Exception as e:
    print(f'[v0] Error: {e}')
    print('[v0] Note: Make sure the app is running on localhost:3000')
