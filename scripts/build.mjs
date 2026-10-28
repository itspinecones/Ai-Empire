import { mkdir, cp, rm } from 'node:fs/promises';
await rm('dist', {recursive:true,force:true});
await mkdir('dist/src', { recursive: true });
await cp('index.html', 'dist/index.html');
await cp('src', 'dist/src', { recursive: true });
console.log('Built repaired baseline in dist/. No deployment performed.');

await cp('assets', 'dist/assets', { recursive: true });
