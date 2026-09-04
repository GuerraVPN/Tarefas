package br.com.guerravpn.tarefas.mobile;

import android.app.Activity;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.provider.Settings;
import android.util.Base64;

import androidx.activity.result.ActivityResult;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

@CapacitorPlugin(name = "StorageAccess")
public class StorageAccessPlugin extends Plugin {

    private boolean hasAllFilesAccess() {
        return Build.VERSION.SDK_INT < Build.VERSION_CODES.R || Environment.isExternalStorageManager();
    }

    @PluginMethod
    public void checkAllFilesAccess(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("granted", hasAllFilesAccess());
        ret.put("required", Build.VERSION.SDK_INT >= Build.VERSION_CODES.R);
        call.resolve(ret);
    }

    @PluginMethod
    public void requestAllFilesAccess(PluginCall call) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) {
            JSObject ret = new JSObject();
            ret.put("opened", false);
            ret.put("granted", true);
            call.resolve(ret);
            return;
        }
        try {
            Intent intent = new Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION);
            intent.setData(Uri.parse("package:" + getContext().getPackageName()));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
        } catch (Exception primary) {
            try {
                Intent fallback = new Intent(Settings.ACTION_MANAGE_ALL_FILES_ACCESS_PERMISSION);
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(fallback);
            } catch (Exception err) {
                call.reject("Não foi possível abrir a permissão de acesso total aos arquivos.", err);
                return;
            }
        }
        JSObject ret = new JSObject();
        ret.put("opened", true);
        ret.put("granted", Environment.isExternalStorageManager());
        call.resolve(ret);
    }

    private String safeName(String raw) {
        String name = raw == null ? "arquivo" : raw.trim();
        name = name.replaceAll("[\\\\/:*?\"<>|\\p{Cntrl}]", "_");
        while (name.startsWith(".")) name = name.substring(1);
        if (name.isEmpty()) name = "arquivo";
        return name.length() > 160 ? name.substring(0, 160) : name;
    }

    @PluginMethod
    public void saveBase64WithPicker(PluginCall call) {
        final String data = call.getString("data");
        final String filename = safeName(call.getString("filename", "arquivo"));
        final String mimeType = call.getString("mimeType", "application/octet-stream");
        if (data == null || data.isEmpty()) {
            call.reject("Conteúdo do arquivo está vazio.");
            return;
        }
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType((mimeType == null || mimeType.isEmpty()) ? "application/octet-stream" : mimeType);
        intent.putExtra(Intent.EXTRA_TITLE, filename);
        intent.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION | Intent.FLAG_GRANT_READ_URI_PERMISSION);
        startActivityForResult(call, intent, "saveBase64WithPickerResult");
    }

    @ActivityCallback
    private void saveBase64WithPickerResult(PluginCall call, ActivityResult result) {
        if (call == null) return;
        Intent resultData = result != null ? result.getData() : null;
        Uri uri = resultData != null ? resultData.getData() : null;
        if (result == null || result.getResultCode() != Activity.RESULT_OK || uri == null) {
            JSObject ret = new JSObject();
            ret.put("saved", false);
            ret.put("canceled", true);
            call.resolve(ret);
            return;
        }
        final String encoded = call.getString("data");
        final String filename = safeName(call.getString("filename", "arquivo"));
        if (encoded == null || encoded.isEmpty()) {
            call.reject("Conteúdo do arquivo está vazio.");
            return;
        }
        final Uri targetUri = uri;
        new Thread(() -> {
            try {
                byte[] bytes = Base64.decode(encoded, Base64.DEFAULT);
                ContentResolver resolver = getContext().getContentResolver();
                try (OutputStream out = resolver.openOutputStream(targetUri, "w")) {
                    if (out == null) throw new IllegalStateException("Android não abriu o destino escolhido.");
                    out.write(bytes);
                    out.flush();
                }
                JSObject ret = new JSObject();
                ret.put("saved", true);
                ret.put("canceled", false);
                ret.put("path", targetUri.toString());
                ret.put("uri", targetUri.toString());
                ret.put("filename", filename);
                ret.put("size", bytes.length);
                call.resolve(ret);
            } catch (Exception err) {
                call.reject("Falha ao salvar no local escolhido: " + err.getMessage(), err);
            }
        }).start();
    }

    private static class Target {
        OutputStream out;
        Uri uri;
        File file;
        String displayPath;
    }

    private Target openDownloadsTarget(String filename, String mimeType, String subfolder) throws Exception {
        String folder = (subfolder == null || subfolder.trim().isEmpty()) ? "TAREFAS" : subfolder.trim().replaceAll("^/+|/+$", "");
        String name = safeName(filename);
        Target target = new Target();
        target.displayPath = "Downloads/" + folder + "/" + name;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ContentResolver resolver = getContext().getContentResolver();
            ContentValues values = new ContentValues();
            values.put(MediaStore.Downloads.DISPLAY_NAME, name);
            values.put(MediaStore.Downloads.MIME_TYPE, (mimeType == null || mimeType.isEmpty()) ? "application/octet-stream" : mimeType);
            values.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/" + folder);
            values.put(MediaStore.Downloads.IS_PENDING, 1);
            Uri uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
            if (uri == null) throw new IllegalStateException("Android não criou o arquivo em Downloads.");
            OutputStream out = resolver.openOutputStream(uri, "w");
            if (out == null) {
                resolver.delete(uri, null, null);
                throw new IllegalStateException("Android não abriu o arquivo em Downloads.");
            }
            target.uri = uri;
            target.out = out;
            return target;
        }

        File base = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS), folder);
        if (!base.exists() && !base.mkdirs()) throw new IllegalStateException("Não foi possível criar Downloads/" + folder + ".");
        File file = new File(base, name);
        target.file = file;
        target.uri = Uri.fromFile(file);
        target.out = new FileOutputStream(file, false);
        return target;
    }

    private void finishTarget(Target target) {
        if (target == null || target.uri == null || Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) return;
        try {
            ContentValues values = new ContentValues();
            values.put(MediaStore.Downloads.IS_PENDING, 0);
            getContext().getContentResolver().update(target.uri, values, null, null);
        } catch (Exception ignored) {}
    }

    private void abortTarget(Target target) {
        if (target == null) return;
        try { if (target.out != null) target.out.close(); } catch (Exception ignored) {}
        try {
            if (target.uri != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) getContext().getContentResolver().delete(target.uri, null, null);
            else if (target.file != null) target.file.delete();
        } catch (Exception ignored) {}
    }

    @PluginMethod
    public void saveBase64ToDownloads(PluginCall call) {
        final String data = call.getString("data");
        final String filename = safeName(call.getString("filename", "arquivo"));
        final String mimeType = call.getString("mimeType", "application/octet-stream");
        final String subfolder = call.getString("subfolder", "TAREFAS");
        if (data == null || data.isEmpty()) {
            call.reject("Conteúdo do arquivo está vazio.");
            return;
        }
        new Thread(() -> {
            Target target = null;
            try {
                byte[] bytes = Base64.decode(data, Base64.DEFAULT);
                target = openDownloadsTarget(filename, mimeType, subfolder);
                target.out.write(bytes);
                target.out.flush();
                target.out.close();
                finishTarget(target);
                JSObject ret = new JSObject();
                ret.put("saved", true);
                ret.put("path", target.displayPath);
                ret.put("uri", target.uri != null ? target.uri.toString() : "");
                ret.put("size", bytes.length);
                call.resolve(ret);
            } catch (Exception err) {
                abortTarget(target);
                call.reject("Falha ao salvar em Downloads: " + err.getMessage(), err);
            }
        }).start();
    }

    @PluginMethod
    public void downloadToDownloads(PluginCall call) {
        final String source = call.getString("url");
        final String filename = safeName(call.getString("filename", "arquivo"));
        final String mimeType = call.getString("mimeType", "application/octet-stream");
        final String subfolder = call.getString("subfolder", "TAREFAS");
        if (source == null || source.trim().isEmpty()) {
            call.reject("URL de download ausente.");
            return;
        }
        new Thread(() -> {
            Target target = null;
            HttpURLConnection connection = null;
            try {
                URL url = new URL(source);
                connection = (HttpURLConnection) url.openConnection();
                connection.setConnectTimeout(20000);
                connection.setReadTimeout(60000);
                connection.setInstanceFollowRedirects(true);
                connection.setRequestProperty("User-Agent", "TAREFAS-Android/1.8.7");
                int status = connection.getResponseCode();
                if (status < 200 || status >= 300) throw new IllegalStateException("Servidor respondeu HTTP " + status);
                String remoteMime = connection.getContentType();
                target = openDownloadsTarget(filename, (remoteMime == null || remoteMime.isEmpty()) ? mimeType : remoteMime, subfolder);
                long total = 0;
                try (InputStream in = new BufferedInputStream(connection.getInputStream())) {
                    byte[] buffer = new byte[64 * 1024];
                    int read;
                    while ((read = in.read(buffer)) != -1) {
                        target.out.write(buffer, 0, read);
                        total += read;
                    }
                }
                target.out.flush();
                target.out.close();
                finishTarget(target);
                JSObject ret = new JSObject();
                ret.put("saved", true);
                ret.put("path", target.displayPath);
                ret.put("uri", target.uri != null ? target.uri.toString() : "");
                ret.put("size", total);
                call.resolve(ret);
            } catch (Exception err) {
                abortTarget(target);
                call.reject("Falha ao baixar para Downloads: " + err.getMessage(), err);
            } finally {
                if (connection != null) connection.disconnect();
            }
        }).start();
    }

    private long deleteOldApks(File dir, String keepName, List<String> deleted, long[] count) {
        if (dir == null || !dir.exists()) return 0;
        long bytes = 0;
        File[] files = dir.listFiles();
        if (files == null) return 0;
        for (File file : files) {
            if (file.isDirectory()) {
                bytes += deleteOldApks(file, keepName, deleted, count);
                continue;
            }
            String name = file.getName();
            if (!name.toLowerCase().endsWith(".apk") || name.equalsIgnoreCase(keepName)) continue;
            long size = file.length();
            if (file.delete()) {
                deleted.add(name);
                count[0]++;
                bytes += Math.max(0, size);
            }
        }
        return bytes;
    }

    @PluginMethod
    public void clearOldUpdates(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R && !Environment.isExternalStorageManager()) {
            JSObject ret = new JSObject();
            ret.put("ok", false);
            ret.put("requiresAllFilesAccess", true);
            ret.put("deleted", 0);
            call.resolve(ret);
            return;
        }
        final String currentVersion = call.getString("currentVersion", "");
        final String keepName = currentVersion.isEmpty() ? "" : "TAREFAS-" + currentVersion + ".apk";
        new Thread(() -> {
            try {
                File base = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOCUMENTS), "TAREFAS/Atualização");
                List<String> deleted = new ArrayList<>();
                long[] count = new long[]{0};
                long bytes = deleteOldApks(base, keepName, deleted, count);
                JSObject ret = new JSObject();
                ret.put("ok", true);
                ret.put("requiresAllFilesAccess", false);
                ret.put("deleted", count[0]);
                ret.put("bytes", bytes);
                JSArray arr = new JSArray();
                for (String name : deleted) arr.put(name);
                ret.put("files", arr);
                call.resolve(ret);
            } catch (Exception err) {
                call.reject("Falha ao limpar APKs antigos: " + err.getMessage(), err);
            }
        }).start();
    }
}
