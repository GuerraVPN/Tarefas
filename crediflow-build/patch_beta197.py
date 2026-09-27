from pathlib import Path
import re

root = Path('/tmp/app')
main = next(root.rglob('MainActivityV06.smali'))
s = main.read_text(encoding='utf-8')

# Keep the updater delivered by Beta 1.9.5 and add Beta 1.9.7 payment controls.
if '.field currentLoans:Lorg/json/JSONArray;' not in s:
    first_method = s.find('.method ')
    if first_method < 0:
        raise SystemExit('no method found in MainActivityV06')
    s = s[:first_method] + '.field currentLoans:Lorg/json/JSONArray;\n\n' + s[first_method:]

needle_field = '''    invoke-virtual {v12}, Lbr/com/guerravpn/crediflow/Api$Resp;->array()Lorg/json/JSONArray;

    move-result-object v8

    .local v8, "loa":Lorg/json/JSONArray;'''
replace_field = '''    invoke-virtual {v12}, Lbr/com/guerravpn/crediflow/Api$Resp;->array()Lorg/json/JSONArray;

    move-result-object v8

    .local v8, "loa":Lorg/json/JSONArray;
    iput-object v8, v10, Lbr/com/guerravpn/crediflow/MainActivityV06;->currentLoans:Lorg/json/JSONArray;'''
if s.count(needle_field) != 1:
    raise SystemExit(f'currentLoans insertion point count={s.count(needle_field)}')
s = s.replace(needle_field, replace_field, 1)

# Add "Amortizar valor" immediately before the existing full-payoff button.
anchor_loan = '''    const-string v13, "Pagar antecipado"'''
insert_loan = '''    invoke-static {v0, v10, v8}, Lbr/com/guerravpn/crediflow/LoanPaymentUi;->add(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/widget/LinearLayout;Lorg/json/JSONObject;)V

    const-string v13, "Pagar antecipado"'''
if s.count(anchor_loan) != 1:
    raise SystemExit('per-loan insertion point count=%d' % s.count(anchor_loan))
s = s.replace(anchor_loan, insert_loan, 1)

# Add "Pagar todos os empréstimos" between the loan request and profile buttons.
anchor_home = '''    const-string v6, "Meu perfil"'''
insert_home = '''    invoke-static {p0, v0}, Lbr/com/guerravpn/crediflow/LoanPaymentUi;->addAll(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/widget/LinearLayout;)V

    const-string v6, "Meu perfil"'''
if s.count(anchor_home) != 1:
    raise SystemExit('home insertion point count=%d' % s.count(anchor_home))
s = s.replace(anchor_home, insert_home, 1)

# Preserve the register frame of the post-Beta195 home/loan renderer.
loc = s.find('.method private synthetic lambda$showHome$34(')
if loc < 0:
    raise SystemExit('lambda$showHome$34 not found')
end_method = s.find('.end method', loc)
if end_method < 0:
    raise SystemExit('lambda$showHome$34 end not found')
method = s[loc:end_method]
method = re.sub(r'^\s*\.locals \d+', '    .locals 25', method, count=1, flags=re.M)
s = s[:loc] + method + s[end_method:]

main.write_text(s, encoding='utf-8')

# Extend the existing Pix/proof flow so partial payments use the exact same screen and proof path.
early = next(root.rglob('EarlyPaymentUi.smali'))
e = early.read_text(encoding='utf-8')
if '.field private final requestedAmount:D' not in e:
    e = e.replace('.field private final loanId:Ljava/lang/String;\n', '.field private final loanId:Ljava/lang/String;\n\n.field private final requestedAmount:D\n', 1)
    ctor_old = '''    .line 30\n    return-void\n.end method\n\n.method private copyPix'''
    ctor_new = '''    .line 30\n    const-wide/16 v0, 0x0\n    iput-wide v0, p0, Lbr/com/guerravpn/crediflow/EarlyPaymentUi;->requestedAmount:D\n    return-void\n.end method\n\n.method constructor <init>(Lbr/com/guerravpn/crediflow/MainActivityV06;Ljava/lang/String;D)V\n    .locals 1\n    .param p1, "activity"    # Lbr/com/guerravpn/crediflow/MainActivityV06;\n    .param p2, "loanId"    # Ljava/lang/String;\n    .param p3, "amount"    # D\n\n    invoke-direct {p0, p1, p2}, Lbr/com/guerravpn/crediflow/EarlyPaymentUi;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;Ljava/lang/String;)V\n    iput-wide p3, p0, Lbr/com/guerravpn/crediflow/EarlyPaymentUi;->requestedAmount:D\n    return-void\n.end method\n\n.method private copyPix'''
    if ctor_old not in e: raise SystemExit('EarlyPaymentUi constructor anchor not found')
    e=e.replace(ctor_old,ctor_new,1)
    e=e.replace('const-string v12, "Valor para quitar agora"','const-string v12, "Valor para pagar agora"',1)
    payoff_old='''    const-string v9, "payoffAmount"'''
    payoff_pos=e.find(payoff_old)
    if payoff_pos < 0: raise SystemExit('EarlyPaymentUi payoff key anchor not found')
    payoff_end=e.find('    .line 70', payoff_pos)
    if payoff_end < 0: raise SystemExit('EarlyPaymentUi payoff value anchor not found')
    payoff_insert='''    iget-wide v9, v0, Lbr/com/guerravpn/crediflow/EarlyPaymentUi;->requestedAmount:D\n    const-wide/16 v11, 0x0\n    cmpg-double v13, v9, v11\n    if-lez v13, :requested_done\n    move-wide v7, v9\n:requested_done\n\n'''
    e=e[:payoff_end]+payoff_insert+e[payoff_end:]
    upload_old='''    .method private synthetic lambda$onProofSelected$7(Landroid/net/Uri;)V'''
    # Increase locals for the added wide amount register.
    e=e.replace(upload_old,upload_old,1)
    upload_start=e.find(upload_old)
    upload_end=e.find('.end method',upload_start)
    upload=e[upload_start:upload_end]
    upload=upload.replace('    .locals 6','    .locals 7',1)
    call_re=re.compile(r'^\\s*invoke-static \\{[^}]+\\}, Lbr/com/guerravpn/crediflow/Api;->clientEarlyPayoffSubmit\\(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;\\[B\\)Lbr/com/guerravpn/crediflow/Api\\$Resp;
    e=e[:upload_start]+upload+e[upload_end:]
    early.write_text(e,encoding='utf-8')

api = next(root.rglob('Api.smali'))
a = api.read_text(encoding='utf-8')
if 'clientEarlyPayoffSubmit(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;[BD)' not in a:
    anchor='''    return-object v1\n.end method\n\n.method static clientLoanPreview'''
    method='''    return-object v1\n.end method\n\n.method static clientEarlyPayoffSubmit(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;[BD)Lbr/com/guerravpn/crediflow/Api$Resp;\n    .locals 4\n    .param p0, "accessToken"    # Ljava/lang/String;\n    .param p1, "loanId"    # Ljava/lang/String;\n    .param p2, "fileName"    # Ljava/lang/String;\n    .param p3, "mimeType"    # Ljava/lang/String;\n    .param p4, "bytes"    # [B\n    .param p5, "amount"    # D\n\n    new-instance v0, Lorg/json/JSONObject;\n    invoke-direct {v0}, Lorg/json/JSONObject;-><init>()V\n    const-string v1, "loanId"\n    invoke-virtual {v0, v1, p1}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;\n    const-string v1, "fileName"\n    invoke-virtual {v0, v1, p2}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;\n    const-string v1, "mimeType"\n    invoke-virtual {v0, v1, p3}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;\n    const/4 v1, 0x2\n    invoke-static {p4, v1}, Landroid/util/Base64;->encodeToString([BI)Ljava/lang/String;\n    move-result-object v1\n    const-string v2, "base64"\n    invoke-virtual {v0, v2, v1}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;\n    const-string v1, "amount"\n    invoke-virtual {v0, v1, p5, p6}, Lorg/json/JSONObject;->put(Ljava/lang/String;D)Lorg/json/JSONObject;\n    const-string v1, "/functions/v1/client-early-payoff-submit"\n    invoke-static {v1, v0, p0}, Lbr/com/guerravpn/crediflow/Api;->post(Ljava/lang/String;Lorg/json/JSONObject;Ljava/lang/String;)Lbr/com/guerravpn/crediflow/Api$Resp;\n    move-result-object v1\n    return-object v1\n.end method\n\n.method static clientLoanPreview'''
    if anchor not in a: raise SystemExit('Api insertion anchor not found')
    a=a.replace(anchor,method,1)
    api.write_text(a,encoding='utf-8')

# Bump APK version.
apktool = root / 'apktool.yml'
t = apktool.read_text(encoding='utf-8')
t = re.sub(r'versionCode: .*', 'versionCode: 197', t)
t = re.sub(r'versionName: .*', 'versionName: 1.9.7', t)
apktool.write_text(t, encoding='utf-8')

# Update the Beta 1.9.5 in-app updater to identify build 197.
up = next(root.rglob('UpdateActivity.smali'))
u = up.read_text(encoding='utf-8')
u = u.replace('current=195', 'current=197')
u = u.replace('CURRENT=195', 'CURRENT=197')
u = u.replace('CrediFlow 1.9.5 Beta · build 195', 'CrediFlow 1.9.7 Beta · build 197')
up.write_text(u, encoding='utf-8')

listener_src = Path('crediflow-inspect/LoanPaymentAction.smali')
if not listener_src.exists():
    raise SystemExit('LoanPaymentAction source file not found')
(main.parent / 'LoanPaymentAction.smali').write_text(listener_src.read_text(encoding='utf-8'), encoding='utf-8')
helper_src = Path('crediflow-inspect/LoanPaymentUi.smali')
if not helper_src.exists():
    raise SystemExit('LoanPaymentUi source file not found')
(main.parent / 'LoanPaymentUi.smali').write_text(helper_src.read_text(encoding='utf-8'), encoding='utf-8')
amort_src = Path('crediflow-inspect/LoanAmortizeAction.smali')
if not amort_src.exists():
    raise SystemExit('LoanAmortizeAction source file not found')
(main.parent / 'LoanAmortizeAction.smali').write_text(amort_src.read_text(encoding='utf-8'), encoding='utf-8')
, re.M)
    call_new='''    iget-wide v5, p0, Lbr/com/guerravpn/crediflow/EarlyPaymentUi;->requestedAmount:D\n    invoke-static {v3, v4, v1, v0, v2, v5, v6}, Lbr/com/guerravpn/crediflow/Api;->clientEarlyPayoffSubmit(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;[BD)Lbr/com/guerravpn/crediflow/Api$Resp;'''
    if not call_re.search(upload): raise SystemExit('EarlyPaymentUi upload call anchor not found')
    upload=call_re.sub(call_new,upload,count=1)
    e=e[:upload_start]+upload+e[upload_end:]
    early.write_text(e,encoding='utf-8')

api = next(root.rglob('Api.smali'))
a = api.read_text(encoding='utf-8')
if 'clientEarlyPayoffSubmit(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;[BD)' not in a:
    anchor='''    return-object v1\n.end method\n\n.method static clientLoanPreview'''
    method='''    return-object v1\n.end method\n\n.method static clientEarlyPayoffSubmit(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;[BD)Lbr/com/guerravpn/crediflow/Api$Resp;\n    .locals 4\n    .param p0, "accessToken"    # Ljava/lang/String;\n    .param p1, "loanId"    # Ljava/lang/String;\n    .param p2, "fileName"    # Ljava/lang/String;\n    .param p3, "mimeType"    # Ljava/lang/String;\n    .param p4, "bytes"    # [B\n    .param p5, "amount"    # D\n\n    new-instance v0, Lorg/json/JSONObject;\n    invoke-direct {v0}, Lorg/json/JSONObject;-><init>()V\n    const-string v1, "loanId"\n    invoke-virtual {v0, v1, p1}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;\n    const-string v1, "fileName"\n    invoke-virtual {v0, v1, p2}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;\n    const-string v1, "mimeType"\n    invoke-virtual {v0, v1, p3}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;\n    const/4 v1, 0x2\n    invoke-static {p4, v1}, Landroid/util/Base64;->encodeToString([BI)Ljava/lang/String;\n    move-result-object v1\n    const-string v2, "base64"\n    invoke-virtual {v0, v2, v1}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;\n    const-string v1, "amount"\n    invoke-virtual {v0, v1, p5, p6}, Lorg/json/JSONObject;->put(Ljava/lang/String;D)Lorg/json/JSONObject;\n    const-string v1, "/functions/v1/client-early-payoff-submit"\n    invoke-static {v1, v0, p0}, Lbr/com/guerravpn/crediflow/Api;->post(Ljava/lang/String;Lorg/json/JSONObject;Ljava/lang/String;)Lbr/com/guerravpn/crediflow/Api$Resp;\n    move-result-object v1\n    return-object v1\n.end method\n\n.method static clientLoanPreview'''
    if anchor not in a: raise SystemExit('Api insertion anchor not found')
    a=a.replace(anchor,method,1)
    api.write_text(a,encoding='utf-8')

# Bump APK version.
apktool = root / 'apktool.yml'
t = apktool.read_text(encoding='utf-8')
t = re.sub(r'versionCode: .*', 'versionCode: 197', t)
t = re.sub(r'versionName: .*', 'versionName: 1.9.7', t)
apktool.write_text(t, encoding='utf-8')

# Update the Beta 1.9.5 in-app updater to identify build 197.
up = next(root.rglob('UpdateActivity.smali'))
u = up.read_text(encoding='utf-8')
u = u.replace('current=195', 'current=197')
u = u.replace('CURRENT=195', 'CURRENT=197')
u = u.replace('CrediFlow 1.9.5 Beta · build 195', 'CrediFlow 1.9.7 Beta · build 197')
up.write_text(u, encoding='utf-8')

listener_src = Path('crediflow-inspect/LoanPaymentAction.smali')
if not listener_src.exists():
    raise SystemExit('LoanPaymentAction source file not found')
(main.parent / 'LoanPaymentAction.smali').write_text(listener_src.read_text(encoding='utf-8'), encoding='utf-8')
helper_src = Path('crediflow-inspect/LoanPaymentUi.smali')
if not helper_src.exists():
    raise SystemExit('LoanPaymentUi source file not found')
(main.parent / 'LoanPaymentUi.smali').write_text(helper_src.read_text(encoding='utf-8'), encoding='utf-8')
amort_src = Path('crediflow-inspect/LoanAmortizeAction.smali')
if not amort_src.exists():
    raise SystemExit('LoanAmortizeAction source file not found')
(main.parent / 'LoanAmortizeAction.smali').write_text(amort_src.read_text(encoding='utf-8'), encoding='utf-8')
, re.M)
    call_new='''    iget-wide v5, p0, Lbr/com/guerravpn/crediflow/EarlyPaymentUi;->requestedAmount:D
    invoke-static {v3, v4, v1, v0, v2, v5, v6}, Lbr/com/guerravpn/crediflow/Api;->clientEarlyPayoffSubmit(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;[BD)Lbr/com/guerravpn/crediflow/Api$Resp;'''
    if not call_re.search(upload): raise SystemExit('EarlyPaymentUi upload call anchor not found')
    upload=call_re.sub(call_new,upload,count=1)
    e=e[:upload_start]+upload+e[upload_end:]
    early.write_text(e,encoding='utf-8')

api = next(root.rglob('Api.smali'))
a = api.read_text(encoding='utf-8')
if 'clientEarlyPayoffSubmit(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;[BD)' not in a:
    anchor='''    return-object v1\n.end method\n\n.method static clientLoanPreview'''
    method='''    return-object v1\n.end method\n\n.method static clientEarlyPayoffSubmit(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;[BD)Lbr/com/guerravpn/crediflow/Api$Resp;\n    .locals 4\n    .param p0, "accessToken"    # Ljava/lang/String;\n    .param p1, "loanId"    # Ljava/lang/String;\n    .param p2, "fileName"    # Ljava/lang/String;\n    .param p3, "mimeType"    # Ljava/lang/String;\n    .param p4, "bytes"    # [B\n    .param p5, "amount"    # D\n\n    new-instance v0, Lorg/json/JSONObject;\n    invoke-direct {v0}, Lorg/json/JSONObject;-><init>()V\n    const-string v1, "loanId"\n    invoke-virtual {v0, v1, p1}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;\n    const-string v1, "fileName"\n    invoke-virtual {v0, v1, p2}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;\n    const-string v1, "mimeType"\n    invoke-virtual {v0, v1, p3}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;\n    const/4 v1, 0x2\n    invoke-static {p4, v1}, Landroid/util/Base64;->encodeToString([BI)Ljava/lang/String;\n    move-result-object v1\n    const-string v2, "base64"\n    invoke-virtual {v0, v2, v1}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;\n    const-string v1, "amount"\n    invoke-virtual {v0, v1, p5, p6}, Lorg/json/JSONObject;->put(Ljava/lang/String;D)Lorg/json/JSONObject;\n    const-string v1, "/functions/v1/client-early-payoff-submit"\n    invoke-static {v1, v0, p0}, Lbr/com/guerravpn/crediflow/Api;->post(Ljava/lang/String;Lorg/json/JSONObject;Ljava/lang/String;)Lbr/com/guerravpn/crediflow/Api$Resp;\n    move-result-object v1\n    return-object v1\n.end method\n\n.method static clientLoanPreview'''
    if anchor not in a: raise SystemExit('Api insertion anchor not found')
    a=a.replace(anchor,method,1)
    api.write_text(a,encoding='utf-8')

# Bump APK version.
apktool = root / 'apktool.yml'
t = apktool.read_text(encoding='utf-8')
t = re.sub(r'versionCode: .*', 'versionCode: 197', t)
t = re.sub(r'versionName: .*', 'versionName: 1.9.7', t)
apktool.write_text(t, encoding='utf-8')

# Update the Beta 1.9.5 in-app updater to identify build 197.
up = next(root.rglob('UpdateActivity.smali'))
u = up.read_text(encoding='utf-8')
u = u.replace('current=195', 'current=197')
u = u.replace('CURRENT=195', 'CURRENT=197')
u = u.replace('CrediFlow 1.9.5 Beta · build 195', 'CrediFlow 1.9.7 Beta · build 197')
up.write_text(u, encoding='utf-8')

listener_src = Path('crediflow-inspect/LoanPaymentAction.smali')
if not listener_src.exists():
    raise SystemExit('LoanPaymentAction source file not found')
(main.parent / 'LoanPaymentAction.smali').write_text(listener_src.read_text(encoding='utf-8'), encoding='utf-8')
helper_src = Path('crediflow-inspect/LoanPaymentUi.smali')
if not helper_src.exists():
    raise SystemExit('LoanPaymentUi source file not found')
(main.parent / 'LoanPaymentUi.smali').write_text(helper_src.read_text(encoding='utf-8'), encoding='utf-8')
amort_src = Path('crediflow-inspect/LoanAmortizeAction.smali')
if not amort_src.exists():
    raise SystemExit('LoanAmortizeAction source file not found')
(main.parent / 'LoanAmortizeAction.smali').write_text(amort_src.read_text(encoding='utf-8'), encoding='utf-8')
, re.M)
    call_new='''    iget-wide v5, p0, Lbr/com/guerravpn/crediflow/EarlyPaymentUi;->requestedAmount:D\n    invoke-static {v3, v4, v1, v0, v2, v5, v6}, Lbr/com/guerravpn/crediflow/Api;->clientEarlyPayoffSubmit(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;[BD)Lbr/com/guerravpn/crediflow/Api$Resp;'''
    if not call_re.search(upload): raise SystemExit('EarlyPaymentUi upload call anchor not found')
    upload=call_re.sub(call_new,upload,count=1)
    e=e[:upload_start]+upload+e[upload_end:]
    early.write_text(e,encoding='utf-8')

api = next(root.rglob('Api.smali'))
a = api.read_text(encoding='utf-8')
if 'clientEarlyPayoffSubmit(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;[BD)' not in a:
    anchor='''    return-object v1\n.end method\n\n.method static clientLoanPreview'''
    method='''    return-object v1\n.end method\n\n.method static clientEarlyPayoffSubmit(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;[BD)Lbr/com/guerravpn/crediflow/Api$Resp;\n    .locals 4\n    .param p0, "accessToken"    # Ljava/lang/String;\n    .param p1, "loanId"    # Ljava/lang/String;\n    .param p2, "fileName"    # Ljava/lang/String;\n    .param p3, "mimeType"    # Ljava/lang/String;\n    .param p4, "bytes"    # [B\n    .param p5, "amount"    # D\n\n    new-instance v0, Lorg/json/JSONObject;\n    invoke-direct {v0}, Lorg/json/JSONObject;-><init>()V\n    const-string v1, "loanId"\n    invoke-virtual {v0, v1, p1}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;\n    const-string v1, "fileName"\n    invoke-virtual {v0, v1, p2}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;\n    const-string v1, "mimeType"\n    invoke-virtual {v0, v1, p3}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;\n    const/4 v1, 0x2\n    invoke-static {p4, v1}, Landroid/util/Base64;->encodeToString([BI)Ljava/lang/String;\n    move-result-object v1\n    const-string v2, "base64"\n    invoke-virtual {v0, v2, v1}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;\n    const-string v1, "amount"\n    invoke-virtual {v0, v1, p5, p6}, Lorg/json/JSONObject;->put(Ljava/lang/String;D)Lorg/json/JSONObject;\n    const-string v1, "/functions/v1/client-early-payoff-submit"\n    invoke-static {v1, v0, p0}, Lbr/com/guerravpn/crediflow/Api;->post(Ljava/lang/String;Lorg/json/JSONObject;Ljava/lang/String;)Lbr/com/guerravpn/crediflow/Api$Resp;\n    move-result-object v1\n    return-object v1\n.end method\n\n.method static clientLoanPreview'''
    if anchor not in a: raise SystemExit('Api insertion anchor not found')
    a=a.replace(anchor,method,1)
    api.write_text(a,encoding='utf-8')

# Bump APK version.
apktool = root / 'apktool.yml'
t = apktool.read_text(encoding='utf-8')
t = re.sub(r'versionCode: .*', 'versionCode: 197', t)
t = re.sub(r'versionName: .*', 'versionName: 1.9.7', t)
apktool.write_text(t, encoding='utf-8')

# Update the Beta 1.9.5 in-app updater to identify build 197.
up = next(root.rglob('UpdateActivity.smali'))
u = up.read_text(encoding='utf-8')
u = u.replace('current=195', 'current=197')
u = u.replace('CURRENT=195', 'CURRENT=197')
u = u.replace('CrediFlow 1.9.5 Beta · build 195', 'CrediFlow 1.9.7 Beta · build 197')
up.write_text(u, encoding='utf-8')

listener_src = Path('crediflow-inspect/LoanPaymentAction.smali')
if not listener_src.exists():
    raise SystemExit('LoanPaymentAction source file not found')
(main.parent / 'LoanPaymentAction.smali').write_text(listener_src.read_text(encoding='utf-8'), encoding='utf-8')
helper_src = Path('crediflow-inspect/LoanPaymentUi.smali')
if not helper_src.exists():
    raise SystemExit('LoanPaymentUi source file not found')
(main.parent / 'LoanPaymentUi.smali').write_text(helper_src.read_text(encoding='utf-8'), encoding='utf-8')
amort_src = Path('crediflow-inspect/LoanAmortizeAction.smali')
if not amort_src.exists():
    raise SystemExit('LoanAmortizeAction source file not found')
(main.parent / 'LoanAmortizeAction.smali').write_text(amort_src.read_text(encoding='utf-8'), encoding='utf-8')
