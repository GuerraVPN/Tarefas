import { appendFile, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root=process.cwd();
await import(pathToFileURL(path.resolve('scripts/build-mobile-v2317.mjs')).href+'?v=2318');
const dist=path.join(root,'dist');

async function patch(rel,fn){const p=path.join(dist,rel);let s=await readFile(p,'utf8');s=fn(s);await writeFile(p,s,'utf8');}
for(const name of await readdir(dist)){
  if(!/\.(?:html|js|css|webmanifest)$/i.test(name)) continue;
  const p=path.join(dist,name);
  let s=await readFile(p,'utf8');
  s=s.replaceAll('2.3.17','2.3.18')
     .replaceAll('b247','b248')
     .replaceAll('__TAREFAS_FIXED_STORAGE_V247__','__TAREFAS_FIXED_STORAGE_V248__')
     .replaceAll('__TAREFAS_INSTALLER_FIX_V247__','__TAREFAS_INSTALLER_TEST_V248__')
     .replaceAll('__TAREFAS_INSTALLER_NATIVE_V247__','__TAREFAS_INSTALLER_NATIVE_V248__');
  await writeFile(p,s,'utf8');
}
await patch('mobile-bootstrap.js',s=>s.replace('const APP_BUILD = 247;','const APP_BUILD = 248;'));
await patch('mobile-preload.js',s=>s.replace("tarefasAppBuild = '247'","tarefasAppBuild = '248'"));
await patch('mobile-updates-v181.js',s=>s.replace('const APP_BUILD = 247;','const APP_BUILD = 248;'));
await patch('mobile-schema-v239.js',s=>s.replace('build:247','build:248'));

// Corrige somente a entrega do APK ao Package Installer: copia para cache privado,
// valida o pacote e entrega um content:// do FileProvider do próprio TAREFAS.
const javaPath=path.join(root,'app','android','StorageAccessPlugin.java');
let java=await readFile(javaPath,'utf8');
if(!java.includes('import android.content.pm.PackageManager;')) java=java.replace('import android.content.Intent;\n','import android.content.Intent;\nimport android.content.pm.PackageManager;\n');
if(!java.includes('import androidx.core.content.FileProvider;')) java=java.replace('import androidx.activity.result.ActivityResult;\n','import androidx.activity.result.ActivityResult;\nimport androidx.core.content.FileProvider;\n');
if(!java.includes('import java.io.FileInputStream;')) java=java.replace('import java.io.File;\n','import java.io.File;\nimport java.io.FileInputStream;\n');

const previousStart=java.indexOf('    private Uri normalizeInstallUri');
if(previousStart<0) throw new Error('StorageAccessPlugin.java: instalador 2.3.17 não encontrado');
const classEnd=java.lastIndexOf('\n}');
if(classEnd<0) throw new Error('StorageAccessPlugin.java: fechamento da classe ausente');
java=java.slice(0,previousStart)+java.slice(classEnd);

const installer=`
    private File stageApk(Uri source) throws Exception {
        File dir = new File(getContext().getCacheDir(), "apk-installer");
        if (!dir.exists() && !dir.mkdirs()) throw new IllegalStateException("Não foi possível preparar o cache do instalador.");
        File target = new File(dir, "TAREFAS-update.apk");
        ContentResolver resolver = getContext().getContentResolver();
        try {
            InputStream opened;
            if ("file".equalsIgnoreCase(source.getScheme())) opened = new FileInputStream(new File(source.getPath()));
            else opened = resolver.openInputStream(source);
            if (opened == null) throw new IllegalStateException("Android não conseguiu ler o APK baixado.");
            try (InputStream src = opened; OutputStream out = new FileOutputStream(target, false)) {
                byte[] buffer = new byte[64 * 1024];
                int read;
                long total = 0;
                while ((read = src.read(buffer)) != -1) {
                    out.write(buffer, 0, read);
                    total += read;
                }
                out.flush();
                if (total <= 0) throw new IllegalStateException("APK baixado está vazio.");
            }
        } catch (Exception err) {
            target.delete();
            throw err;
        }
        if (getContext().getPackageManager().getPackageArchiveInfo(target.getAbsolutePath(), PackageManager.GET_ACTIVITIES) == null) {
            target.delete();
            throw new IllegalStateException("O arquivo baixado não foi reconhecido como APK válido.");
        }
        return target;
    }

    private void launchStagedInstaller(PluginCall call, Uri original) {
        new Thread(() -> {
            try {
                File staged = stageApk(original);
                Uri uri = FileProvider.getUriForFile(getContext(), getContext().getPackageName() + ".tarefas.fileprovider", staged);
                Intent intent = new Intent(Intent.ACTION_VIEW);
                intent.setDataAndType(uri, "application/vnd.android.package-archive");
                intent.setClipData(android.content.ClipData.newRawUri("tarefas-apk", uri));
                intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(intent);
                JSObject ret = new JSObject();
                ret.put("opened", true);
                ret.put("validated", true);
                ret.put("stagedSize", staged.length());
                call.resolve(ret);
            } catch (Exception err) {
                call.reject("Falha ao preparar APK para instalação: " + err.getMessage(), err);
            }
        }).start();
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
                startActivityForResult(call, settings, "installPermissionResultV248");
            } catch (Exception err) {
                call.reject("Não foi possível abrir Permitir desta fonte.", err);
            }
            return;
        }
        launchStagedInstaller(call, Uri.parse(raw));
    }

    @ActivityCallback
    private void installPermissionResultV248(PluginCall call, ActivityResult result) {
        if (call == null) return;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && !getContext().getPackageManager().canRequestPackageInstalls()) {
            call.reject("Permita instalar apps desta fonte para o TAREFAS.");
            return;
        }
        launchStagedInstaller(call, Uri.parse(call.getString("uri", "")));
    }
`;
const end=java.lastIndexOf('\n}');
java=java.slice(0,end)+installer+java.slice(end);
await writeFile(javaPath,java,'utf8');

await appendFile(path.join(dist,'native-mobile.js'),'\n;globalThis.__TAREFAS_INSTALLER_TEST_V248__=true;globalThis.__TAREFAS_INSTALLER_CACHE_V248__=true;\n','utf8');
console.log('TAREFAS Android 2.3.18 build 248 BETA: APK validado no cache privado antes de abrir o instalador.');
