#!/usr/bin/env bash
set -euo pipefail

VERSION='2.4.7.1'
BUILD='283'
WEB_VERSION='7.9.1'
APK="TAREFAS-${VERSION}.apk"
ZIP="TAREFAS-${VERSION}-alpha-build-${BUILD}.zip"

npm ci
npm install --no-save --package-lock=false --ignore-scripts jspdf@2.5.2

node --check app/mobile-launcher-icon-v241.js
node --check scripts/build-mobile-v243.mjs
node --check scripts/build-mobile-v245.mjs
node --check scripts/build-mobile-v246.mjs
node scripts/build-mobile-v2471.mjs
node --check scripts/verify-mobile-v246.mjs
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
node scripts/build-mobile-v2471.mjs
node scripts/verify-mobile-v2471.mjs dist

curl --fail --silent --show-error --retry 3 \
  'https://bpvijatnsluwsgnzklrd.supabase.co/functions/v1/firebase-config-v17' \
  -o app/google-services.json
test -s app/google-services.json

npx cap add android
cp app/google-services.json android/app/google-services.json
sed -i 's/versionCode 1/versionCode 283/' android/app/build.gradle
sed -i 's/versionName "1.0"/versionName "2.4.7.1"/' android/app/build.gradle

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
    <path android:fillColor="#08283B" android:pathData="M0,0H108V108H0Z"/>
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
assert int(e['versionCode']) == 283, e
assert str(e['versionName']) == '2.4.7.1', e
PY

unzip -p "$UNSIGNED" assets/public/mobile-launcher-icon-v241.js > "$RUNNER_TEMP/launcher-v2471.js"
unzip -p "$UNSIGNED" assets/public/mobile-bootstrap.js > "$RUNNER_TEMP/bootstrap-v246.js"
unzip -p "$UNSIGNED" assets/public/mobile-patch-manager-v240.js > "$RUNNER_TEMP/pm-v246.js"
unzip -p "$UNSIGNED" assets/public/mobile-updates-v181.js > "$RUNNER_TEMP/updates-v246.js"
grep -q '__TAREFAS_LAUNCHER_ICON_241__' "$RUNNER_TEMP/launcher-v246.js"
grep -q 'pinProfileShortcut' "$RUNNER_TEMP/launcher-v246.js"
grep -q '__TAREFAS_BETA_246_BOOT__' "$RUNNER_TEMP/bootstrap-v246.js"
grep -q '__TAREFAS_PATCH_MANAGER_V281__' "$RUNNER_TEMP/pm-v246.js"
grep -q "v1_8_get_beta_updates" "$RUNNER_TEMP/pm-v246.js"
grep -q "v2_3_21_alpha_context" "$RUNNER_TEMP/pm-v246.js"
grep -q "const APP_CHANNEL = 'alpha';" "$RUNNER_TEMP/updates-v246.js"
grep -q "const APP_VERSION = '2.4.6';" "$RUNNER_TEMP/bootstrap-v246.js"
grep -q "const APP_BUILD = 281;" "$RUNNER_TEMP/bootstrap-v246.js"
grep -q "basedOn:'2.4.5'" "$RUNNER_TEMP/bootstrap-v246.js"
grep -q "const APP_VERSION='2.4.7.1',APP_BUILD=281,APP_CHANNEL='beta';" "$RUNNER_TEMP/pm-v246.js"
grep -q "sha256Bytes" "$RUNNER_TEMP/pm-v246.js"
grep -q "fetchOfficialBytes" "$RUNNER_TEMP/pm-v246.js"
grep -q "crypto.subtle.digest" "$RUNNER_TEMP/pm-v246.js"
grep -q "const APP_VERSION = '2.4.6';" "$RUNNER_TEMP/updates-v246.js"
grep -q "const APP_BUILD = 281;" "$RUNNER_TEMP/updates-v246.js"
unzip -p "$UNSIGNED" assets/public/dashboard.html > "$RUNNER_TEMP/dashboard-v246.html"
grep -q "mobile-launcher-icon-v241.js" "$RUNNER_TEMP/dashboard-v246.html"
grep -q "tmScales246" "$RUNNER_TEMP/bootstrap-v246.js"
grep -q "1T_BM9KY0NLwVhlifetQ6W6AdetujQjx--zOZHa27eQs" "$RUNNER_TEMP/bootstrap-v246.js"
grep -q "1_LlfIHx4EuSHkC9BOR2VorvXoaiMyLa028wU6C0dQLs" "$RUNNER_TEMP/bootstrap-v246.js"
grep -q "13eEei_JdGjAdVo371BGfPS59QdYySe9lJ47DLjWb_x0" "$RUNNER_TEMP/bootstrap-v246.js"
! grep -q "Pessoal / Escalas" "$RUNNER_TEMP/bootstrap-v246.js"
! grep -q "Missões" "$RUNNER_TEMP/bootstrap-v246.js"

OIDC="$(curl --fail --silent --show-error \
  -H "Authorization: bearer $ACTIONS_ID_TOKEN_REQUEST_TOKEN" \
  "${ACTIONS_ID_TOKEN_REQUEST_URL}&audience=tarefas-android-signing" | jq -r '.value')"
OIDC_PAYLOAD="$(printf '%s' "$OIDC" | cut -d. -f2 | tr '_-' '/+' | awk '{l=length($0)%4;if(l==2)print $0"==";else if(l==3)print $0"=";else print $0}' | base64 -d 2>/dev/null | jq -c '{repository,event_name,ref,workflow_ref}' || true)"
echo "OIDC_RELEASE_CLAIMS=$OIDC_PAYLOAD"

curl --fail --silent --show-error \
  -H "Authorization: Bearer $OIDC" \
  'https://bpvijatnsluwsgnzklrd.supabase.co/functions/v1/android-signing-material' \
  -o "$RUNNER_TEMP/signing.json"

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
cp app/mobile-launcher-icon-v241.js app/release-v2471.txt "$RUNNER_TEMP/package/app/"
cp app/android/TarefasLauncherIconPlugin.java "$RUNNER_TEMP/package/app/"
cp scripts/build-mobile-v246.mjs scripts/build-mobile-v2471.mjs scripts/verify-mobile-v2471.mjs "$RUNNER_TEMP/package/scripts/"
cp dist/ALPHA_2_4_7_1.json "$RUNNER_TEMP/package/manifest/"
(cd "$RUNNER_TEMP/package" && zip -qr "$GITHUB_WORKSPACE/$ZIP" .)
unzip -tq "$ZIP"
sha256sum "$ZIP" | tee "$ZIP.sha256"

git fetch origin app/releases
RELEASES_DIR="$RUNNER_TEMP/tarefas-releases-v2471"
git worktree add "$RELEASES_DIR" origin/app/releases
mkdir -p "$RELEASES_DIR/downloads"
cp "$APK" "$APK.sha256" "$ZIP" "$ZIP.sha256" "$RELEASES_DIR/downloads/"
cd "$RELEASES_DIR"
git config user.name 'GuerraVPN Android Build'
git config user.email '81371258+GuerraVPN@users.noreply.github.com'
git add downloads/TAREFAS-2.4.7.1*
if ! git diff --cached --quiet; then
  git commit -m 'release(android): TAREFAS 2.4.7.1 alpha build 283'
  git push origin HEAD:app/releases
fi
cd "$GITHUB_WORKSPACE"

URL='https://raw.githubusercontent.com/GuerraVPN/Tarefas/app/releases/downloads/TAREFAS-2.4.7.1.apk'
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
  --arg channel 'alpha' \
  --arg web_version "$WEB_VERSION" \
  --arg title 'TAREFAS 2.4.7.1 Alpha — teste somente do patch 2.4.6.8' \
  --arg url "$URL" \
  --arg sha "$SHA" \
  '{
    version:$version,
    build:$build,
    channel:$channel,
    web_version:$web_version,
    title:$title,
    changelog:[
      "🧪 Alpha 2.4.7.1 para testar somente a incorporação do patch 2.4.6.8.",
      "🔒 Sem funcionalidades novas: foco em estabilidade e regressão.",
      "🧩 Patch incorporado: somente 2.4.6.8; 2.4.6.7 não foi incorporado.",
      "🔐 Patch Manager mantém validação SHA-256 diretamente sobre os bytes do .tpatch.",
      "📜 Histórico de versões e remoção do Próximo Serviço preservados.",
      "🌐 Web 7.9.1 preservada.",
      "🔔 Canal Alpha preservado.",
      "🧪 Objetivo: dar o veredito final da base antes da próxima etapa."
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
jq -e '.ok == true and .version == "2.4.7.1" and .build == 283 and .channel == "alpha"' "$RUNNER_TEMP/result.json" >/dev/null
