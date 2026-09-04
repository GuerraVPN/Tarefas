import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root=process.cwd(), dist=path.resolve(process.argv[2]||'dist');
const read=rel=>readFile(path.join(dist,rel),'utf8');
const must=(text,needle,label)=>{if(!text.includes(needle))throw new Error(`${label}: marcador ausente: ${needle}`)};
const reject=(text,needle,label)=>{if(text.includes(needle))throw new Error(`${label}: marcador proibido: ${needle}`)};

const bootstrap=await read('mobile-bootstrap.js');
must(bootstrap,'2.3.15','mobile-bootstrap.js');
must(bootstrap,'const APP_BUILD = 245;','mobile-bootstrap.js');

const native=await read('native-mobile.js');
must(native,'__TAREFAS_FIXED_STORAGE_V245__','native-mobile.js');
must(native,'Downloads/TAREFAS','native-mobile.js');
must(native,'Documentos/TAREFAS/Oficial','native-mobile.js');
must(native,'Documentos/TAREFAS/Beta','native-mobile.js');
reject(native,'saveBase64WithPicker','native-mobile.js');
reject(native,'requestAllFilesAccess()', 'native-mobile.js');

const updates=await read('mobile-updates-v181.js');
must(updates,'Downloads/TAREFAS','mobile-updates-v181.js');
must(updates,'Documentos/TAREFAS/Oficial','mobile-updates-v181.js');
must(updates,'Documentos/TAREFAS/Beta','mobile-updates-v181.js');
must(updates,'Sem permissão especial','mobile-updates-v181.js');
reject(updates,'Conceder acesso total aos arquivos','mobile-updates-v181.js');
reject(updates,'requestStorageAccess','mobile-updates-v181.js');
reject(updates,'Acesso total aos arquivos ainda não concedido','mobile-updates-v181.js');
reject(updates,'Documentos/TAREFAS/Atualização/Beta','mobile-updates-v181.js');

const adit=await read('aditamento_v74.js');
must(adit,'ADITAMENTO AO BOLETIM INTERNO','aditamento_v74.js');
must(adit,'doc.save(filename)','aditamento_v74.js');

const java=await readFile(path.join(root,'app','android','StorageAccessPlugin.java'),'utf8');
reject(java,'ACTION_CREATE_DOCUMENT','StorageAccessPlugin.java');
reject(java,'ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION','StorageAccessPlugin.java');
reject(java,'ACTION_MANAGE_ALL_FILES_ACCESS_PERMISSION','StorageAccessPlugin.java');
reject(java,'saveBase64WithPicker','StorageAccessPlugin.java');
must(java,'saveBase64ToDownloads','StorageAccessPlugin.java');
must(java,'requiresAllFilesAccess", false','StorageAccessPlugin.java');

const manifestCandidates=[path.join(root,'android','app','src','main','AndroidManifest.xml')];
for(const p of manifestCandidates){try{const m=await readFile(p,'utf8');reject(m,'MANAGE_EXTERNAL_STORAGE',p)}catch(_){} }

console.log('OK 2.3.15 build 245: diretórios fixos, sem Salvar como e sem acesso total.');
