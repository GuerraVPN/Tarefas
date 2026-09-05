import { appendFile, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root=process.cwd();

// Antes de montar a cadeia 2.3.20.1, altera somente a transformação 2.3.15
// responsável pelo destino dos blobs gerados. Assim o bundle continua usando
// toda a infraestrutura já validada (inclusive progresso/instalador da 2.2.0),
// mas arquivos gerados passam a ir para Documentos/TAREFAS/Documentos e abrir
// automaticamente depois da gravação.
const v2315Path=path.join(root,'scripts','build-mobile-v2315.mjs');
let v2315=await readFile(v2315Path,'utf8');
const oldSaveCall="const saved=await StorageAccess.saveBase64ToDownloads({data,filename:name,mimeType:blob.type||'application/octet-stream',subfolder:DOWNLOADS_FOLDER});";
const newSaveCall="const saved=await StorageAccess.saveBase64ToDocuments({data,filename:name,mimeType:blob.type||'application/octet-stream',subfolder:'TAREFAS/Documentos'});";
if(!v2315.includes(oldSaveCall))throw new Error('2.3.20.2: saveBase64ToDownloads esperado não encontrado em 2.3.15');
v2315=v2315.replace(oldSaveCall,newSaveCall)
  .replace("O Android não confirmou o salvamento em Downloads/TAREFAS.","O Android não confirmou o salvamento em Documentos/TAREFAS/Documentos.")
  .replace("path:saved.path||('Downloads/'+DOWNLOADS_FOLDER+'/'+name)","path:saved.path||('Documentos/TAREFAS/Documentos/'+name)")
  .replace(
    "   const info={ok:true,saved:true,canceled:false,shared:false,filename:name,path:saved.path||('Documentos/TAREFAS/Documentos/'+name),uri:saved.uri||'',mimeType:blob.type||'application/octet-stream',selectedByUser:false,fixedDirectory:true};",
    "   let openedAfterSave=false;if(saved?.uri){try{await FileOpener.openFile({path:saved.uri,mimeType:blob.type||'application/octet-stream'});openedAfterSave=true}catch(openError){console.warn('[TAREFAS FILES] Arquivo salvo, mas não foi possível abri-lo automaticamente:',openError)}}\n   const info={ok:true,saved:true,canceled:false,shared:false,filename:name,path:saved.path||('Documentos/TAREFAS/Documentos/'+name),uri:saved.uri||'',mimeType:blob.type||'application/octet-stream',selectedByUser:false,fixedDirectory:true,openedAfterSave};"
  )
  .replace(
    'PDF, ODT e outros arquivos são salvos em <b>Downloads/TAREFAS</b>. Atualizações ficam em <b>Documentos/TAREFAS/Oficial</b> ou <b>Documentos/TAREFAS/Beta</b>.',
    'PDF, ODT e outros arquivos são salvos em <b>Documentos/TAREFAS/Documentos</b> e abertos automaticamente após salvar. Atualizações ficam em <b>Documentos/TAREFAS/Oficial</b> ou <b>Documentos/TAREFAS/Beta</b>.'
  );
await writeFile(v2315Path,v2315,'utf8');

await import(pathToFileURL(path.resolve('scripts/build-mobile-v23201.mjs')).href+'?v=23202');
const dist=path.join(root,'dist');
async function patch(rel,fn){const p=path.join(dist,rel);let s=await readFile(p,'utf8');const before=s;s=fn(s);if(s===before)console.warn(`[2.3.20.2] sem alteração em ${rel}`);await writeFile(p,s,'utf8');}

// 2.3.20.2 / build 254.
for(const name of await readdir(dist)){
  if(!/\.(?:html|js|css|webmanifest)$/i.test(name))continue;
  const p=path.join(dist,name);let s=await readFile(p,'utf8');
  s=s.replaceAll('2.3.20.1','2.3.20.2').replaceAll('b253','b254');
  await writeFile(p,s,'utf8');
}
await patch('mobile-bootstrap.js',s=>s.replace('const APP_BUILD = 253;','const APP_BUILD = 254;'));
await patch('mobile-preload.js',s=>s.replace("tarefasAppBuild = '253'","tarefasAppBuild = '254'"));
await patch('mobile-updates-v181.js',s=>s.replace('const APP_BUILD = 253;','const APP_BUILD = 254;').replaceAll('Downloads/TAREFAS','Documentos/TAREFAS/Documentos'));
await patch('mobile-schema-v239.js',s=>s.replace('build:253','build:254'));
await patch('aditamento_v74.js',s=>s
  .replaceAll('Downloads/TAREFAS','Documentos/TAREFAS/Documentos')
  .replaceAll('[ADITAMENTO 253]','[ADITAMENTO 254]')
  .replace('__ADITAMENTO_ANDROID_DIRECT_DOWNLOADS_V253__','__ADITAMENTO_ANDROID_DOCUMENTS_AUTOPEN_V254__'));

// Adiciona gravação nativa no diretório público Documents sem SAF/Salvar como.
// Em Android 10+ usa MediaStore.Files + RELATIVE_PATH; em versões antigas usa
// Environment.DIRECTORY_DOCUMENTS. O retorno é um content:// que o FileOpener
// abre imediatamente após o save.
const javaPath=path.join(root,'app','android','StorageAccessPlugin.java');
let java=await readFile(javaPath,'utf8');
const anchor='    private long deleteOldApks(File dir, String keepName, List<String> deleted, long[] count) {';
if(!java.includes(anchor))throw new Error('2.3.20.2: ponto de inserção Java não encontrado');
const methods=`    private Target openDocumentsTarget(String filename, String mimeType, String subfolder) throws Exception {
        String folder = (subfolder == null || subfolder.trim().isEmpty()) ? "TAREFAS/Documentos" : subfolder.trim().replaceAll("^/+|/+$", "");
        String name = safeName(filename);
        Target target = new Target();
        target.displayPath = "Documentos/" + folder + "/" + name;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ContentResolver resolver = getContext().getContentResolver();
            ContentValues values = new ContentValues();
            values.put(MediaStore.MediaColumns.DISPLAY_NAME, name);
            values.put(MediaStore.MediaColumns.MIME_TYPE, (mimeType == null || mimeType.isEmpty()) ? "application/octet-stream" : mimeType);
            values.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOCUMENTS + "/" + folder);
            values.put(MediaStore.MediaColumns.IS_PENDING, 1);
            Uri collection = MediaStore.Files.getContentUri("external");
            Uri uri = resolver.insert(collection, values);
            if (uri == null) throw new IllegalStateException("Android não criou o arquivo em Documentos.");
            OutputStream out = resolver.openOutputStream(uri, "w");
            if (out == null) {
                resolver.delete(uri, null, null);
                throw new IllegalStateException("Android não abriu o arquivo em Documentos.");
            }
            target.uri = uri;
            target.out = out;
            return target;
        }

        File base = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOCUMENTS), folder);
        if (!base.exists() && !base.mkdirs()) throw new IllegalStateException("Não foi possível criar Documentos/" + folder + ".");
        File file = new File(base, name);
        target.file = file;
        target.uri = Uri.fromFile(file);
        target.out = new FileOutputStream(file, false);
        return target;
    }

    private void finishDocumentsTarget(Target target) throws Exception {
        if (target == null) throw new IllegalStateException("Destino de Documentos inválido.");
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
            if (target.file == null || !target.file.exists() || target.file.length() <= 0)
                throw new IllegalStateException("Arquivo não apareceu em Documentos.");
            return;
        }
        if (target.uri == null) throw new IllegalStateException("Android não retornou URI do arquivo em Documentos.");
        ContentResolver resolver = getContext().getContentResolver();
        ContentValues values = new ContentValues();
        values.put(MediaStore.MediaColumns.IS_PENDING, 0);
        int updated = resolver.update(target.uri, values, null, null);
        if (updated <= 0) throw new IllegalStateException("Android não publicou o arquivo em Documentos.");
        String[] projection = new String[]{MediaStore.MediaColumns.SIZE, MediaStore.MediaColumns.IS_PENDING};
        try (android.database.Cursor cursor = resolver.query(target.uri, projection, null, null, null)) {
            if (cursor == null || !cursor.moveToFirst()) throw new IllegalStateException("Arquivo salvo não pôde ser confirmado no MediaStore.");
            long size = cursor.getLong(0);
            int pending = cursor.getInt(1);
            if (size <= 0) throw new IllegalStateException("Arquivo salvo ficou com 0 bytes.");
            if (pending != 0) throw new IllegalStateException("Arquivo ainda está pendente no MediaStore.");
        }
    }

    @PluginMethod
    public void saveBase64ToDocuments(PluginCall call) {
        final String data = call.getString("data");
        final String filename = safeName(call.getString("filename", "arquivo"));
        final String mimeType = call.getString("mimeType", "application/octet-stream");
        final String subfolder = call.getString("subfolder", "TAREFAS/Documentos");
        if (data == null || data.isEmpty()) {
            call.reject("Conteúdo do arquivo está vazio.");
            return;
        }
        new Thread(() -> {
            Target target = null;
            try {
                byte[] bytes = Base64.decode(data, Base64.DEFAULT);
                target = openDocumentsTarget(filename, mimeType, subfolder);
                target.out.write(bytes);
                target.out.flush();
                target.out.close();
                finishDocumentsTarget(target);
                JSObject ret = new JSObject();
                ret.put("saved", true);
                ret.put("path", target.displayPath);
                ret.put("uri", target.uri != null ? target.uri.toString() : "");
                ret.put("size", bytes.length);
                call.resolve(ret);
            } catch (Exception err) {
                abortTarget(target);
                call.reject("Falha ao salvar em Documentos/TAREFAS/Documentos: " + err.getMessage(), err);
            }
        }).start();
    }

`;
java=java.replace(anchor,methods+anchor);
await writeFile(javaPath,java,'utf8');

// Substitui o marcador da 2.3.20.1 pelo destino novo e registra o auto-open.
await patch('native-mobile.js',s=>s
  .replace("globalThis.__TAREFAS_DOWNLOADS_ADITAMENTO_V253__={path:'Downloads/TAREFAS',verified:true}","globalThis.__TAREFAS_DOCUMENTS_AUTOPEN_V254__={path:'Documentos/TAREFAS/Documentos',verified:true,openAfterSave:true}"));
await appendFile(path.join(dist,'native-mobile.js'),"\n;globalThis.__TAREFAS_DOCUMENTS_V254__='Documentos/TAREFAS/Documentos';\n",'utf8');

console.log('TAREFAS Android 2.3.20.2 build 254 BETA: arquivos em Documentos/TAREFAS/Documentos + abertura automática.');
