from pathlib import Path
import re

root = Path('/tmp/app')
main = next(root.rglob('MainActivityV06.smali'))
s = main.read_text()
needle = '''    iget-object v3, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;\n\n    new-instance v4, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda40;\n\n    invoke-direct {v4, p0}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda40;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;)V\n\n    const-string v5, "Sair da conta"'''
repl = '''    iget-object v3, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;\n\n    new-instance v4, Lbr/com/guerravpn/crediflow/UpdateOpenListener;\n\n    invoke-direct {v4, p0}, Lbr/com/guerravpn/crediflow/UpdateOpenListener;-><init>(Landroid/app/Activity;)V\n\n    const-string v5, "Atualiza\\u00e7\\u00f5es"\n\n    invoke-virtual {v3, v5, v4}, Lbr/com/guerravpn/crediflow/Ui;->outline(Ljava/lang/String;Landroid/view/View$OnClickListener;)Landroid/widget/Button;\n\n    move-result-object v3\n\n    invoke-virtual {v0, v3}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V\n\n    iget-object v3, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;\n\n    new-instance v4, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda40;\n\n    invoke-direct {v4, p0}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda40;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;)V\n\n    const-string v5, "Sair da conta"'''
if s.count(needle) != 1:
    raise SystemExit(f'profile insertion point count={s.count(needle)}')
main.write_text(s.replace(needle, repl))

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
''')

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
''')

(smalidir / 'UpdateActivity.smali').write_text(r'''.class public Lbr/com/guerravpn/crediflow/UpdateActivity;
.super Landroid/app/Activity;
.source "UpdateActivity.java"

.method public constructor <init>()V
    .locals 0
    invoke-direct {p0}, Landroid/app/Activity;-><init>()V
    return-void
.end method

.method protected onCreate(Landroid/os/Bundle;)V
    .locals 8
    invoke-super {p0, p1}, Landroid/app/Activity;->onCreate(Landroid/os/Bundle;)V

    new-instance v0, Landroid/widget/LinearLayout;
    invoke-direct {v0, p0}, Landroid/widget/LinearLayout;-><init>(Landroid/content/Context;)V
    const/4 v1, 0x1
    invoke-virtual {v0, v1}, Landroid/widget/LinearLayout;->setOrientation(I)V
    const/4 v1, 0x6
    const/16 v2, 0x14
    const/16 v3, 0x26
    invoke-static {v1, v2, v3}, Landroid/graphics/Color;->rgb(III)I
    move-result v1
    invoke-virtual {v0, v1}, Landroid/widget/LinearLayout;->setBackgroundColor(I)V
    const/16 v1, 0x18
    invoke-virtual {p0}, Lbr/com/guerravpn/crediflow/UpdateActivity;->getResources()Landroid/content/res/Resources;
    move-result-object v2
    invoke-virtual {v2}, Landroid/content/res/Resources;->getDisplayMetrics()Landroid/util/DisplayMetrics;
    move-result-object v2
    iget v2, v2, Landroid/util/DisplayMetrics;->density:F
    int-to-float v3, v1
    mul-float/2addr v3, v2
    const/high16 v4, 0x3f000000
    add-float/2addr v3, v4
    float-to-int v3, v3
    invoke-virtual {v0, v3, v3, v3, v3}, Landroid/widget/LinearLayout;->setPadding(IIII)V

    new-instance v4, Landroid/widget/TextView;
    invoke-direct {v4, p0}, Landroid/widget/TextView;-><init>(Landroid/content/Context;)V
    const-string v5, "Atualiza\\u00e7\\u00f5es"
    invoke-virtual {v4, v5}, Landroid/widget/TextView;->setText(Ljava/lang/CharSequence;)V
    const/high16 v5, 0x41d00000
    invoke-virtual {v4, v5}, Landroid/widget/TextView;->setTextSize(F)V
    const/4 v5, -0x1
    invoke-virtual {v4, v5}, Landroid/widget/TextView;->setTextColor(I)V
    sget-object v6, Landroid/graphics/Typeface;->DEFAULT:Landroid/graphics/Typeface;
    const/4 v7, 0x1
    invoke-virtual {v4, v6, v7}, Landroid/widget/TextView;->setTypeface(Landroid/graphics/Typeface;I)V
    invoke-virtual {v0, v4}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    new-instance v4, Landroid/widget/TextView;
    invoke-direct {v4, p0}, Landroid/widget/TextView;-><init>(Landroid/content/Context;)V
    const-string v6, "CrediFlow 1.9.4 Beta \\u00b7 build 194"
    invoke-virtual {v4, v6}, Landroid/widget/TextView;->setText(Ljava/lang/CharSequence;)V
    const/high16 v6, 0x41800000
    invoke-virtual {v4, v6}, Landroid/widget/TextView;->setTextSize(F)V
    const/16 v6, 0xa9
    const/16 v7, 0xb8
    const/16 v1, 0xcd
    invoke-static {v6, v7, v1}, Landroid/graphics/Color;->rgb(III)I
    move-result v1
    invoke-virtual {v4, v1}, Landroid/widget/TextView;->setTextColor(I)V
    const/16 v1, 0xc
    int-to-float v1, v1
    mul-float/2addr v1, v2
    float-to-int v1, v1
    const/4 v6, 0x0
    invoke-virtual {v4, v6, v1, v6, v1}, Landroid/widget/TextView;->setPadding(IIII)V
    invoke-virtual {v0, v4}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    new-instance v1, Landroid/webkit/WebView;
    invoke-direct {v1, p0}, Landroid/webkit/WebView;-><init>(Landroid/content/Context;)V
    invoke-virtual {v1}, Landroid/webkit/WebView;->getSettings()Landroid/webkit/WebSettings;
    move-result-object v4
    const/4 v6, 0x1
    invoke-virtual {v4, v6}, Landroid/webkit/WebSettings;->setJavaScriptEnabled(Z)V
    invoke-virtual {v4, v6}, Landroid/webkit/WebSettings;->setDomStorageEnabled(Z)V
    new-instance v4, Landroid/webkit/WebViewClient;
    invoke-direct {v4}, Landroid/webkit/WebViewClient;-><init>()V
    invoke-virtual {v1, v4}, Landroid/webkit/WebView;->setWebViewClient(Landroid/webkit/WebViewClient;)V
    new-instance v4, Lbr/com/guerravpn/crediflow/UpdateDownloadListener;
    invoke-direct {v4, p0}, Lbr/com/guerravpn/crediflow/UpdateDownloadListener;-><init>(Landroid/app/Activity;)V
    invoke-virtual {v1, v4}, Landroid/webkit/WebView;->setDownloadListener(Landroid/webkit/DownloadListener;)V
    new-instance v4, Landroid/widget/LinearLayout$LayoutParams;
    const/4 v6, -0x1
    const/4 v7, 0x0
    const/high16 v5, 0x3f800000
    invoke-direct {v4, v6, v7, v5}, Landroid/widget/LinearLayout$LayoutParams;-><init>(IIF)V
    invoke-virtual {v0, v1, v4}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;Landroid/view/ViewGroup$LayoutParams;)V
    const-string v4, "https://xvhbydoslqmnjjsnyvus.supabase.co/functions/v1/crediflow-center"
    invoke-virtual {v1, v4}, Landroid/webkit/WebView;->loadUrl(Ljava/lang/String;)V
    invoke-virtual {p0, v0}, Lbr/com/guerravpn/crediflow/UpdateActivity;->setContentView(Landroid/view/View;)V
    return-void
.end method
''')

mf = root / 'AndroidManifest.xml'
m = mf.read_text()
activity = '        <activity android:exported="false" android:name="br.com.guerravpn.crediflow.UpdateActivity" android:screenOrientation="portrait"/>\n'
if 'br.com.guerravpn.crediflow.UpdateActivity' not in m:
    m = m.replace('    </application>', activity + '    </application>')
mf.write_text(m)

y = root / 'apktool.yml'
t = y.read_text()
t = re.sub(r'versionCode: .*', 'versionCode: 194', t)
t = re.sub(r'versionName: .*', 'versionName: 1.9.4', t)
y.write_text(t)

print('Beta 194 source patch applied')
