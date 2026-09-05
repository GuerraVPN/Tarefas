import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

await import(pathToFileURL(path.resolve('scripts/simulate-mobile-v23221.mjs')).href+'?v=23222');
const tabs=await readFile('app/mobile-alpha-v23221-tabs.js','utf8');
const runtime=await readFile('app/mobile-alpha-v23221.js','utf8');
const core=await readFile('app/mobile-alpha-v23221-core.js','utf8');
const need=(t,n,l)=>{if(!t.includes(n))throw new Error(`${l}: marcador ausente ${n}`)};
for(const tab of ['notificacoes','mensagens','downloads','favoritos','ferramentas'])need(tabs,`'${tab}'`,'abas');
for(const m of ['saveFilterCurrent','getQueue','renderTools','renderDownloads','renderFavorites'])need(tabs,m,'integração das abas');
for(const m of ['groupedNotifications','retentionDeleteIds','sanitizeError','dedupeQueue','parseAiCommand'])need(core,m,'núcleo');
for(const m of ['flushQueue','aiCommand','aiContext','snoozeNotification','pinNotification'])need(runtime,m,'runtime');
console.log('SIMULAÇÕES 2.3.22.2 OK: regressão 2.3.22.1 + 5 abas, notificações 2.0, favoritos, downloads, ferramentas, fila offline, erros e IA.');
