import { readFile } from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd(),dist=path.resolve(process.argv[2]||'dist');
const read=rel=>readFile(path.join(dist,rel),'utf8');
const must=(t,n,l)=>{if(!t.includes(n))throw new Error(`${l}: marcador ausente: ${n}`)};
const reject=(t,n,l)=>{if(t.includes(n))throw new Error(`${l}: marcador proibido: ${n}`)};

const boot=await read('mobile-bootstrap.js');
must(boot,'2.3.20.2','mobile-bootstrap.js');
must(boot,'const APP_BUILD = 254;','mobile-bootstrap.js');

const source=await readFile(path.join(root,'app','native-mobile-entry.js'),'utf8');
must(source,"StorageAccess.saveBase64ToDocuments({data,filename:name,mimeType:blob.type||'application/octet-stream',subfolder:'TAREFAS/Documentos'})",'app/native-mobile-entry.js');
must(source,'FileOpener.openFile({path:saved.uri','app/native-mobile-entry.js');
must(source,'openedAfterSave','app/native-mobile-entry.js');
must(source,"Documentos/TAREFAS/Documentos",'app/native-mobile-entry.js');
must(source,"FileOpener.openFile({path:uri,mimeType:'application/vnd.android.package-archive'})",'app/native-mobile-entry.js');
reject(source,'StorageAccess.installApk','app/native-mobile-entry.js');

const native=await read('native-mobile.js');
must(native,'__TAREFAS_2320_INSTALLER_220_FLOW__','native-mobile.js');
must(native,'__TAREFAS_DOCUMENTS_AUTOPEN_V254__','native-mobile.js');
must(native,'__TAREFAS_DOCUMENTS_V254__','native-mobile.js');
must(native,'Documentos/TAREFAS/Documentos','native-mobile.js');
reject(native,'__TAREFAS_INSTALLER_CACHE_','native-mobile.js');

const adit=await read('aditamento_v74.js');
must(adit,'__ADITAMENTO_ANDROID_DOCUMENTS_AUTOPEN_V254__','aditamento_v74.js');
must(adit,"saveAditamentoBlob(doc.output('blob'),filename)",'aditamento_v74.js');
must(adit,'Documentos/TAREFAS/Documentos','aditamento_v74.js');
must(adit,'ADITAMENTO AO BOLETIM INTERNO','aditamento_v74.js');

const updates=await read('mobile-updates-v181.js');
must(updates,'Documentos/TAREFAS/Documentos','mobile-updates-v181.js');

const java=await readFile(path.join(root,'app','android','StorageAccessPlugin.java'),'utf8');
must(java,'public void saveBase64ToDocuments(PluginCall call)','StorageAccessPlugin.java');
must(java,'MediaStore.Files.getContentUri("external")','StorageAccessPlugin.java');
must(java,'Environment.DIRECTORY_DOCUMENTS','StorageAccessPlugin.java');
must(java,'Android não publicou o arquivo em Documentos.','StorageAccessPlugin.java');
must(java,'Arquivo salvo ficou com 0 bytes.','StorageAccessPlugin.java');
reject(java,'public void installApk(PluginCall call)','StorageAccessPlugin.java');
reject(java,'stageApk(Uri source)','StorageAccessPlugin.java');
reject(java,'ACTION_MANAGE_ALL_FILES_ACCESS_PERMISSION','StorageAccessPlugin.java');
reject(java,'ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION','StorageAccessPlugin.java');

console.log('OK 2.3.20.2 build 254: arquivos em Documentos/TAREFAS/Documentos, confirmação real e abertura automática; instalador 2.2.0 preservado.');
