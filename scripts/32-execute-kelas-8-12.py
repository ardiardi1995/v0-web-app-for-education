#!/usr/bin/env python3
import subprocess
import os

DATABASE_URL = os.getenv('DATABASE_URL')
SQL_FILE = '/tmp/kelas_8_12.sql'

print('[v0] Executing SQL file to insert Kelas 8-12 videos...')

try:
    result = subprocess.run(
        ['psql', DATABASE_URL, '-f', SQL_FILE],
        capture_output=True,
        text=True,
        timeout=300
    )
    
    if result.returncode == 0:
        print('[v0] ✓ Successfully inserted Kelas 8-12 videos!')
        print(f'[v0] Output: {result.stdout[:200]}')
    else:
        print(f'[v0] Error: {result.stderr[:200]}')
        exit(1)
        
except FileNotFoundError:
    print('[v0] psql not found')
    exit(1)
except Exception as e:
    print(f'[v0] Error: {e}')
    exit(1)
