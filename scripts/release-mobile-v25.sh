#!/usr/bin/env bash
set -euo pipefail

VERSION='2.5.0'
BUILD='305'
WEB_VERSION='7.9.7'
APK="TAREFAS-${VERSION}-official-build-${BUILD}.apk"
ZIP="TAREFAS-${VERSION}-official-build-${BUILD}.zip"

npm ci
npm install --no-save --package-lock=false --ignore-scripts jspdf@2.5.2

# Preflight de autorização OIDC para detectar bloqueio de assinatura antes da compilação longa.
OIDC_PREFLIGHT_FILE="$RUNNER_TEMP/oidc-preflight.json"
OIDC_PREFLIGHT_CODE="$(curl --silent --show-error -o "$OIDC_PREFLIGHT_FILE" -w '%{http_code}' \
  -H "Authorization: bearer $ACTIONS_ID_TOKEN_REQUEST_TOKEN" \
  "${ACTIONS_ID_TOKEN_REQUEST_URL}&audience=tarefas-android-signing")"
if [ "$OIDC_PREFLIGHT_CODE" != "200" ]; then
  echo "OIDC_PREFLIGHT_HTTP=$OIDC_PREFLIGHT_CODE"
  cat "$OIDC_PREFLIGHT_FILE"
  exit 41
fi
node --check app/mobile-launcher-icon-v241.js
node --check scripts/build-mobile-v243.mjs
node --check scripts/build-mobile-v245.mjs
node --check scripts/build-mobile-v246.mjs
node --check scripts/build-mobile-v2477.mjs
node --check scripts/build-mobile-v2486.mjs
node --check scripts/verify-mobile-v246.mjs
node --check scripts/verify-mobile-v2486.mjs
node --check scripts/build-mobile-v2415.mjs
node --check scripts/verify-mobile-v2415.mjs
node --check scripts/build-mobile-v25.mjs
node --check scripts/verify-mobile-v25.mjs
node scripts/verify-web.mjs .

# Recria a cadeia até a base validada 2.4.3, aplica 2.4.5 e então a camada Beta 2.4.6 pré-release.
git fetch origin beta-2.3.25
BASE_DIR="$RUNNER_TEMP/base-2325-v246"
git worktree add "$BASE_DIR" origin/beta-2.3.25
ln -s "$GITHUB_WORKSPACE/node_modules" "$BASE_DIR/node_modules"
(
  cd "$BASE_DIR"
  node scripts/build-mobile-v2325.mjs
)
rm -rf "$GITHUB_WORKSPACE/dist"
cp -a "$BASE_DIR/dist" "$GITHUB_WORKSPACE/dist"

node scripts/build-mobile-v240.mjs
node scripts/build-mobile-v242.mjs
node scripts/build-mobile-v243.mjs
node scripts/build-mobile-v245.mjs
node scripts/build-mobile-v246.mjs
node scripts/build-mobile-v2477.mjs
node scripts/build-mobile-v2486.mjs
git fetch origin app/releases
mkdir -p patches
git show origin/app/releases:patches/TAREFAS-2.4.9.11.tpatch > patches/TAREFAS-2.4.9.11.tpatch
git show origin/app/releases:patches/TAREFAS-2.4.13.2.tpatch > patches/TAREFAS-2.4.13.2.tpatch
node scripts/build-mobile-v25.mjs
node scripts/verify-mobile-v25.mjs dist

curl --fail --silent --show-error --retry 3 \
  'https://bpvijatnsluwsgnzklrd.supabase.co/functions/v1/firebase-config-v17' \
  -o app/google-services.json
test -s app/google-services.json

npx cap add android
cp app/google-services.json android/app/google-services.json
sed -i 's/versionCode 1/versionCode 305/' android/app/build.gradle
sed -i 's/versionName "1.0"/versionName "2.5.0"/' android/app/build.gradle

npm run assets:android
npx cap sync android

JAVA_DIR='android/app/src/main/java/br/com/guerravpn/tarefas/mobile'
mkdir -p "$JAVA_DIR"
cp app/android/StorageAccessPlugin.java "$JAVA_DIR/StorageAccessPlugin.java"
cp app/android/TarefasBiometricPlugin.java "$JAVA_DIR/TarefasBiometricPlugin.java"
cp app/android/TarefasLauncherIconPlugin.java "$JAVA_DIR/TarefasLauncherIconPlugin.java"

cat > "$JAVA_DIR/MainActivity.java" <<'JAVA'
package br.com.guerravpn.tarefas.mobile;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
public class MainActivity extends BridgeActivity {
    @Override public void onCreate(Bundle savedInstanceState) {
        registerPlugin(StorageAccessPlugin.class);
        registerPlugin(TarefasBiometricPlugin.class);
        registerPlugin(TarefasLauncherIconPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
JAVA

python3 - <<'PY'
from pathlib import Path
import xml.etree.ElementTree as ET

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

ANDROID='http://schemas.android.com/apk/res/android'
ET.register_namespace('android',ANDROID)
tree=ET.parse(manifest)
root=tree.getroot()
app=root.find('application')
if app is None:
    raise SystemExit('application ausente no AndroidManifest.xml')
app.set('{%s}icon'%ANDROID,'@drawable/tarefas_launcher_blue')
app.set('{%s}roundIcon'%ANDROID,'@drawable/tarefas_launcher_blue')
tree.write(manifest,encoding='utf-8',xml_declaration=True)
PY

mkdir -p android/app/src/main/res/drawable
cat > android/app/src/main/res/drawable/tarefas_launcher_blue.xml <<'XML'
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path android:fillColor="#08290B" android:pathData="M0,0H108V108H0Z"/>
    <path android:fillColor="#55C7FF" android:pathData="M18,20H90V38H63V88H45V38H18Z"/>
    <path android:fillColor="#EAF8FF" android:pathData="M45,45H63V54H45Z"/>
</vector>
XML

(cd android && ./gradlew assembleRelease)

UNSIGNED='android/app/build/outputs/apk/release/app-release-unsigned.apk'
test -s "$UNSIGNED"
unzip -tq "$UNSIGNED"

python3 - <<'PY'
import json
with open('android/app/build/outputs/apk/release/output-metadata.json',encoding='utf-8') as f:
    e=json.load(f)['elements'][0]
assert int(e['versionCode']) == 305, e
assert str(e['versionName']) == '2.5.0', e
PY

unzip -p "$UNSIGNED" assets/public/mobile-bootstrap.js > "$RUNNER_TEMP/bootstrap-v249.js"
unzip -p "$UNSIGNED" assets/public/mobile-login-v17.js > "$RUNNER_TEMP/login-v249.js"
unzip -p "$UNSIGNED" assets/public/dashboard.html > "$RUNNER_TEMP/dashboard-v249.html"
unzip -p "$UNSIGNED" assets/public/dashboard.js > "$RUNNER_TEMP/dashboard-js-v249.js"
unzip -p "$UNSIGNED" assets/public/mobile-patch-manager-v240.js > "$RUNNER_TEMP/pm-v249.js"
unzip -p "$UNSIGNED" assets/public/about.html > "$RUNNER_TEMP/about-v249.html"
unzip -p "$UNSIGNED" assets/public/native-mobile.js > "$RUNNER_TEMP/native-v25.js"
python3 - <<'PY'
from pathlib import Path
import os,zipfile
t=Path(os.environ['RUNNER_TEMP'])
boot=(t/'bootstrap-v249.js').read_text()
login=(t/'login-v249.js').read_text()
html=(t/'dashboard-v249.html').read_text()
dash=(t/'dashboard-js-v249.js').read_text()
pm=(t/'pm-v249.js').read_text()
about=(t/'about-v249.html').read_text()
native=(t/'native-v25.js').read_text()
assert "__TAREFAS_ALPHA_2468_SERVICOS_HOTBAR_FIX__" in boot
assert "__TAREFAS_ALPHA_2467_ESCALAS_2433__" not in boot
for marker in ["__TAREFAS_ALPHA_2481_DISTRIBUICAO_FISCAL_FIX__","__TAREFAS_ALPHA_2482_GUIDES_READY_FIX__","__TAREFAS_ALPHA_2483_FORNECIMENTO__","__TAREFAS_ALPHA_2484_PEDIDO_LAYOUT_FIX__","__TAREFAS_ALPHA_2485_BIOMETRIC_SINGLE_PROMPT__"]:
    assert marker in boot, marker
assert "const APP_VERSION = '2.5.0';" in boot and "const APP_BUILD = 305;" in boot
assert "v2_4_1_1_sync_app_version" in native and "__TAREFAS_ANDROID_VERSION_SYNC__" in native and "2.5" in native
assert "dashboard.html?app=2.5.0" in boot and "dashboard.html?app=2.5.0" in login
assert "mobile-dashboard-v184.js" not in html and "mobile-dashboard-v185.js" not in html
assert "kNextService" not in dash and "Próximo Serviço" not in dash and "Próximo serviço" not in dash
java=Path('app/android/TarefasBiometricPlugin.java').read_text()
for marker in ["authenticateInProgress","pendingAuthenticateCalls","resolvePendingAuthenticateCalls","rejectPendingAuthenticateCalls","synchronized (authenticateLock)"]:
    assert marker in java, marker
assert java.count("new BiometricPrompt(")==1
with zipfile.ZipFile("android/app/build/outputs/apk/release/app-release-unsigned.apk") as z:
    names=set(z.namelist())
    assert "assets/public/mobile-dashboard-v184.js" not in names
    assert "assets/public/mobile-dashboard-v185.js" not in names
    assert "assets/public/mobile-patch-manager-v240.js" in names
    forbidden=[
        "kNextServiceCard","kNextService","tm-next-service-kpi","v756-next-service",
        "ensureNextCard","loadDashboardService","v756NextServiceCss","data-v756-next-icon",
        "Próximo serviço</small>","Próximo Serviço</small>"
    ]
    hits=[]
    for name in names:
        if not name.startswith("assets/public/") or not name.endswith((".js",".html")):
            continue
        try: content=z.read(name).decode("utf-8")
        except UnicodeDecodeError: content=z.read(name).decode("utf-8","replace")
        for token in forbidden:
            if token in content:
                hits.append(f"{name} :: {token}")
    assert not hits, "origem do cartão Próximo Serviço presente no APK: " + " | ".join(hits)
    v756=z.read("assets/public/v7_5_6_patch.js").decode("utf-8")
    assert "loadCalendarServices" in v756 and "applyCalendarServices" in v756
print("APK OPEN-CODE AUDIT OK: sem Próximo Serviço; bundle nativo sincroniza a versão instalada e preserva o Calendário.")
PY
OIDC="$(curl --fail --silent --show-error \
  -H "Authorization: bearer $ACTIONS_ID_TOKEN_REQUEST_TOKEN" \
  "${ACTIONS_ID_TOKEN_REQUEST_URL}&audience=tarefas-android-signing" | jq -r '.value')"
OIDC_PAYLOAD="$(printf '%s' "$OIDC" | cut -d. -f2 | tr '_-' '/+' | awk '{l=length($0)%4;if(l==2)print $0"==";else if(l==3)print $0"=";else print $0}' | base64 -d 2>/dev/null | jq -c '{repository,event_name,ref,workflow_ref}' || true)"
echo "OIDC_RELEASE_CLAIMS=$OIDC_PAYLOAD"

SIGNING_FILE="$RUNNER_TEMP/signing.json"
SIGNING_CODE="$(curl --silent --show-error -o "$SIGNING_FILE" -w '%{http_code}' \
  -H "Authorization: Bearer $OIDC" \
  'https://bpvijatnsluwsgnzklrd.supabase.co/functions/v1/android-signing-material')"
if [ "$SIGNING_CODE" != "200" ]; then
  echo "SIGNING_HTTP=$SIGNING_CODE"
  cat "$SIGNING_FILE"
  exit 42
fi

jq -r '.keystore_b64' "$RUNNER_TEMP/signing.json" | base64 -d > "$RUNNER_TEMP/GuerraVPN.keystore"
STORE_PASS="$(jq -r '.store_password' "$RUNNER_TEMP/signing.json")"
KEY_ALIAS="$(jq -r '.key_alias' "$RUNNER_TEMP/signing.json")"
KEY_PASS="$(jq -r '.key_password' "$RUNNER_TEMP/signing.json")"
EXPECTED_CERT="$(jq -r '.cert_sha256' "$RUNNER_TEMP/signing.json" | tr -d ': ' | tr '[:upper:]' '[:lower:]')"

APKSIGNER="$(find "$ANDROID_HOME/build-tools" -type f -name apksigner | sort -V | tail -1)"
ZIPALIGN="$(find "$ANDROID_HOME/build-tools" -type f -name zipalign | sort -V | tail -1)"
"$ZIPALIGN" -p -f 4 "$UNSIGNED" "$RUNNER_TEMP/aligned.apk"
"$APKSIGNER" sign \
  --ks "$RUNNER_TEMP/GuerraVPN.keystore" \
  --ks-key-alias "$KEY_ALIAS" \
  --ks-pass "pass:$STORE_PASS" \
  --key-pass "pass:$KEY_PASS" \
  --out "$APK" "$RUNNER_TEMP/aligned.apk"

"$APKSIGNER" verify --verbose --print-certs "$APK" | tee "$RUNNER_TEMP/apksigner.txt"
ACTUAL_CERT="$(sed -n 's/.*certificate SHA-256 digest: //p' "$RUNNER_TEMP/apksigner.txt" | head -1 | tr -d ': ' | tr '[:upper:]' '[:lower:]')"
test -n "$ACTUAL_CERT"
test "$ACTUAL_CERT" = "$EXPECTED_CERT"
sha256sum "$APK" | tee "$APK.sha256"

mkdir -p "$RUNNER_TEMP/package/app" "$RUNNER_TEMP/package/scripts" "$RUNNER_TEMP/package/manifest" "$RUNNER_TEMP/package/patches"
cp "$APK" "$APK.sha256" "$RUNNER_TEMP/package/"
cp app/mobile-launcher-icon-v241.js app/release-v25.txt app/native-mobile-entry.js app/android/TarefasBiometricPlugin.java "$RUNNER_TEMP/package/app/"
cp patches/TAREFAS-2.4.8.1.tpatch "$RUNNER_TEMP/package/patches/"
cp patches/TAREFAS-2.4.8.2.tpatch "$RUNNER_TEMP/package/patches/"
cp patches/TAREFAS-2.4.8.3.tpatch "$RUNNER_TEMP/package/patches/"
cp patches/TAREFAS-2.4.8.4.tpatch "$RUNNER_TEMP/package/patches/"
cp patches/TAREFAS-2.4.8.5.tpatch "$RUNNER_TEMP/package/patches/"
cp patches/TAREFAS-2.4.8.7.tpatch patches/TAREFAS-2.4.9.11.tpatch "$RUNNER_TEMP/package/patches/"
cp app/android/TarefasLauncherIconPlugin.java "$RUNNER_TEMP/package/app/"
true
cp scripts/build-mobile-v246.mjs scripts/build-mobile-v2477.mjs scripts/build-mobile-v2486.mjs scripts/build-mobile-v2415.mjs scripts/build-mobile-v25.mjs scripts/verify-mobile-v2486.mjs scripts/verify-mobile-v2415.mjs scripts/verify-mobile-v25.mjs "$RUNNER_TEMP/package/scripts/"
cp dist/RELEASE_2_5_0.json "$RUNNER_TEMP/package/manifest/"
cp patches/TAREFAS-2.4.15.1.tpatch "$RUNNER_TEMP/package/patches/"
(cd "$RUNNER_TEMP/package" && zip -qr "$GITHUB_WORKSPACE/$ZIP" .)
unzip -tq "$ZIP"
sha256sum "$ZIP" | tee "$ZIP.sha256"

git fetch origin app/releases
RELEASES_DIR="$RUNNER_TEMP/tarefas-releases-v25"
git worktree add "$RELEASES_DIR" origin/app/releases
mkdir -p "$RELEASES_DIR/downloads"
cp "$APK" "$APK.sha256" "$ZIP" "$ZIP.sha256" "$RELEASES_DIR/downloads/"
# O catálogo android-release-publish exige o nome canônico TAREFAS-<version>.apk.
CATALOG_APK="$GITHUB_WORKSPACE/TAREFAS-2.5.0.apk"
cp "$APK" "$CATALOG_APK"
sha256sum "$CATALOG_APK" > "$CATALOG_APK.sha256"
cp "$CATALOG_APK" "$CATALOG_APK.sha256" "$RELEASES_DIR/downloads/"
cd "$RELEASES_DIR"
git config user.name 'GuerraVPN Android Build'
git config user.email '81371258+GuerraVPN@users.noreply.github.com'
git add downloads/TAREFAS-2.5.0*
if ! git diff --cached --quiet; then
  git commit -m 'release(android): TAREFAS 2.5 official build 305'
  git push origin HEAD:app/releases
fi
cd "$GITHUB_WORKSPACE"

URL='https://raw.githubusercontent.com/GuerraVPN/Tarefas/app/releases/downloads/TAREFAS-2.5.0.apk'
LOCAL_SHA="$(sha256sum "$APK" | awk '{print $1}')"
for attempt in 1 2 3 4 5 6 7 8; do
  if curl --fail --silent --show-error -L "$URL" -o "$RUNNER_TEMP/published.apk" \
     && test "$(sha256sum "$RUNNER_TEMP/published.apk" | awk '{print $1}')" = "$LOCAL_SHA"; then
    break
  fi
  sleep 3
  test "$attempt" != '8'
done

OIDC_RELEASE="$(curl --fail --silent --show-error \
  -H "Authorization: bearer $ACTIONS_ID_TOKEN_REQUEST_TOKEN" \
  "${ACTIONS_ID_TOKEN_REQUEST_URL}&audience=tarefas-android-release" | jq -r '.value')"

SHA="$(sha256sum "$APK" | awk '{print $1}')"
jq -n \
  --arg version "$VERSION" \
  --argjson build "$BUILD" \
  --arg channel 'official' \
  --arg web_version "$WEB_VERSION" \
  --arg title 'TAREFAS 2.5 — Release Oficial' \
  --arg url "$URL" \
  --arg sha "$SHA" \
  '{
    version:$version,
    build:$build,
    channel:$channel,
    web_version:$web_version,
    title:$title,
    changelog:[
      "📱 Release oficial Android 2.5: versão instalada sincronizada pelo Capacitor, sem exibir versão/identidade da Web no app.",
      "🧭 Menu reorganizado: mantém Escalas, Férias e Dispensas e Usuários; remove a entrada redundante Escala de Serviço.",
      "📅 Calendário: lembretes independentes por data, com edição e exclusão.",
      "🛡️ Tarefas recorrentes: proteção contra processamento concorrente e travamentos relacionados à rotina de recorrência.",
      "🔐 Atualizações: Central de Atualizações e Patch Manager preservados, com validação SHA-256.",
      "🧹 Removido o cartão Próximo Serviço.",
      "📦 Consolida as correções validadas da linha 2.4.15 até a pré-release 2.4.15.2."
    ],
    mandatory:false,
    download_url:$url,
    sha256:$sha
  }' > "$RUNNER_TEMP/release.json"

CODE="$(curl --silent --show-error \
  -o "$RUNNER_TEMP/result.json" \
  -w '%{http_code}' \
  -H "Authorization: Bearer $OIDC_RELEASE" \
  -H 'Content-Type: application/json' \
  --data-binary @"$RUNNER_TEMP/release.json" \
  'https://bpvijatnsluwsgnzklrd.supabase.co/functions/v1/android-release-publish')"

cat "$RUNNER_TEMP/result.json"
test "$CODE" = '200'
jq -e '.ok == true and .version == "2.5.0" and .build == 305 and .channel == "official"' "$RUNNER_TEMP/result.json" >/dev/null

# catalog metadata fix trigger.

# final metadata/path validation trigger.

# final Beta manifest path.

TAG='android-v2.5.0'
if gh release view "$TAG" --repo "$GITHUB_REPOSITORY" >/dev/null 2>&1; then
  gh release upload "$TAG" "$APK" "$APK.sha256" "$ZIP" "$ZIP.sha256" --clobber --repo "$GITHUB_REPOSITORY"
  gh release edit "$TAG" --title 'TAREFAS Android 2.5 — Oficial' --notes-file app/release-v25.txt --latest --repo "$GITHUB_REPOSITORY"
else
  gh release create "$TAG" "$APK" "$APK.sha256" "$ZIP" "$ZIP.sha256" --target "$GITHUB_SHA" --title 'TAREFAS Android 2.5 — Oficial' --notes-file app/release-v25.txt --latest --repo "$GITHUB_REPOSITORY"
fi
