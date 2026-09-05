import { appendFile, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root=process.cwd();
await import(pathToFileURL(path.resolve('scripts/build-mobile-v2320.mjs')).href+'?v=23201');
const dist=path.join(root,'dist');
async function patch(rel,fn){const p=path.join(dist,rel);let s=await readFile(p,'utf8');const before=s;s=fn(s);if(s===before)console.warn(`[2.3.20.1] sem alteração em ${rel}`);await writeFile(p,s,'utf8');}

// 2.3.20.1 / build 253. Hotfix final de Downloads do Aditamento.
for(const name of await readdir(dist)){
  if(!/\.(?:html|js|css|webmanifest)$/i.test(name))continue;
  const p=path.join(dist,name);let s=await readFile(p,'utf8');
  s=s.replaceAll('2.3.20','2.3.20.1').replaceAll('b252','b253');
  await writeFile(p,s,'utf8');
}
await patch('mobile-bootstrap.js',s=>s.replace('const APP_BUILD = 252;','const APP_BUILD = 253;'));
await patch('mobile-preload.js',s=>s.replace("tarefasAppBuild = '252'","tarefasAppBuild = '253'"));
await patch('mobile-updates-v181.js',s=>s.replace('const APP_BUILD = 252;','const APP_BUILD = 253;'));
await patch('mobile-schema-v239.js',s=>s.replace('build:252','build:253'));

// Aditamento PDF: no Android, não depende mais do anchor blob:/FileSaver.
// O site continua usando doc.save() normalmente.
await patch('aditamento_v74.js',s=>{
  const old=`    window.__TAREFAS_LAST_BLOB_SAVE_PROMISE__=null;\n    let siteSaveError=null;\n    try{doc.save(filename)}catch(saveError){siteSaveError=saveError}\n    if(siteSaveError){\n      console.warn('doc.save falhou; usando fallback de Blob.',siteSaveError);\n      const blob=doc.output('blob'),url=URL.createObjectURL(blob),a=document.createElement('a');\n      a.href=url;a.download=filename;a.target='_blank';a.rel='noopener';document.body.appendChild(a);a.click();a.remove();\n      setTimeout(()=>URL.revokeObjectURL(url),60000);\n    }\n    const pendingSave=window.__TAREFAS_LAST_BLOB_SAVE_PROMISE__;\n    if(pendingSave){const saved=await pendingSave;if(saved?.canceled)throw new Error('Salvamento cancelado pelo usuário.');}\n    console.info('[ADITAMENTO 243] PDF gerado pelo fluxo do site e encaminhado ao Salvar como',filename);`;
  const next=`    if(window.TarefasNative?.files?.saveBlob){\n      const saved=await saveAditamentoBlob(doc.output('blob'),filename);\n      if(!(saved?.ok||saved?.saved||saved?.path))throw new Error('O Android não confirmou o Aditamento em Downloads/TAREFAS.');\n      console.info('[ADITAMENTO 253] PDF salvo diretamente em Downloads/TAREFAS',saved?.path||filename);\n    }else{\n      let siteSaveError=null;\n      try{doc.save(filename)}catch(saveError){siteSaveError=saveError}\n      if(siteSaveError){\n        console.warn('doc.save falhou; usando fallback de Blob.',siteSaveError);\n        const blob=doc.output('blob'),url=URL.createObjectURL(blob),a=document.createElement('a');\n        a.href=url;a.download=filename;a.target='_blank';a.rel='noopener';document.body.appendChild(a);a.click();a.remove();\n        setTimeout(()=>URL.revokeObjectURL(url),60000);\n      }\n    }`;
  if(!s.includes(old))throw new Error('aditamento_v74.js: fluxo PDF 243 não encontrado');
  s=s.replace(old,next);
  s=s.replace('const __ADITAMENTO_NATIVE_SAVE_V242__=true;','const __ADITAMENTO_NATIVE_SAVE_V242__=true;const __ADITAMENTO_ANDROID_DIRECT_DOWNLOADS_V253__=true;');
  return s;
});

// MediaStore: não engole mais falha ao publicar o arquivo e valida tamanho/visibilidade.
const javaPath=path.join(root,'app','android','StorageAccessPlugin.java');
let java=await readFile(javaPath,'utf8');
const oldFinish=`    private void finishTarget(Target target) {\n        if (target == null || target.uri == null || Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) return;\n        try {\n            ContentValues values = new ContentValues();\n            values.put(MediaStore.Downloads.IS_PENDING, 0);\n            getContext().getContentResolver().update(target.uri, values, null, null);\n        } catch (Exception ignored) {}\n    }`;
const newFinish=`    private void finishTarget(Target target) throws Exception {\n        if (target == null) throw new IllegalStateException(\"Destino de Downloads inválido.\");\n        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {\n            if (target.file == null || !target.file.exists() || target.file.length() <= 0)\n                throw new IllegalStateException(\"Arquivo não apareceu em Downloads.\");\n            return;\n        }\n        if (target.uri == null) throw new IllegalStateException(\"Android não retornou URI do arquivo em Downloads.\");\n        ContentResolver resolver = getContext().getContentResolver();\n        ContentValues values = new ContentValues();\n        values.put(MediaStore.Downloads.IS_PENDING, 0);\n        int updated = resolver.update(target.uri, values, null, null);\n        if (updated <= 0) throw new IllegalStateException(\"Android não publicou o arquivo em Downloads.\");\n        String[] projection = new String[]{MediaStore.MediaColumns.SIZE, MediaStore.Downloads.IS_PENDING};\n        try (android.database.Cursor cursor = resolver.query(target.uri, projection, null, null, null)) {\n            if (cursor == null || !cursor.moveToFirst()) throw new IllegalStateException(\"Arquivo salvo não pôde ser confirmado no MediaStore.\");\n            long size = cursor.getLong(0);\n            int pending = cursor.getInt(1);\n            if (size <= 0) throw new IllegalStateException(\"Arquivo salvo ficou com 0 bytes.\");\n            if (pending != 0) throw new IllegalStateException(\"Arquivo ainda está pendente no MediaStore.\");\n        }\n    }`;
if(!java.includes(oldFinish))throw new Error('StorageAccessPlugin.java: finishTarget esperado não encontrado');
java=java.replace(oldFinish,newFinish);
await writeFile(javaPath,java,'utf8');

await appendFile(path.join(dist,'native-mobile.js'),"\n;globalThis.__TAREFAS_DOWNLOADS_ADITAMENTO_V253__={path:'Downloads/TAREFAS',verified:true};\n",'utf8');
console.log('TAREFAS Android 2.3.20.1 build 253 BETA: Aditamento direto em Downloads/TAREFAS + MediaStore validado.');
