from pathlib import Path
import json
import re

root = Path('/tmp/app')
main = next(root.rglob('MainActivityV06.smali'))
s = main.read_text(encoding='utf-8')

needle = '''    iget-object v3, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;\n\n    new-instance v4, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda40;\n\n    invoke-direct {v4, p0}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda40;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;)V\n\n    const-string v5, "Sair da conta"'''

repl = '''    iget-object v3, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;\n\n    new-instance v4, Lbr/com/guerravpn/crediflow/UpdateOpenListener;\n\n    invoke-direct {v4, p0}, Lbr/com/guerravpn/crediflow/UpdateOpenListener;-><init>(Landroid/app/Activity;)V\n\n    const-string v5, "Atualizações"\n\n    invoke-virtual {v3, v5, v4}, Lbr/com/guerravpn/crediflow/Ui;->outline(Ljava/lang/String;Landroid/view/View$OnClickListener;)Landroid/widget/Button;\n\n    move-result-object v3\n\n    invoke-virtual {v0, v3}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V\n\n    iget-object v3, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;\n\n    new-instance v4, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda40;\n\n    invoke-direct {v4, p0}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda40;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;)V\n\n    const-string v5, "Sair da conta"'''

if s.count(needle) != 1:
    raise SystemExit(f'profile insertion point count={s.count(needle)}')
main.write_text(s.replace(needle, repl), encoding='utf-8')

smalidir = main.parent

(smalidir / 'UpdateOpenListener.smali').write_text(r'''.class final Lbr/com/guerravpn/crediflow/UpdateOpenListener;
.super Ljava/lang/Object;
.implements Landroid/view/View$OnClickListener;

.field private final a:Landroid/app/Activity;

.method constructor <init>(Landroid/app/Activity;)V
    .locals 0
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V
    iput-object p1, p0, Lbr/com/guerravpn/crediflow/UpdateOpenListener;->a:Landroid/app/Activity;
    return-void
.end method

.method public onClick(Landroid/view/View;)V
    .locals 3
    new-instance v0, Landroid/content/Intent;
    iget-object v1, p0, Lbr/com/guerravpn/crediflow/UpdateOpenListener;->a:Landroid/app/Activity;
    const-class v2, Lbr/com/guerravpn/crediflow/UpdateActivity;
    invoke-direct {v0, v1, v2}, Landroid/content/Intent;-><init>(Landroid/content/Context;Ljava/lang/Class;)V
    iget-object v1, p0, Lbr/com/guerravpn/crediflow/UpdateOpenListener;->a:Landroid/app/Activity;
    invoke-virtual {v1, v0}, Landroid/app/Activity;->startActivity(Landroid/content/Intent;)V
    return-void
.end method
''', encoding='utf-8')

(smalidir / 'UpdateDownloadListener.smali').write_text(r'''.class final Lbr/com/guerravpn/crediflow/UpdateDownloadListener;
.super Ljava/lang/Object;
.implements Landroid/webkit/DownloadListener;

.field private final a:Landroid/app/Activity;

.method constructor <init>(Landroid/app/Activity;)V
    .locals 0
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V
    iput-object p1, p0, Lbr/com/guerravpn/crediflow/UpdateDownloadListener;->a:Landroid/app/Activity;
    return-void
.end method

.method public onDownloadStart(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;J)V
    .locals 3
    :try_start_0
    new-instance v0, Landroid/content/Intent;
    const-string v1, "android.intent.action.VIEW"
    invoke-direct {v0, v1}, Landroid/content/Intent;-><init>(Ljava/lang/String;)V
    invoke-static {p1}, Landroid/net/Uri;->parse(Ljava/lang/String;)Landroid/net/Uri;
    move-result-object v1
    invoke-virtual {v0, v1}, Landroid/content/Intent;->setData(Landroid/net/Uri;)Landroid/content/Intent;
    iget-object v1, p0, Lbr/com/guerravpn/crediflow/UpdateDownloadListener;->a:Landroid/app/Activity;
    invoke-virtual {v1, v0}, Landroid/app/Activity;->startActivity(Landroid/content/Intent;)V
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0
    return-void
    :catch_0
    move-exception v0
    return-void
.end method
''', encoding='utf-8')

html = '''<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>
:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;background:#061426;color:#fff;font:15px system-ui,-apple-system,sans-serif}.wrap{padding:16px 0 30px}.card{background:#102945;border:1px solid #24476d;border-radius:18px;padding:16px}.tag{display:inline-block;background:#2387ff22;color:#69aaff;border:1px solid #2387ff55;border-radius:999px;padding:5px 9px;font-size:12px;font-weight:800}.status{margin:14px 0;padding:13px;border-radius:14px;background:#081b30;border:1px solid #1d3a5b}.ok{color:#58d68d;font-weight:800}.new{color:#ffd166;font-weight:800}.bad{color:#ff9baa;font-weight:800}.muted{color:#a9b8cd;line-height:1.5}.btn{display:block;text-align:center;text-decoration:none;background:#2387ff;color:#fff;font-weight:800;padding:13px;border-radius:13px;margin-top:14px}.btn.secondary{background:#173753;border:1px solid #315778}ul{padding-left:20px;color:#d7e2ef;line-height:1.55}small{color:#8298b2;word-break:break-word}.loader{width:24px;height:24px;border:3px solid #315778;border-top-color:#69aaff;border-radius:50%;animation:r .8s linear infinite;margin:18px auto}@keyframes r{to{transform:rotate(360deg)}}
</style></head><body><main class="wrap"><section class="card"><span class="tag">CANAL BETA</span><div id="body"><div class="loader"></div><p class="muted" style="text-align:center">Verificando atualizações…</p></div><a class="btn secondary" href="#" onclick="location.reload();return false">Verificar novamente</a></section></main><script>
const CURRENT=195;const ENDPOINT='https://xvhbydoslqmnjjsnyvus.supabase.co/functions/v1/crediflow-center?manifest=1&channel=beta&current=195';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function notes(d){const x=Array.isArray(d?.changelog)?d.changelog:[];return x.length?'<ul>'+x.map(v=>'<li>'+esc(v)+'</li>').join('')+'</ul>':''}
async function check(){const box=document.getElementById('body');try{const r=await fetch(ENDPOINT,{cache:'no-store'});if(!r.ok)throw new Error('HTTP '+r.status);const d=await r.json();const newer=Number(d.versionCode||0)>CURRENT;if(newer){const dl=d.downloadUrl?'<a class="btn" href="'+esc(d.downloadUrl)+'">Baixar atualização</a>':'<div class="status"><span class="bad">APK ainda não publicado.</span></div>';box.innerHTML='<div class="status"><div class="new">Nova versão disponível</div><p><b>'+esc(d.versionName||'?')+' · build '+esc(d.versionCode||'?')+'</b></p></div>'+notes(d)+dl+'<p><small>Canal '+esc(d.channel||'beta')+(d.size?' · '+Math.round(Number(d.size)/1024)+' KB':'')+'</small></p>'}else{box.innerHTML='<div class="status"><div class="ok">Seu CrediFlow está atualizado</div><p class="muted">Instalada: <b>1.9.5 Beta · build 195</b></p></div>'+notes(d)+'<p><small>Canal '+esc(d.channel||'beta')+'</small></p>'}}catch(e){box.innerHTML='<div class="status"><div class="bad">Não foi possível verificar agora.</div><p class="muted">'+esc(e.message||e)+'</p></div>'}}
check();
</script></body></html>'''
html_literal = json.dumps(html, ensure_ascii=False)

update_activity = f'''.class public Lbr/com/guerravpn/crediflow/UpdateActivity;
.super Landroid/app/Activity;
.source "UpdateActivity.java"

.method public constructor <init>()V
    .locals 0
    invoke-direct {{p0}}, Landroid/app/Activity;-><init>()V
    return-void
.end method

.method protected onCreate(Landroid/os/Bundle;)V
    .locals 8
    invoke-super {{p0, p1}}, Landroid/app/Activity;->onCreate(Landroid/os/Bundle;)V

    new-instance v0, Landroid/widget/LinearLayout;
    invoke-direct {{v0, p0}}, Landroid/widget/LinearLayout;-><init>(Landroid/content/Context;)V
    const/4 v1, 0x1
    invoke-virtual {{v0, v1}}, Landroid/widget/LinearLayout;->setOrientation(I)V
    const/4 v1, 0x6
    const/16 v2, 0x14
    const/16 v3, 0x26
    invoke-static {{v1, v2, v3}}, Landroid/graphics/Color;->rgb(III)I
    move-result v1
    invoke-virtual {{v0, v1}}, Landroid/widget/LinearLayout;->setBackgroundColor(I)V
    const/16 v1, 0x18
    invoke-virtual {{p0}}, Lbr/com/guerravpn/crediflow/UpdateActivity;->getResources()Landroid/content/res/Resources;
    move-result-object v2
    invoke-virtual {{v2}}, Landroid/content/res/Resources;->getDisplayMetrics()Landroid/util/DisplayMetrics;
    move-result-object v2
    iget v2, v2, Landroid/util/DisplayMetrics;->density:F
    int-to-float v3, v1
    mul-float/2addr v3, v2
    const/high16 v4, 0x3f000000
    add-float/2addr v3, v4
    float-to-int v3, v3
    invoke-virtual {{v0, v3, v3, v3, v3}}, Landroid/widget/LinearLayout;->setPadding(IIII)V

    new-instance v4, Landroid/widget/TextView;
    invoke-direct {{v4, p0}}, Landroid/widget/TextView;-><init>(Landroid/content/Context;)V
    const-string v5, "Atualizações"
    invoke-virtual {{v4, v5}}, Landroid/widget/TextView;->setText(Ljava/lang/CharSequence;)V
    const/high16 v5, 0x41d00000
    invoke-virtual {{v4, v5}}, Landroid/widget/TextView;->setTextSize(F)V
    const/4 v5, -0x1
    invoke-virtual {{v4, v5}}, Landroid/widget/TextView;->setTextColor(I)V
    sget-object v6, Landroid/graphics/Typeface;->DEFAULT:Landroid/graphics/Typeface;
    const/4 v7, 0x1
    invoke-virtual {{v4, v6, v7}}, Landroid/widget/TextView;->setTypeface(Landroid/graphics/Typeface;I)V
    invoke-virtual {{v0, v4}}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    new-instance v4, Landroid/widget/TextView;
    invoke-direct {{v4, p0}}, Landroid/widget/TextView;-><init>(Landroid/content/Context;)V
    const-string v6, "CrediFlow 1.9.5 Beta · build 195"
    invoke-virtual {{v4, v6}}, Landroid/widget/TextView;->setText(Ljava/lang/CharSequence;)V
    const/high16 v6, 0x41800000
    invoke-virtual {{v4, v6}}, Landroid/widget/TextView;->setTextSize(F)V
    const/16 v6, 0xa9
    const/16 v7, 0xb8
    const/16 v1, 0xcd
    invoke-static {{v6, v7, v1}}, Landroid/graphics/Color;->rgb(III)I
    move-result v1
    invoke-virtual {{v4, v1}}, Landroid/widget/TextView;->setTextColor(I)V
    const/16 v1, 0xc
    int-to-float v1, v1
    mul-float/2addr v1, v2
    float-to-int v1, v1
    const/4 v6, 0x0
    invoke-virtual {{v4, v6, v1, v6, v1}}, Landroid/widget/TextView;->setPadding(IIII)V
    invoke-virtual {{v0, v4}}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    new-instance v1, Landroid/webkit/WebView;
    invoke-direct {{v1, p0}}, Landroid/webkit/WebView;-><init>(Landroid/content/Context;)V
    invoke-virtual {{v1}}, Landroid/webkit/WebView;->getSettings()Landroid/webkit/WebSettings;
    move-result-object v4
    const/4 v6, 0x1
    invoke-virtual {{v4, v6}}, Landroid/webkit/WebSettings;->setJavaScriptEnabled(Z)V
    invoke-virtual {{v4, v6}}, Landroid/webkit/WebSettings;->setDomStorageEnabled(Z)V
    new-instance v4, Landroid/webkit/WebViewClient;
    invoke-direct {{v4}}, Landroid/webkit/WebViewClient;-><init>()V
    invoke-virtual {{v1, v4}}, Landroid/webkit/WebView;->setWebViewClient(Landroid/webkit/WebViewClient;)V
    new-instance v4, Lbr/com/guerravpn/crediflow/UpdateDownloadListener;
    invoke-direct {{v4, p0}}, Lbr/com/guerravpn/crediflow/UpdateDownloadListener;-><init>(Landroid/app/Activity;)V
    invoke-virtual {{v1, v4}}, Landroid/webkit/WebView;->setDownloadListener(Landroid/webkit/DownloadListener;)V
    new-instance v4, Landroid/widget/LinearLayout$LayoutParams;
    const/4 v6, -0x1
    const/4 v7, 0x0
    const/high16 v5, 0x3f800000
    invoke-direct {{v4, v6, v7, v5}}, Landroid/widget/LinearLayout$LayoutParams;-><init>(IIF)V
    invoke-virtual {{v0, v1, v4}}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;Landroid/view/ViewGroup$LayoutParams;)V

    const-string v2, "https://xvhbydoslqmnjjsnyvus.supabase.co/"
    const-string v3, {html_literal}
    const-string v4, "text/html"
    const-string v5, "UTF-8"
    const/4 v6, 0x0
    invoke-virtual/range {{v1 .. v6}}, Landroid/webkit/WebView;->loadDataWithBaseURL(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V

    invoke-virtual {{p0, v0}}, Lbr/com/guerravpn/crediflow/UpdateActivity;->setContentView(Landroid/view/View;)V
    return-void
.end method
'''

(smalidir / 'UpdateActivity.smali').write_text(update_activity, encoding='utf-8')

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

print('Beta 195 native updater rendering fix applied')
