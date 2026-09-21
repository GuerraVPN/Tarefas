package br.com.guerravpn.tarefas.mobile;

import android.content.Intent;
import android.content.pm.ShortcutInfo;
import android.content.pm.ShortcutManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.Rect;
import android.graphics.RectF;
import android.graphics.Typeface;
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
    private static final String PREFS = "tarefas_launcher_icon_v241";
    private static final String MODE_KEY = "mode";
    private static final String SHORTCUT_ID = "tarefas-custom-home";

    private boolean supported() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return false;
        ShortcutManager manager = getContext().getSystemService(ShortcutManager.class);
        return manager != null && manager.isRequestPinShortcutSupported();
    }

    @PluginMethod
    public void getState(PluginCall call) {
        JSObject out = new JSObject();
        out.put("mode", getContext().getSharedPreferences(PREFS, 0).getString(MODE_KEY, "blue"));
        out.put("profileShortcutSupported", supported());
        out.put("native", true);
        call.resolve(out);
    }

    private Bitmap presetBitmap(String mode) {
        int bg;
        int fg;
        String glyph = "T";
        switch (mode) {
            case "military":
                bg = 0xFF283620; fg = 0xFFE3E7C8; glyph = "★"; break;
            case "gold":
                bg = 0xFF121212; fg = 0xFFF2C94C; break;
            case "system":
                bg = 0xFFEFF3F7; fg = 0xFF475569; break;
            case "blue":
            default:
                bg = 0xFF08283B; fg = 0xFF55C7FF; break;
        }
        Bitmap out = Bitmap.createBitmap(192, 192, Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(out);
        Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG | Paint.FILTER_BITMAP_FLAG);
        paint.setColor(bg);
        canvas.drawRoundRect(new RectF(0, 0, 192, 192), 42, 42, paint);
        paint.setColor(fg);
        paint.setTextAlign(Paint.Align.CENTER);
        paint.setTypeface(Typeface.create(Typeface.DEFAULT, Typeface.BOLD));
        paint.setTextSize("★".equals(glyph) ? 96f : 110f);
        Paint.FontMetrics fm = paint.getFontMetrics();
        float y = 96f - (fm.ascent + fm.descent) / 2f;
        canvas.drawText(glyph, 96f, y, paint);
        return out;
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
        paint.setColor(0xFF07151C);
        canvas.drawRoundRect(dst, 42, 42, paint);
        android.graphics.Path clip = new android.graphics.Path();
        clip.addRoundRect(dst, 42, 42, android.graphics.Path.Direction.CW);
        canvas.save();
        canvas.clipPath(clip);
        canvas.drawBitmap(source, src, dst, paint);
        canvas.restore();
        return out;
    }

    private ShortcutInfo makeShortcut(Bitmap bitmap, String label) {
        Intent intent = new Intent(getContext(), MainActivity.class);
        intent.setAction(Intent.ACTION_VIEW);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        return new ShortcutInfo.Builder(getContext(), SHORTCUT_ID)
            .setShortLabel(label)
            .setLongLabel(label)
            .setIcon(Icon.createWithBitmap(bitmap))
            .setIntent(intent)
            .build();
    }

    private JSObject applyShortcut(Bitmap bitmap, String mode, String label) {
        JSObject out = new JSObject();
        if (!supported()) {
            out.put("ok", false);
            out.put("supported", false);
            out.put("message", "O launcher deste aparelho não permite ícone personalizado na tela inicial.");
            return out;
        }

        ShortcutManager manager = getContext().getSystemService(ShortcutManager.class);
        ShortcutInfo shortcut = makeShortcut(bitmap, label);
        boolean alreadyPinned = false;
        List<ShortcutInfo> pinned = manager.getPinnedShortcuts();
        for (ShortcutInfo item : pinned) {
            if (SHORTCUT_ID.equals(item.getId())) { alreadyPinned = true; break; }
        }

        if (alreadyPinned) {
            manager.updateShortcuts(Collections.singletonList(shortcut));
            getContext().getSharedPreferences(PREFS, 0).edit().putString(MODE_KEY, mode).apply();
            out.put("ok", true);
            out.put("supported", true);
            out.put("mode", mode);
            out.put("updated", true);
            out.put("requested", false);
            out.put("message", "Ícone da tela inicial atualizado.");
            return out;
        }

        boolean requested = manager.requestPinShortcut(shortcut, null);
        if (requested) getContext().getSharedPreferences(PREFS, 0).edit().putString(MODE_KEY, mode).apply();
        out.put("ok", requested);
        out.put("supported", true);
        out.put("mode", requested ? mode : getContext().getSharedPreferences(PREFS, 0).getString(MODE_KEY, "blue"));
        out.put("updated", false);
        out.put("requested", requested);
        out.put("message", requested
            ? "Confirme no Android para adicionar o ícone TAREFAS à tela inicial."
            : "O launcher não aceitou a solicitação.");
        return out;
    }

    @PluginMethod
    public void setPreset(PluginCall call) {
        String mode = call.getString("mode", "blue");
        if (!"blue".equals(mode) && !"military".equals(mode) && !"gold".equals(mode) && !"system".equals(mode)) {
            call.reject("Ícone inválido.");
            return;
        }
        try { call.resolve(applyShortcut(presetBitmap(mode), mode, "TAREFAS")); }
        catch (Exception error) { call.reject("Não foi possível aplicar o ícone: " + error.getMessage(), error); }
    }

    @PluginMethod
    public void pinProfileShortcut(PluginCall call) {
        String dataUrl = call.getString("avatarDataUrl", "");
        String label = call.getString("label", "TAREFAS");
        if (label == null || label.trim().isEmpty()) label = "TAREFAS";
        try {
            Bitmap bitmap = avatarBitmap(dataUrl);
            if (bitmap == null) { call.reject("O perfil ainda não possui uma imagem válida."); return; }
            call.resolve(applyShortcut(bitmap, "profile", label.trim()));
        } catch (Exception error) {
            call.reject("Não foi possível usar o ícone do perfil: " + error.getMessage(), error);
        }
    }
}
