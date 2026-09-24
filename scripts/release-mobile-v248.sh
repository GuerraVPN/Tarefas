#!/usr/bin/env bash
set -euo pipefail

VERSION='2.4.8'
BUILD='290'
WEB_VERSION='7.9.1'
APK="TAREFAS-${VERSION}.apk"
ZIP="TAREFAS-${VERSION}-beta-build-${BUILD}.zip"

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
node --check scripts/build-mobile-v248.mjs
node --check scripts/verify-mobile-v246.mjs
node --check scripts/verify-mobile-v248.mjs
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
node scripts/build-mobile-v248.mjs
node scripts/verify-mobile-v248.mjs dist

curl --fail --silent --show-error --retry 3 \
  'https://bpvijatnsluwsgnzklrd.supabase.co/functions/v1/firebase-config-v17' \
  -o app/google-services.json
test -s app/google-services.json

npx cap add android
cp app/google-services.json android/app/google-services.json
sed -i 's/versionCode 1/versionCode 290/' android/app/build.gradle
sed -i 's/versionName "1.0"/versionName "2.4.8"/' android/app/build.gradle

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
assert int(e['versionCode']) == 290, e
assert str(e['versionName']) == '2.4.8', e
PY

unzip -p "$UNSIGNED" assets/public/mobile-bootstrap.js > "$RUNNER_TEMP/bootstrap-v248.js"
unzip -p "$UNSIGNED" assets/public/mobile-login-v17.js > "$RUNNER_TEMP/login-v248.js"
unzip -p "$UNSIGNED" assets/public/dashboard.html > "$RUNNER_TEMP/dashboard-v248.html"
unzip -p "$UNSIGNED" assets/public/dashboard.js > "$RUNNER_TEMP/dashboard-js-v248.js"
unzip -p "$UNSIGNED" assets/public/mobile-patch-manager-v240.js > "$RUNNER_TEMP/pm-v248.js"
unzip -p "$UNSIGNED" assets/public/about.html > "$RUNNER_TEMP/about-v248.html"
python3 - <<'PY'
from pathlib import Path
import os,zipfile
t=Path(os.environ['RUNNER_TEMP'])
boot=(t/'bootstrap-v248.js').read_text()
login=(t/'login-v248.js').read_text()
html=(t/'dashboard-v248.html').read_text()
dash=(t/'dashboard-js-v248.js').read_text()
pm=(t/'pm-v248.js').read_text()
about=(t/'about-v248.html').read_text()
assert "__TAREFAS_BETA_2468_SERVICOS_HOTBAR_FIX__" in boot
assert "__TAREFAS_BETA_2467_ESCALAS_2433__" not in boot
assert "const APP_VERSION = '2.4.8';" in boot and "const APP_BUILD = 290;" in boot
assert "dashboard.html?app=2.4.8" in boot and "dashboard.html?app=2.4.8" in login
assert "mobile-dashboard-v184.js" not in html and "mobile-dashboard-v185.js" not in html
assert "kNextService" not in dash and "Próximo Serviço" not in dash and "Próximo serviço" not in dash
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
print("APK OPEN-CODE AUDIT OK: nenhum JS/HTML empacotado contém a origem do cartão Próximo Serviço; v7.5.6 mantém as correções de calendário.")
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

mkdir -p "$RUNNER_TEMP/package/app" "$RUNNER_TEMP/package/scripts" "$RUNNER_TEMP/package/manifest"
cp "$APK" "$APK.sha256" "$RUNNER_TEMP/package/"
cp app/mobile-launcher-icon-v241.js app/release-v248.txt "$RUNNER_TEMP/package/app/"
cp app/android/TarefasLauncherIconPlugin.java "$RUNNER_TEMP/package/app/"
true
cp scripts/build-mobile-v246.mjs scripts/build-mobile-v248.mjs scripts/verify-mobile-v248.mjs "$RUNNER_TEMP/package/scripts/"
cp dist/BETA_2_4_7_7.json "$RUNNER_TEMP/package/manifest/"
(cd "$RUNNER_TEMP/package" && zip -qr "$GITHUB_WORKSPACE/$ZIP" .)
unzip -tq "$ZIP"
sha256sum "$ZIP" | tee "$ZIP.sha256"

git fetch origin app/releases
RELEASES_DIR="$RUNNER_TEMP/tarefas-releases-v248"
git worktree add "$RELEASES_DIR" origin/app/releases
mkdir -p "$RELEASES_DIR/downloads"
cp "$APK" "$APK.sha256" "$ZIP" "$ZIP.sha256" "$RELEASES_DIR/downloads/"
cd "$RELEASES_DIR"
git config user.name 'GuerraVPN Android Build'
git config user.email '81371258+GuerraVPN@users.noreply.github.com'
git add downloads/TAREFAS-2.4.8*
if ! git diff --cached --quiet; then
  git commit -m 'release(android): TAREFAS 2.4.8 beta build 290'
  git push origin HEAD:app/releases
fi
cd "$GITHUB_WORKSPACE"

URL='https://raw.githubusercontent.com/GuerraVPN/Tarefas/app/releases/downloads/TAREFAS-2.4.8.apk'
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
  --arg channel 'beta' \
  --arg web_version "$WEB_VERSION" \
  --arg title 'TAREFAS 2.4.8 Beta — remoção definitiva do cartão Próximo Serviço' \
  --arg url "$URL" \
  --arg sha "$SHA" \
  '{
    version:$version,
    build:$build,
    channel:$channel,
    web_version:$web_version,
    title:$title,
    changelog:[
      "🧪 Beta 2.4.8 para remover o cartão Próximo Serviço do Dashboard.",
      "🧹 Remove somente o cartão Próximo Serviço do Dashboard; demais recursos ficam preservados.",
      "🧩 Patch incorporado: somente 2.4.6.8; 2.4.6.7 não foi incorporado.",
      "🔐 Patch Manager mantém validação SHA-256 diretamente sobre os bytes do .tpatch.",
      "📜 Histórico de versões e remoção do Próximo Serviço preservados.",
      "🌐 Web 7.9.1 preservada.",
      "🔔 Canal Beta preservado.",
      "🧪 Neutralizador v185 + limpeza defensiva do legado v184; objetivo: eliminar o cartão mesmo com cache/DOM antigo."
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
jq -e '.ok == true and .version == "2.4.8" and .build == 290 and .channel == "beta"' "$RUNNER_TEMP/result.json" >/dev/null
