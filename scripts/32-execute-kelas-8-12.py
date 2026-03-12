#!/usr/bin/env python3
import urllib.request
import json
import os
import time

print('[v0] Inserting Kelas 8-12 videos via database...')

DATABASE_URL = os.getenv('DATABASE_URL')

if not DATABASE_URL:
    print('[v0] ERROR: DATABASE_URL not set')
    exit(1)

# Try to read and execute SQL file directly using urllib
sql_file = '/tmp/kelas_8_12.sql'

try:
    with open(sql_file, 'r') as f:
        sql_content = f.read()
    
    # Extract INSERT statements
    statements = [s.strip() for s in sql_content.split(';') if s.strip()]
    print(f'[v0] Loaded {len(statements)} SQL statements')
    
    # Try using curl to execute via psql if available
    import subprocess
    
    try:
        # First try: check if psql available
        result = subprocess.run(['which', 'psql'], capture_output=True)
        if result.returncode == 0:
            print('[v0] psql found, executing SQL file...')
            result = subprocess.run(
                ['psql', DATABASE_URL, '-f', sql_file],
                capture_output=True,
                text=True,
                timeout=300
            )
            if result.returncode == 0:
                print('[v0] ✓ Successfully inserted Kelas 8-12 videos via psql!')
                exit(0)
    except:
        pass
    
    # If psql not available, try using curl to localhost endpoint
    print('[v0] Trying via HTTP endpoint...')
    try:
        req = urllib.request.Request(
            'http://localhost:3000/api/bulk-insert',
            method='POST',
            headers={'Content-Type': 'application/json'}
        )
        with urllib.request.urlopen(req, timeout=30) as response:
            result = json.loads(response.read().decode())
            print(f'[v0] ✓ Inserted via endpoint: {result}')
            exit(0)
    except:
        print('[v0] Endpoint not available')
    
    # Fallback: print instructions
    print('[v0] Manual execution required:')
    print(f'[v0] psql $DATABASE_URL -f {sql_file}')
    print('[v0] Or copy SQL from: /tmp/kelas_8_12.sql')
    
except Exception as e:
    print(f'[v0] Error: {e}')
    exit(1)
