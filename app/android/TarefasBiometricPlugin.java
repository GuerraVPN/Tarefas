package br.com.guerravpn.tarefas.mobile;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Build;
import android.provider.Settings;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyPermanentlyInvalidatedException;
import android.security.keystore.KeyProperties;
import android.util.Base64;

import androidx.annotation.NonNull;
import androidx.biometric.BiometricManager;
import androidx.biometric.BiometricPrompt;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.FragmentActivity;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.nio.charset.StandardCharsets;
import java.security.KeyStore;
import java.util.concurrent.Executor;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

@CapacitorPlugin(name = "TarefasBiometric")
public class TarefasBiometricPlugin extends Plugin {
    private static final String KEY_ALIAS = "tarefas_biometric_login_v1";
    private static final String PREFS_NAME = "tarefas_biometric_login";
    private static final String PREF_CIPHERTEXT = "ciphertext";
    private static final String PREF_IV = "iv";
    private static final int AUTHENTICATORS = BiometricManager.Authenticators.BIOMETRIC_STRONG;

    private SharedPreferences preferences() {
        return getContext().getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    }

    private KeyStore keyStore() throws Exception {
        KeyStore store = KeyStore.getInstance("AndroidKeyStore");
        store.load(null);
        return store;
    }

    private SecretKey getOrCreateKey() throws Exception {
        KeyStore store = keyStore();
        if (store.containsAlias(KEY_ALIAS)) {
            return (SecretKey) store.getKey(KEY_ALIAS, null);
        }

        KeyGenerator generator = KeyGenerator.getInstance(
            KeyProperties.KEY_ALGORITHM_AES,
            "AndroidKeyStore"
        );
        KeyGenParameterSpec.Builder builder = new KeyGenParameterSpec.Builder(
            KEY_ALIAS,
            KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT
        )
            .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
            .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
            .setUserAuthenticationRequired(true);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            builder.setUserAuthenticationParameters(0, KeyProperties.AUTH_BIOMETRIC_STRONG);
        } else {
            builder.setUserAuthenticationValidityDurationSeconds(-1);
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            builder.setInvalidatedByBiometricEnrollment(true);
        }

        generator.init(builder.build());
        return generator.generateKey();
    }

    private boolean hasCredentialInternal() {
        try {
            SharedPreferences prefs = preferences();
            return keyStore().containsAlias(KEY_ALIAS)
                && !prefs.getString(PREF_CIPHERTEXT, "").isEmpty()
                && !prefs.getString(PREF_IV, "").isEmpty();
        } catch (Exception ignored) {
            return false;
        }
    }

    private void clearCredentialInternal() {
        preferences().edit().clear().apply();
        try {
            KeyStore store = keyStore();
            if (store.containsAlias(KEY_ALIAS)) store.deleteEntry(KEY_ALIAS);
        } catch (Exception ignored) {}
    }

    private JSObject availabilityResult() {
        int status = BiometricManager.from(getContext()).canAuthenticate(AUTHENTICATORS);
        JSObject result = new JSObject();
        result.put("available", status == BiometricManager.BIOMETRIC_SUCCESS);
        result.put("enrolled", status == BiometricManager.BIOMETRIC_SUCCESS);
        result.put("hasCredential", hasCredentialInternal());
        if (status == BiometricManager.BIOMETRIC_SUCCESS) result.put("reason", "ready");
        else if (status == BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED) result.put("reason", "not_enrolled");
        else if (status == BiometricManager.BIOMETRIC_ERROR_NO_HARDWARE) result.put("reason", "no_hardware");
        else if (status == BiometricManager.BIOMETRIC_ERROR_HW_UNAVAILABLE) result.put("reason", "hardware_unavailable");
        else result.put("reason", "unsupported");
        return result;
    }

    @PluginMethod
    public void isAvailable(PluginCall call) {
        call.resolve(availabilityResult());
    }

    @PluginMethod
    public void hasCredential(PluginCall call) {
        JSObject result = new JSObject();
        result.put("hasCredential", hasCredentialInternal());
        call.resolve(result);
    }

    @PluginMethod
    public void clear(PluginCall call) {
        clearCredentialInternal();
        JSObject result = new JSObject();
        result.put("cleared", true);
        call.resolve(result);
    }

    @PluginMethod
    public void openSettings(PluginCall call) {
        try {
            android.content.Intent intent = new android.content.Intent(Settings.ACTION_BIOMETRIC_ENROLL);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                intent.putExtra(Settings.EXTRA_BIOMETRIC_AUTHENTICATORS_ALLOWED, AUTHENTICATORS);
            }
            getActivity().startActivity(intent);
            JSObject result = new JSObject();
            result.put("opened", true);
            call.resolve(result);
        } catch (Exception error) {
            try {
                getActivity().startActivity(new android.content.Intent(Settings.ACTION_SECURITY_SETTINGS));
                JSObject result = new JSObject();
                result.put("opened", true);
                call.resolve(result);
            } catch (Exception fallbackError) {
                call.reject("Não foi possível abrir as configurações de biometria.", "SETTINGS_UNAVAILABLE");
            }
        }
    }

    @PluginMethod
    public void enable(PluginCall call) {
        String sessionToken = call.getString("sessionToken", "").trim();
        if (sessionToken.length() < 32 || sessionToken.length() > 512) {
            call.reject("Sessão inválida. Entre novamente com CPF e senha.", "INVALID_SESSION");
            return;
        }
        if (BiometricManager.from(getContext()).canAuthenticate(AUTHENTICATORS) != BiometricManager.BIOMETRIC_SUCCESS) {
            call.reject("Cadastre uma biometria segura nas configurações do Android.", "BIOMETRIC_UNAVAILABLE");
            return;
        }

        try {
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, getOrCreateKey());
            showPrompt(call, cipher, true, sessionToken);
        } catch (KeyPermanentlyInvalidatedException invalidated) {
            clearCredentialInternal();
            call.reject("A biometria do aparelho mudou. Ative o login biométrico novamente.", "CREDENTIAL_INVALIDATED");
        } catch (Exception error) {
            call.reject("Não foi possível proteger a sessão biométrica.", "BIOMETRIC_SETUP_FAILED", error);
        }
    }

    @PluginMethod
    public void authenticate(PluginCall call) {
        if (!hasCredentialInternal()) {
            call.reject("Login biométrico ainda não foi ativado neste aparelho.", "NO_CREDENTIAL");
            return;
        }
        if (BiometricManager.from(getContext()).canAuthenticate(AUTHENTICATORS) != BiometricManager.BIOMETRIC_SUCCESS) {
            call.reject("A biometria não está disponível. Entre com CPF e senha.", "BIOMETRIC_UNAVAILABLE");
            return;
        }

        try {
            byte[] iv = Base64.decode(preferences().getString(PREF_IV, ""), Base64.NO_WRAP);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, getOrCreateKey(), new GCMParameterSpec(128, iv));
            showPrompt(call, cipher, false, null);
        } catch (KeyPermanentlyInvalidatedException invalidated) {
            clearCredentialInternal();
            call.reject("A biometria do aparelho mudou. Entre com CPF e senha.", "CREDENTIAL_INVALIDATED");
        } catch (Exception error) {
            clearCredentialInternal();
            call.reject("Não foi possível abrir o login biométrico. Entre com CPF e senha.", "BIOMETRIC_AUTH_FAILED", error);
        }
    }

    private void showPrompt(PluginCall call, Cipher cipher, boolean encrypting, String sessionToken) {
        getActivity().runOnUiThread(() -> {
            if (!(getActivity() instanceof FragmentActivity)) {
                call.reject("Tela incompatível com o login biométrico.", "ACTIVITY_UNAVAILABLE");
                return;
            }

            Executor executor = ContextCompat.getMainExecutor(getContext());
            BiometricPrompt prompt = new BiometricPrompt(
                (FragmentActivity) getActivity(),
                executor,
                new BiometricPrompt.AuthenticationCallback() {
                    @Override
                    public void onAuthenticationError(int errorCode, @NonNull CharSequence errString) {
                        super.onAuthenticationError(errorCode, errString);
                        String code = (errorCode == BiometricPrompt.ERROR_NEGATIVE_BUTTON
                            || errorCode == BiometricPrompt.ERROR_USER_CANCELED
                            || errorCode == BiometricPrompt.ERROR_CANCELED)
                            ? "BIOMETRIC_CANCELED" : "BIOMETRIC_ERROR";
                        call.reject(errString.toString(), code);
                    }

                    @Override
                    public void onAuthenticationSucceeded(@NonNull BiometricPrompt.AuthenticationResult result) {
                        super.onAuthenticationSucceeded(result);
                        try {
                            BiometricPrompt.CryptoObject cryptoObject = result.getCryptoObject();
                            Cipher authenticatedCipher = cryptoObject == null ? null : cryptoObject.getCipher();
                            if (authenticatedCipher == null) throw new IllegalStateException("Cipher biométrico ausente");

                            JSObject response = new JSObject();
                            if (encrypting) {
                                byte[] encrypted = authenticatedCipher.doFinal(sessionToken.getBytes(StandardCharsets.UTF_8));
                                preferences().edit()
                                    .putString(PREF_CIPHERTEXT, Base64.encodeToString(encrypted, Base64.NO_WRAP))
                                    .putString(PREF_IV, Base64.encodeToString(authenticatedCipher.getIV(), Base64.NO_WRAP))
                                    .apply();
                                response.put("enabled", true);
                            } else {
                                byte[] encrypted = Base64.decode(
                                    preferences().getString(PREF_CIPHERTEXT, ""),
                                    Base64.NO_WRAP
                                );
                                byte[] decrypted = authenticatedCipher.doFinal(encrypted);
                                response.put("sessionToken", new String(decrypted, StandardCharsets.UTF_8));
                                response.put("authenticated", true);
                            }
                            call.resolve(response);
                        } catch (Exception error) {
                            if (!encrypting) clearCredentialInternal();
                            call.reject("Falha ao processar a credencial biométrica.", "CRYPTO_FAILED", error);
                        }
                    }
                }
            );

            BiometricPrompt.PromptInfo promptInfo = new BiometricPrompt.PromptInfo.Builder()
                .setTitle(encrypting ? "Ativar login biométrico" : "Entrar no TAREFAS")
                .setSubtitle(encrypting
                    ? "Confirme sua biometria para proteger o acesso neste aparelho"
                    : "Use sua impressão digital ou reconhecimento facial")
                .setAllowedAuthenticators(AUTHENTICATORS)
                .setNegativeButtonText("Usar senha")
                .setConfirmationRequired(false)
                .build();
            prompt.authenticate(promptInfo, new BiometricPrompt.CryptoObject(cipher));
        });
    }
}
