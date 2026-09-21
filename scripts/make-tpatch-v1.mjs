import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const [, , specArg, outArg] = process.argv;
if(!specArg)throw new Error('Uso: node scripts/make-tpatch-v1.mjs <spec.json> [saida.tpatch]');

const specPath=path.resolve(specArg);
const spec=JSON.parse(await readFile(specPath,'utf8'));
const baseDir=path.dirname(specPath);
const readOptional=async rel=>rel?readFile(path.resolve(baseDir,rel),'utf8'):'';
const payload={js:await readOptional(spec.jsFile),css:await readOptional(spec.cssFile)};
const payloadSha256=crypto.createHash('sha256').update(JSON.stringify(payload),'utf8').digest('hex');

const patch={
  format:'tarefas-tpatch-v1',
  id:String(spec.id||''),
  name:String(spec.name||''),
  patchVersion:Number(spec.patchVersion||1),
  createdAt:spec.createdAt||new Date().toISOString(),
  baseVersion:String(spec.baseVersion||'2.3.23.1'),
  minBuild:Number(spec.minBuild||270),
  maxBuild:spec.maxBuild==null?270:Number(spec.maxBuild),
  channel:String(spec.channel||'alpha'),
  cumulative:spec.cumulative===true,
  replacementMode:String(spec.replacementMode||(spec.cumulative?'replace-older-same-base':'')),
  replaces:Array.isArray(spec.replaces)?spec.replaces.map(String):[],
  description:String(spec.description||''),
  changelog:Array.isArray(spec.changelog)?spec.changelog.map(String):[],
  order:Number(spec.order||Date.now()),
  payload,
  payloadSha256
};
if(!/^[A-Za-z0-9._-]{3,80}$/.test(patch.id))throw new Error('ID inválido.');
if(!patch.name)throw new Error('Nome ausente.');
const out=path.resolve(outArg||patch.id+'.tpatch');
const text=JSON.stringify(patch,null,2)+'\n';
await writeFile(out,text,'utf8');
const fileSha256=crypto.createHash('sha256').update(text,'utf8').digest('hex');
console.log(JSON.stringify({file:out,id:patch.id,payloadSha256,fileSha256},null,2));
