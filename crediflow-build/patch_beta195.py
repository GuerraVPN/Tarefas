from pathlib import Path
import re

root = Path('/tmp/app')
main = next(root.rglob('MainActivityV06.smali'))
s = main.read_text(encoding='utf-8')

needle = '''    iget-object v3, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;\n\n    new-instance v4, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda40;\n\n    invoke-direct {v4, p0}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda40;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;)V\n\n    const-string v5, "Sair da conta"'''

repl = '''    iget-object v3, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;\n\n    new-instance v4, Lbr/com/guerravpn/crediflow/UpdateOpenListener;\n\n    invoke-direct {v4, p0}, Lbr/com/guerravpn/crediflow/UpdateOpenListener;-><init>(Landroid/app/Activity;)V\n\n    const-string v5, "Atualizações"\n\n    invoke-virtual {v3, v5, v4}, Lbr/com/guerravpn/crediflow/Ui;->outline(Ljava/lang/String;Landroid/view/View$OnClickListener;)Landroid/widget/Button;\n\n    move-result-object v3\n\n    invoke-virtual {v0, v3}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V\n\n    iget-object v3, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;\n\n    new-instance v4, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda40;\n\n    invoke-direct {v4, p0}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda40;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;)V\n\n    const-string v5, "Sair da conta"'''

if s.count(needle) != 1:
    raise SystemExit(f'profile insertion point count={s.count(needle)}')
main.write_text(s.replace(needle, repl), encoding='utf-8')

mf = root / 'AndroidManifest.xml'
m = mf.read_text(encoding='utf-8')
if 'android.permission.REQUEST_INSTALL_PACKAGES' not in m:
    m = m.replace('    <uses-permission android:name="android.permission.INTERNET"/>',
                  '    <uses-permission android:name="android.permission.INTERNET"/>\n'
                  '    <uses-permission android:name="android.permission.REQUEST_INSTALL_PACKAGES"/>\n'
                  '    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28"/>')
activity = '        <activity android:exported="false" android:name="br.com.guerravpn.crediflow.UpdateActivity" android:screenOrientation="portrait"/>\n'
if 'br.com.guerravpn.crediflow.UpdateActivity' not in m:
    m = m.replace('    </application>', activity + '    </application>')
mf.write_text(m, encoding='utf-8')

y = root / 'apktool.yml'
t = y.read_text(encoding='utf-8')
t = re.sub(r'versionCode: .*', 'versionCode: 195', t)
t = re.sub(r'versionName: .*', 'versionName: 1.9.5', t)
y.write_text(t, encoding='utf-8')

print('Beta 195 native updater integration patch applied')
