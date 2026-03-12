#!/usr/bin/env python3
import urllib.request
import json
import os

# Get app URL from environment or use localhost
APP_URL = os.getenv('VERCEL_URL') or 'http://localhost:3000'

print('[v0] Triggering bulk insert endpoint...')
print(f'[v0] Target: {APP_URL}/api/bulk-insert')

try:
    # Create POST request to bulk insert endpoint
    req = urllib.request.Request(
        f'{APP_URL}/api/bulk-insert',
        method='POST',
        headers={'Content-Type': 'application/json'}
    )
    
    with urllib.request.urlopen(req, timeout=600) as response:
        result = json.loads(response.read().decode())
        print('[v0] Response:', result)
        
        if result.get('success'):
            print(f'[v0] Success! Inserted {result.get("totalInserted", 0)} videos')
            print(f'[v0] Total videos in database: {result.get("totalVideos", 0)}')
        else:
            print(f'[v0] Error: {result.get("message", "Unknown error")}')
            
except Exception as e:
    print(f'[v0] Error: {e}')
    exit(1)
