from pathlib import Path

# Version bump while preserving the fixed package id and resumable tracking flow.
gradle = Path('crediflow-android/app/build.gradle.kts')
g = gradle.read_text()
g = g.replace('versionCode = 4', 'versionCode = 5')
g = g.replace('versionName = "0.4"', 'versionName = "0.5"')
if 'applicationId = "com.guerravpn.crediflow"' not in g:
    raise SystemExit('Expected fixed applicationId not found')
if 'applicationIdSuffix' in g:
    raise SystemExit('Debug applicationIdSuffix must not be present')
gradle.write_text(g)

main = Path('crediflow-android/app/src/main/java/br/com/guerravpn/crediflow/MainActivity.kt')
m = main.read_text()
m = m.replace('CREDIFLOW · v0.4 build 4', 'CREDIFLOW · v0.5 build 5')
m = m.replace('CrediFlow · v0.4 build 4', 'CrediFlow · v0.5 build 5')
required = [
    'private fun TrackApplicationScreen(',
    'Field("Código de 6 dígitos"',
    'Text(if (loading) "Ativando..." else "Ativar conta e entrar")',
    'Primary("Continuar de onde parei")',
]
for marker in required:
    if marker not in m:
        raise SystemExit(f'Required resumable tracking marker missing: {marker}')
main.write_text(m)
print('CrediFlow v0.5 build 5 patch applied')
