import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root=process.cwd(), dist=path.resolve(process.argv[2]||'dist');
const read=rel=>readFile(path.join(dist,rel),'utf8');
const must=(text,needle,label)=>{if(!text.includes(needle))throw new Error(`${label}: marcador ausente: ${needle}`)};
const reject=(text,needle,label)=>{if(text.includes(needle))throw new Error(`${label}: marcador proibido: ${needle}`)};

const bootstrap=await read('mobile-bootstrap.js');
must(bootstrap,'2.3.17','mobile-bootstrap.js');
must(bootstrap,'const APP_BUILD = 247;','mobile-bootstrap.js');

const native=await read('native-mobile.js');
must(native,'__TAREFAS_FIXED_STORAGE_V247__','native-mobile.js');
must(native,'__TAREFAS_INSTALLER_NATIVE_V247__','native-mobile.js');
must(native,'Downloads/TAREFAS','native-mobile.js');
must(native,'Documentos/TAREFAS/Oficial','native-mobile.js');
must(native,'Documentos/TAREFAS/Beta','native-mobile.js');
reject(native,'saveBase64WithPicker','native-mobile.js');

const nativeSource=await readFile(path.join(root,'app','native-mobile-entry.js'),'utf8');
must(nativeSource,'StorageAccess.installApk({uri})','native-mobile-entry.js');
must(nativeSource,'Permita instalar apps desta fonte','native-mobile-entry.js');

const java=await readFile(path.join(root,'app','android','StorageAccessPlugin.java'),'utf8');
must(java,'public void installApk(PluginCall call)','StorageAccessPlugin.java');
must(java,'Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES','StorageAccessPlugin.java');
must(java,'canRequestPackageInstalls()','StorageAccessPlugin.java');
must(java,'FileProvider.getUriForFile','StorageAccessPlugin.java');
must(java,'Intent.ACTION_VIEW','StorageAccessPlugin.java');
must(java,'FLAG_GRANT_READ_URI_PERMISSION','StorageAccessPlugin.java');
must(java,'ClipData.newRawUri','StorageAccessPlugin.java');
reject(java,'ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION','StorageAccessPlugin.java');
reject(java,'ACTION_MANAGE_ALL_FILES_ACCESS_PERMISSION','StorageAccessPlugin.java');
reject(java,'ACTION_CREATE_DOCUMENT','StorageAccessPlugin.java');

const adit=await read('aditamento_v74.js');
must(adit,'ADITAMENTO AO BOLETIM INTERNO','aditamento_v74.js');
must(adit,'doc.save(filename)','aditamento_v74.js');

console.log('OK 2.3.17 build 247: instalador APK nativo + diretorios fixos preservados.');
