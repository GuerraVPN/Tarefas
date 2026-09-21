package br.com.guerravpn.tarefas.mobile;

import android.app.PendingIntent;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.content.pm.ShortcutInfo;
import android.content.pm.ShortcutManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.Rect;
import android.graphics.RectF;
import android.graphics.drawable.Icon;
import android.os.Build;
import android.util.Base64;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.Collections;
import java.util.List;

@CapacitorPlugin(name = "TarefasLauncherIcon")
public class TarefasLauncherIconPlugin extends Plugin {
    private static final String PREFS = "tarefas_launcher_icon_v2401";
    private static final String MODE_KEY = "mode";
    private static final String PROFILE_SHORTCUT_ID = "tarefas-profile-home";

    private static final String[] MODES = {"blue", "military", "gold", "system"};
    private static final String[] ALIASES = {
        ".LauncherBlue",
        ".LauncherMilitary",
        ".LauncherGold",
        ".LauncherSystem"
    };

    private SharedPreferences prefs() {
        return getContext().getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    private boolean validMode(String mode) {
        if (mode == null) return false;
        for (String item : MODES) if (item.equals(mode)) return true;
        return false;
    }

    private void setAliasState(String alias, boolean enabled) {
        PackageManager pm = getContext().getPackageManager();
        ComponentName component = new ComponentName(
            getContext().getPackageName(),
            getContext().getPackageName() + alias
        );
        pm.setComponentEnabledSetting(
            component,
            enabled ? PackageManager.COMPONENT_ENABLED_STATE_ENABLED : PackageManager.COMPONENT_ENABLED_STATE_DISABLED,
            PackageManager.DONT_KILL_APP
        );
    }

    @PluginMethod
    public void getState(PluginCall call) {
        JSObject out = new JSObject();
        out.put("mode", prefs().getString(MODE_KEY, "blue"));
        out.put("profileShortcutSupported",
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.O &&
            getContext().getSystemService(ShortcutManager.class) != null &&
            getContext().getSystemService(ShortcutManager.class).isRequestPinShortcutSupported()
        );
        out.put("native", true);
        call.resolve(out);
    }

    @PluginMethod
    public void setPreset(PluginCall call) {
        String mode = call.getString("mode", "blue");
        if (!validMode(mode)) {
            call.reject("Ícone inválido.");
            return;
        }

        try {
            // Liga o novo primeiro para nunca deixar o app sem entrada no launcher.
            for (int i = 0; i < MODES.length; i++) {
                if (MODES[i].equals(mode)) setAliasState(ALIASES[i], true);
            }
            for (int i = 0; i < MODES.length; i++) {
                if (!MODES[i].equals(mode)) setAliasState(ALIASES[i], false);
            }

            prefs().edit().putString(MODE_KEY, mode).apply();
            JSObject out = new JSObject();
            out.put("ok", true);
            out.put("mode", mode);
            out.put("message", "Ícone alterado. O launcher pode levar alguns segundos para atualizar.");
            call.resolve(out);
        } catch (Exception error) {
            call.reject("Não foi possível trocar o ícone: " + error.getMessage(), error);
        }
    }

    private Bitmap avatarBitmap(String dataUrl) {
        if (dataUrl == null || dataUrl.trim().isEmpty()) return null;
        String raw = dataUrl.trim();
        int comma = raw.indexOf(',');
        if (comma >= 0) raw = raw.substring(comma + 1);
        byte[] bytes = Base64.decode(raw, Base64.DEFAULT);
        Bitmap source = BitmapFactory.decodeByteArray(bytes, 0, bytes.length);
        if (source == null) return null;

        int size = Math.min(source.getWidth(), source.getHeight());
        int left = Math.max(0, (source.getWidth() - size) / 2);
        int top = Math.max(0, (source.getHeight() - size) / 2);

        Bitmap out = Bitmap.createBitmap(192, 192, Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(out);
        Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG | Paint.FILTER_BITMAP_FLAG);
        Rect src = new Rect(left, top, left + size, top + size);
        RectF dst = new RectF(0, 0, 192, 192);

        // Fundo e recorte circular para ficar consistente com launchers modernos.
        paint.setColor(0xFF07151C);
        canvas.drawOval(dst, paint);
        canvas.save();
        canvas.clipPath(new android.graphics.Path() {{
            addOval(dst, Direction.CW);
        }});
        canvas.drawBitmap(source, src, dst, paint);
        canvas.restore();
        return out;
    }

    private ShortcutInfo profileShortcut(Bitmap bitmap, String label) {
        Intent intent = new Intent(getContext(), MainActivity.class);
        intent.setAction(Intent.ACTION_VIEW);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);

        return new ShortcutInfo.Builder(getContext(), PROFILE_SHORTCUT_ID)
            .setShortLabel(label)
            .setLongLabel(label)
            .setIcon(Icon.createWithBitmap(bitmap))
            .setIntent(intent)
            .build();
    }

    @PluginMethod
    public void pinProfileShortcut(PluginCall call) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            call.reject("O ícone do perfil na tela inicial requer Android 8 ou superior.");
            return;
        }

        ShortcutManager manager = getContext().getSystemService(ShortcutManager.class);
        if (manager == null || !manager.isRequestPinShortcutSupported()) {
            call.reject("O launcher deste aparelho não permite fixar ícones personalizados.");
            return;
        }

        String dataUrl = call.getString("avatarDataUrl", "");
        String label = call.getString("label", "TAREFAS");
        if (label == null || label.trim().isEmpty()) label = "TAREFAS";

        try {
            Bitmap bitmap = avatarBitmap(dataUrl);
            if (bitmap == null) {
                call.reject("O perfil ainda não possui uma imagem válida.");
                return;
            }

            ShortcutInfo shortcut = profileShortcut(bitmap, label.trim());
            boolean alreadyPinned = false;
            List<ShortcutInfo> pinned = manager.getPinnedShortcuts();
            for (ShortcutInfo item : pinned) {
                if (PROFILE_SHORTCUT_ID.equals(item.getId())) {
                    alreadyPinned = true;
                    break;
                }
            }

            if (alreadyPinned) {
                manager.updateShortcuts(Collections.singletonList(shortcut));
                prefs().edit().putString(MODE_KEY, "profile").apply();
                JSObject out = new JSObject();
                out.put("ok", true);
                out.put("mode", "profile");
                out.put("updated", true);
                out.put("requested", false);
                out.put("message", "Ícone do perfil atualizado na tela inicial.");
                call.resolve(out);
                return;
            }

            boolean requested = manager.requestPinShortcut(shortcut, null);
            if (requested) prefs().edit().putString(MODE_KEY, "profile").apply();

            JSObject out = new JSObject();
            out.put("ok", requested);
            out.put("mode", requested ? "profile" : prefs().getString(MODE_KEY, "blue"));
            out.put("updated", false);
            out.put("requested", requested);
            out.put("message", requested
                ? "Confirme no Android para adicionar o ícone do perfil à tela inicial."
                : "O launcher não aceitou a solicitação.");
            call.resolve(out);
        } catch (Exception error) {
            call.reject("Não foi possível criar o ícone do perfil: " + error.getMessage(), error);
        }
    }
}
