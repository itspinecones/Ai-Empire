import { mkdir, cp } from 'node:fs/promises';
await mkdir('dist/src', { recursive: true });
await cp('index.html', 'dist/index.html');
await cp('src', 'dist/src', { recursive: true });
console.log('Built repaired baseline in dist/. No deployment performed.');
