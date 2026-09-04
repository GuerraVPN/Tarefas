import { appendFile, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();

await import(pathToFileURL(path.resolve('scripts/build-mobile-v2316.mjs')).href + '?v=2317');

const dist = path.join(root, 'dist');
async function patch(rel, fn) {
  const p = path.join(dist, rel);
  let s = await readFile(p, 'utf8');
  s = fn(s);
  await writeFile(p, s, 'utf8');
}

for (const name of await readdir(dist)) {
  if (!/\.(?:html|js|css|webmanifest)$/i.test(name)) continue;
  const p = path.join(dist, name);
  let s = await readFile(p, 'utf8');
  s = s
    .replaceAll('2.3.16', '2.3.17')
    .replaceAll('b246', 'b247')
    .replaceAll('__TAREFAS_FIXED_STORAGE_V246__', '__TAREFAS_FIXED_STORAGE_V247__')
    .replaceAll('__TAREFAS_DOWNLOAD_TEST_V246__', '__TAREFAS_INSTALLER_FIX_V247__');
  await writeFile(p, s, 'utf8');
}

await patch('mobile-bootstrap.js', s => s.replace('const APP_BUILD = 246;', 'const APP_BUILD = 247;'));
await patch('mobile-preload.js', s => s.replace("tarefasAppBuild = '246'", "tarefasAppBuild = '247'"));
await patch('mobile-updates-v181.js', s => s.replace('const APP_BUILD = 246;', 'const APP_BUILD = 247;'));
await patch('mobile-schema-v239.js', s => s.replace('build:246', 'build:247'));

// Troca o FileOpener genérico por um instalador APK nativo dedicado.
await patch('native-mobile.js', s => {
  const old = "async function openApkInstaller(uri){try{await FileOpener.openFile({path:uri,mimeType:'application/vnd.android.package-archive'});return{opened:true,error:null}}catch(err){console.warn('[TAREFAS UPDATE] Não foi possível abrir o instalador Android:',err);return{opened:false,error:String(err?.message||err||'Falha ao abrir instalador')}}}";
  const neu = "async function openApkInstaller(uri){try{const result=await StorageAccess.installApk({uri});if(result?.opened)return{opened:true,error:null};const message=result?.permissionDenied?'Permita instalar apps desta fonte para o TAREFAS e tente novamente.':(result?.error||'O Android não abriu o instalador.');return{opened:false,error:String(message)}}catch(err){console.warn('[TAREFAS UPDATE] Instalador nativo falhou:',err);try{await FileOpener.openFile({path:uri,mimeType:'application/vnd.android.package-archive'});return{opened:true,error:null}}catch(fallback){return{opened:false,error:String(fallback?.message||err?.message||fallback||err||'Falha ao abrir instalador')}}}}";
  if (!s.includes(old)) throw new Error('native-mobile.js: openApkInstaller antigo não encontrado');
  return s.replace(old, neu);
});

const javaPath = path.join(root, 'app', 'android', 'StorageAccessPlugin.java');
let java = await readFile(javaPath, 'utf8');
if (!java.includes('import android.provider.Settings;')) {
  java = java.replace('import android.provider.MediaStore;\n', 'import android.provider.MediaStore;\nimport android.provider.Settings;\n');
}
if (!java.includes('import androidx.core.content.FileProvider;')) {
  java = java.replace('import androidx.activity.result.ActivityResult;\n', 'import androidx.activity.result.ActivityResult;\nimport androidx.core.content.FileProvider;\n');
}
const installer = `
    private Uri normalizeInstallUri(String raw) {
        Uri uri = Uri.parse(raw == null ? "" : raw);
        if ("file".equalsIgnoreCase(uri.getScheme())) {
            File file = new File(uri.getPath());
            return FileProvider.getUriForFile(getContext(), getContext().getPackageName() + ".tarefas.fileprovider", file);
        }
        return uri;
    }

    private void launchInstaller(PluginCall call, Uri uri) {
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW);
            intent.setDataAndType(uri, "application/vnd.android.package-archive");
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            JSObject ret = new JSObject();
            ret.put("opened", true);
            ret.put("permissionDenied", false);
            call.resolve(ret);
        } catch (Exception err) {
            call.reject("Falha ao abrir instalador: " + err.getMessage(), err);
        }
    }

    @PluginMethod
    public void installApk(PluginCall call) {
        String raw = call.getString("uri", "");
        if (raw == null || raw.trim().isEmpty()) {
            call.reject("URI do APK ausente.");
            return;
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && !getContext().getPackageManager().canRequestPackageInstalls()) {
            try {
                Intent settings = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:" + getContext().getPackageName()));
                startActivityForResult(call, settings, "installPermissionResult");
            } catch (Exception err) {
                JSObject ret = new JSObject();
                ret.put("opened", false);
                ret.put("permissionDenied", true);
                ret.put("error", "Não foi possível abrir a permissão Permitir desta fonte.");
                call.resolve(ret);
            }
            return;
        }
        launchInstaller(call, normalizeInstallUri(raw));
    }

    @ActivityCallback
    private void installPermissionResult(PluginCall call, ActivityResult result) {
        if (call == null) return;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && !getContext().getPackageManager().canRequestPackageInstalls()) {
            JSObject ret = new JSObject();
            ret.put("opened", false);
            ret.put("permissionDenied", true);
            ret.put("error", "Permita instalar apps desta fonte para o TAREFAS.");
            call.resolve(ret);
            return;
        }
        launchInstaller(call, normalizeInstallUri(call.getString("uri", "")));
    }
`;
if (java.includes('public void installApk(PluginCall call)')) throw new Error('StorageAccessPlugin.java: installApk já existe');
const idx = java.lastIndexOf('\n}');
if (idx < 0) throw new Error('StorageAccessPlugin.java: fechamento da classe não encontrado');
java = java.slice(0, idx) + installer + java.slice(idx);
await writeFile(javaPath, java, 'utf8');

await appendFile(path.join(dist, 'native-mobile.js'), "\n;globalThis.__TAREFAS_INSTALLER_NATIVE_V247__=true;\n", 'utf8');
console.log('TAREFAS Android 2.3.17 build 247 BETA: instalador APK nativo com Permitir desta fonte.');
