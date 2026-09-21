#!/usr/bin/env bash
set -euo pipefail

VERSION='2.4.0'
BUILD='274'
WEB_VERSION='7.9.1'
APK="TAREFAS-${VERSION}.apk"
ZIP="TAREFAS-${VERSION}-official-build-${BUILD}.zip"

npm ci
npm install --no-save --package-lock=false --ignore-scripts jspdf@2.5.2

# Primeiro valida a base Web 7.9.1 que será incorporada ao APK.
node scripts/verify-web.mjs .

node --check app/mobile-release-v240.js
node --check app/mobile-patch-manager-v240.js
node --check scripts/build-mobile-v240.mjs
node --check scripts/verify-mobile-v240.mjs

node scripts/build-mobile-v240.mjs
node scripts/verify-mobile-v240.mjs dist

curl --fail --silent --show-error --retry 3   'https://bpvijatnsluwsgnzklrd.supabase.co/functions/v1/firebase-config-v17'   -o app/google-services.json
test -s app/google-services.json

npx cap add android
cp app/google-services.json android/app/google-services.json

sed -i 's/versionCode 1/versionCode 274/' android/app/build.gradle
sed -i 's/versionName "1.0"/versionName "2.4.0"/' android/app/build.gradle

npm run assets:android
npx cap sync android

JAVA_DIR='android/app/src/main/java/br/com/guerravpn/tarefas/mobile'
mkdir -p "$JAVA_DIR"
cp app/android/StorageAccessPlugin.java "$JAVA_DIR/StorageAccessPlugin.java"
cp app/android/TarefasBiometricPlugin.java "$JAVA_DIR/TarefasBiometricPlugin.java"

cat > "$JAVA_DIR/MainActivity.java" <<'JAVA'
package br.com.guerravpn.tarefas.mobile;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
public class MainActivity extends BridgeActivity {
    @Override public void onCreate(Bundle savedInstanceState) {
        registerPlugin(StorageAccessPlugin.class);
        registerPlugin(TarefasBiometricPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
JAVA

python3 - <<'PY'
from pathlib import Path

gradle=Path('android/app/build.gradle')
source=gradle.read_text(encoding='utf-8')
dep='implementation "androidx.biometric:biometric:1.1.0"'
if dep not in source:
    source=source.replace('dependencies {',f'dependencies {{\n    {dep}',1)
gradle.write_text(source,encoding='utf-8')

manifest=Path('android/app/src/main/AndroidManifest.xml')
source=manifest.read_text(encoding='utf-8')
for p in [
    '<uses-permission android:name="android.permission.USE_BIOMETRIC" />',
    '<uses-permission android:name="android.permission.USE_FINGERPRINT" />',
    '<uses-permission android:name="android.permission.REQUEST_INSTALL_PACKAGES" />',
    '<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28" />'
]:
    if p not in source:
        source=source.replace('<application',f'    {p}\n    <application',1)
manifest.write_text(source,encoding='utf-8')
PY

(cd android && ./gradlew assembleRelease)

UNSIGNED='android/app/build/outputs/apk/release/app-release-unsigned.apk'
test -s "$UNSIGNED"
unzip -tq "$UNSIGNED"

python3 - <<'PY'
import json
with open('android/app/build/outputs/apk/release/output-metadata.json',encoding='utf-8') as f:
    e=json.load(f)['elements'][0]
assert int(e['versionCode']) == 274, e
assert str(e['versionName']) == '2.4.0', e
PY

# Confere o conteúdo efetivamente empacotado no APK, não apenas o dist local.
unzip -p "$UNSIGNED" assets/public/mobile-alpha-v23223-fix.js > "$RUNNER_TEMP/nav.js"
unzip -p "$UNSIGNED" assets/public/mobile-bootstrap.js > "$RUNNER_TEMP/bootstrap.js"
unzip -p "$UNSIGNED" assets/public/mobile-patch-manager-v240.js > "$RUNNER_TEMP/pm.js"
unzip -p "$UNSIGNED" assets/public/mobile-release-v240.js > "$RUNNER_TEMP/release-runtime.js"
unzip -p "$UNSIGNED" assets/public/mobile-updates-v181.js > "$RUNNER_TEMP/updates.js"
unzip -p "$UNSIGNED" assets/public/v7_5_1_version.js > "$RUNNER_TEMP/web-version.js"
unzip -p "$UNSIGNED" assets/public/v7_9_1_web.js > "$RUNNER_TEMP/web-core.js"
unzip -p "$UNSIGNED" assets/public/v7_9_1_site.js > "$RUNNER_TEMP/site.js"

grep -q '__TAREFAS_RELEASE_NAV_V274__' "$RUNNER_TEMP/nav.js"
grep -q '__TAREFAS_RELEASE_240_BOOT__' "$RUNNER_TEMP/bootstrap.js"
grep -q '__TAREFAS_PATCH_MANAGER_V274__' "$RUNNER_TEMP/pm.js"
grep -q '__TAREFAS_RELEASE_240__' "$RUNNER_TEMP/release-runtime.js"
grep -q '__TAREFAS_RELEASE_240_DIAGNOSTIC_TABS__' "$RUNNER_TEMP/release-runtime.js"
grep -q "WEB_VERSION='7.9.1'" "$RUNNER_TEMP/release-runtime.js"
grep -q "const APP_CHANNEL = 'official';" "$RUNNER_TEMP/updates.js"
grep -q "const VERSION='7.9.1'" "$RUNNER_TEMP/web-version.js"
grep -q "const VERSION='7.9.1'" "$RUNNER_TEMP/web-core.js"
grep -q "const VERSION='7.9.1'" "$RUNNER_TEMP/site.js"

# Assinatura oficial.
OIDC="$(curl --fail --silent --show-error   -H "Authorization: bearer $ACTIONS_ID_TOKEN_REQUEST_TOKEN"   "${ACTIONS_ID_TOKEN_REQUEST_URL}&audience=tarefas-android-signing" | jq -r '.value')"

curl --fail --silent --show-error   -H "Authorization: Bearer $OIDC"   'https://bpvijatnsluwsgnzklrd.supabase.co/functions/v1/android-signing-material'   -o "$RUNNER_TEMP/signing.json"

jq -r '.keystore_b64' "$RUNNER_TEMP/signing.json" | base64 -d > "$RUNNER_TEMP/GuerraVPN.keystore"
STORE_PASS="$(jq -r '.store_password' "$RUNNER_TEMP/signing.json")"
KEY_ALIAS="$(jq -r '.key_alias' "$RUNNER_TEMP/signing.json")"
KEY_PASS="$(jq -r '.key_password' "$RUNNER_TEMP/signing.json")"
EXPECTED_CERT="$(jq -r '.cert_sha256' "$RUNNER_TEMP/signing.json" | tr -d ': ' | tr '[:upper:]' '[:lower:]')"

APKSIGNER="$(find "$ANDROID_HOME/build-tools" -type f -name apksigner | sort -V | tail -1)"
ZIPALIGN="$(find "$ANDROID_HOME/build-tools" -type f -name zipalign | sort -V | tail -1)"

"$ZIPALIGN" -p -f 4 "$UNSIGNED" "$RUNNER_TEMP/aligned.apk"
"$APKSIGNER" sign   --ks "$RUNNER_TEMP/GuerraVPN.keystore"   --ks-key-alias "$KEY_ALIAS"   --ks-pass "pass:$STORE_PASS"   --key-pass "pass:$KEY_PASS"   --out "$APK"   "$RUNNER_TEMP/aligned.apk"

"$APKSIGNER" verify --verbose --print-certs "$APK" | tee "$RUNNER_TEMP/apksigner.txt"
ACTUAL_CERT="$(sed -n 's/.*certificate SHA-256 digest: //p' "$RUNNER_TEMP/apksigner.txt" | head -1 | tr -d ': ' | tr '[:upper:]' '[:lower:]')"
test -n "$ACTUAL_CERT"
test "$ACTUAL_CERT" = "$EXPECTED_CERT"

sha256sum "$APK" | tee "$APK.sha256"

mkdir -p "$RUNNER_TEMP/package/app" "$RUNNER_TEMP/package/scripts" "$RUNNER_TEMP/package/manifest"
cp "$APK" "$APK.sha256" "$RUNNER_TEMP/package/"
cp app/mobile-release-v240.js app/mobile-patch-manager-v240.js app/release-v240.txt "$RUNNER_TEMP/package/app/"
cp scripts/build-mobile-v240.mjs scripts/verify-mobile-v240.mjs "$RUNNER_TEMP/package/scripts/"
cp dist/RELEASE_2_4_0.json "$RUNNER_TEMP/package/manifest/"

(cd "$RUNNER_TEMP/package" && zip -qr "$GITHUB_WORKSPACE/$ZIP" .)
unzip -tq "$ZIP"
sha256sum "$ZIP" | tee "$ZIP.sha256"

# Publica arquivos estáveis usados pelo atualizador interno.
git fetch origin app/releases
RELEASES_DIR="$RUNNER_TEMP/tarefas-releases"
git worktree add "$RELEASES_DIR" origin/app/releases
mkdir -p "$RELEASES_DIR/downloads"
cp "$APK" "$APK.sha256" "$ZIP" "$ZIP.sha256" "$RELEASES_DIR/downloads/"
cd "$RELEASES_DIR"
git config user.name 'GuerraVPN Android Build'
git config user.email '81371258+GuerraVPN@users.noreply.github.com'
git add downloads/TAREFAS-2.4.0*
if ! git diff --cached --quiet; then
  git commit -m 'release(android): TAREFAS 2.4.0 official build 274'
  git push origin HEAD:app/releases
fi
cd "$GITHUB_WORKSPACE"

URL='https://raw.githubusercontent.com/GuerraVPN/Tarefas/app/releases/downloads/TAREFAS-2.4.0.apk'
LOCAL_SHA="$(sha256sum "$APK" | awk '{print $1}')"
for attempt in 1 2 3 4 5 6 7 8; do
  if curl --fail --silent --show-error -L "$URL" -o "$RUNNER_TEMP/published.apk"      && test "$(sha256sum "$RUNNER_TEMP/published.apk" | awk '{print $1}')" = "$LOCAL_SHA"; then
    break
  fi
  sleep 3
  test "$attempt" != '8'
done

# Registra a versão no atualizador interno.
OIDC_RELEASE="$(curl --fail --silent --show-error   -H "Authorization: bearer $ACTIONS_ID_TOKEN_REQUEST_TOKEN"   "${ACTIONS_ID_TOKEN_REQUEST_URL}&audience=tarefas-android-release" | jq -r '.value')"

SHA="$(sha256sum "$APK" | awk '{print $1}')"
jq -n   --arg version "$VERSION"   --argjson build "$BUILD"   --arg channel 'official'   --arg web_version "$WEB_VERSION"   --arg title 'TAREFAS 2.4.0 — Release Oficial'   --arg url "$URL"   --arg sha "$SHA"   '{
    version:$version,
    build:$build,
    channel:$channel,
    web_version:$web_version,
    title:$title,
    changelog:[
      "🌐 Web 7.9.1 incorporada integralmente ao APK.",
      "🔔 Central de Notificações 2.0, Favoritos e Filtros por páginas, módulos e subabas.",
      "🩺 Abas para diagnóstico incorporadas nativamente.",
      "🔐 Biometria somente em um novo início real do app; retorno do segundo plano não exige nova autenticação.",
      "🩹 Gerenciador oficial de patches .tpatch com validação SHA-256 e substituição cumulativa.",
      "🤖 Assistente IA com perfil/permissões, anexos, ações e contexto otimizado.",
      "☁️ Fila offline com recuperação automática quando a conexão retorna.",
      "🛡️ Proteções contra DOM desmontado, respostas obsoletas e CSS exibido como texto.",
      "🖥️ Painel SITE 7.9.1 com Reiniciar, Desligar e EXIT USERS preservando Admin.",
      "📦 Consolida as correções da linha 2.3.x até 2.3.25.3."
    ],
    mandatory:false,
    download_url:$url,
    sha256:$sha
  }' > "$RUNNER_TEMP/release.json"

CODE="$(curl --silent --show-error   -o "$RUNNER_TEMP/result.json"   -w '%{http_code}'   -H "Authorization: Bearer $OIDC_RELEASE"   -H 'Content-Type: application/json'   --data-binary @"$RUNNER_TEMP/release.json"   'https://bpvijatnsluwsgnzklrd.supabase.co/functions/v1/android-release-publish')"

cat "$RUNNER_TEMP/result.json"
test "$CODE" = '200'
jq -e '.ok == true and .version == "2.4.0" and .build == 274 and .channel == "official"' "$RUNNER_TEMP/result.json" >/dev/null

# Publica também como GitHub Release oficial e Latest.
TAG='android-v2.4.0'
if gh release view "$TAG" --repo "$GITHUB_REPOSITORY" >/dev/null 2>&1; then
  gh release upload "$TAG" "$APK" "$APK.sha256" "$ZIP" "$ZIP.sha256" --clobber --repo "$GITHUB_REPOSITORY"
  gh release edit "$TAG"     --title 'TAREFAS Android 2.4.0 — Oficial'     --notes-file app/release-v240.txt     --latest     --repo "$GITHUB_REPOSITORY"
else
  gh release create "$TAG"     "$APK" "$APK.sha256" "$ZIP" "$ZIP.sha256"     --target "$GITHUB_SHA"     --title 'TAREFAS Android 2.4.0 — Oficial'     --notes-file app/release-v240.txt     --latest     --repo "$GITHUB_REPOSITORY"
fi
