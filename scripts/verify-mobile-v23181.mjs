import { readFile } from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd(),dist=path.resolve(process.argv[2]||'dist');
const read=rel=>readFile(path.join(dist,rel),'utf8');
const must=(t,n,l)=>{if(!t.includes(n))throw new Error(`${l}: marcador ausente: ${n}`)};
const reject=(t,n,l)=>{if(t.includes(n))throw new Error(`${l}: marcador proibido: ${n}`)};

const boot=await read('mobile-bootstrap.js');
must(boot,'2.3.18.1','mobile-bootstrap.js');must(boot,'const APP_BUILD = 249;','mobile-bootstrap.js');
const native=await read('native-mobile.js');
must(native,'__TAREFAS_INSTALLER_NATIVE_V249__','native-mobile.js');
must(native,'__TAREFAS_INSTALLER_CACHE_V249__','native-mobile.js');
must(native,'__TAREFAS_23181_FINAL_HOTFIX__','native-mobile.js');
must(native,'Documentos/TAREFAS/Beta','native-mobile.js');must(native,'Downloads/TAREFAS','native-mobile.js');reject(native,'saveBase64WithPicker','native-mobile.js');
const java=await readFile(path.join(root,'app','android','StorageAccessPlugin.java'),'utf8');
must(java,'stageApk(Uri source)','StorageAccessPlugin.java');must(java,'launchStagedInstaller','StorageAccessPlugin.java');must(java,'getPackageArchiveInfo','StorageAccessPlugin.java');must(java,'getCacheDir()','StorageAccessPlugin.java');must(java,'FileProvider.getUriForFile','StorageAccessPlugin.java');must(java,'ACTION_MANAGE_UNKNOWN_APP_SOURCES','StorageAccessPlugin.java');reject(java,'ACTION_MANAGE_ALL_FILES_ACCESS_PERMISSION','StorageAccessPlugin.java');reject(java,'ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION','StorageAccessPlugin.java');
const adit=await read('aditamento_v74.js');must(adit,'ADITAMENTO AO BOLETIM INTERNO','aditamento_v74.js');
console.log('OK 2.3.18.1 build 249: hotfix final 2.3, instalador validado por cache privado.');
