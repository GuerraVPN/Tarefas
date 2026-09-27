from pathlib import Path
import re

root = Path('/tmp/app')
main = next(root.rglob('MainActivityV06.smali'))
s = main.read_text(encoding='utf-8')

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
    raise SystemExit('currentLoans insertion point count=' + str(s.count(needle_field)))
s = s.replace(needle_field, replace_field, 1)

anchor_loan = '    const-string v13, "Pagar antecipado"'
insert_loan = '''    invoke-static {v0, v10, v8}, Lbr/com/guerravpn/crediflow/LoanPaymentUi;->add(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/widget/LinearLayout;Lorg/json/JSONObject;)V

    const-string v13, "Pagar antecipado"'''
if s.count(anchor_loan) != 1:
    raise SystemExit('per-loan insertion point count=' + str(s.count(anchor_loan)))
s = s.replace(anchor_loan, insert_loan, 1)

anchor_home = '    const-string v6, "Meu perfil"'
insert_home = '''    invoke-static {p0, v0}, Lbr/com/guerravpn/crediflow/LoanPaymentUi;->addAll(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/widget/LinearLayout;)V

    const-string v6, "Meu perfil"'''
if s.count(anchor_home) != 1:
    raise SystemExit('home insertion point count=' + str(s.count(anchor_home)))
s = s.replace(anchor_home, insert_home, 1)

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

apktool = root / 'apktool.yml'
t = apktool.read_text(encoding='utf-8')
t = re.sub(r'versionCode: .*', 'versionCode: 197', t)
t = re.sub(r'versionName: .*', 'versionName: 1.9.7', t)
apktool.write_text(t, encoding='utf-8')

up = next(root.rglob('UpdateActivity.smali'))
u = up.read_text(encoding='utf-8')
u = u.replace('current=195', 'current=197').replace('CURRENT=195', 'CURRENT=197')
u = u.replace('CrediFlow 1.9.5 Beta · build 195', 'CrediFlow 1.9.7 Beta · build 197')
up.write_text(u, encoding='utf-8')

for name in ['LoanPaymentAction.smali', 'LoanPaymentUi.smali', 'LoanAmortizeAction.smali']:
    src = Path('crediflow-inspect') / name
    if not src.exists():
        raise SystemExit(name + ' source file not found')
    (main.parent / name).write_text(src.read_text(encoding='utf-8'), encoding='utf-8')

# Reuse the existing EarlyPaymentUi screen for partial payments.
early = next(root.rglob('EarlyPaymentUi.smali'))
e = early.read_text(encoding='utf-8')
if '.field private final requestedAmount:D' not in e:
    e = e.replace(
        '.field private final loanId:Ljava/lang/String;\n',
        '.field private final loanId:Ljava/lang/String;\n\n.field private final requestedAmount:D\n',
        1
    )
    ctor_old = '    .line 30\n    return-void\n.end method\n\n.method private copyPix'
    ctor_new = '    .line 30\n    const-wide/16 v0, 0x0\n    iput-wide v0, p0, Lbr/com/guerravpn/crediflow/EarlyPaymentUi;->requestedAmount:D\n    return-void\n.end method\n\n.method constructor <init>(Lbr/com/guerravpn/crediflow/MainActivityV06;Ljava/lang/String;D)V\n    .locals 1\n    .param p1, "activity"    # Lbr/com/guerravpn/crediflow/MainActivityV06;\n    .param p2, "loanId"    # Ljava/lang/String;\n    .param p3, "amount"    # D\n\n    invoke-direct {p0, p1, p2}, Lbr/com/guerravpn/crediflow/EarlyPaymentUi;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;Ljava/lang/String;)V\n    iput-wide p3, p0, Lbr/com/guerravpn/crediflow/EarlyPaymentUi;->requestedAmount:D\n    return-void\n.end method\n\n.method private copyPix'
    if ctor_old not in e:
        raise SystemExit('EarlyPaymentUi constructor anchor not found')
    e = e.replace(ctor_old, ctor_new, 1)
    e = e.replace('const-string v12, "Valor para quitar agora"', 'const-string v12, "Valor para pagar agora"', 1)

    key = '    const-string v9, "payoffAmount"'
    pos = e.find(key)
    if pos < 0:
        raise SystemExit('EarlyPaymentUi payoff key anchor not found')
    line70 = e.find('    .line 70', pos)
    if line70 < 0:
        raise SystemExit('EarlyPaymentUi payoff value anchor not found')
    insert = "\n".join([
        '    iget-wide v9, v0, Lbr/com/guerravpn/crediflow/EarlyPaymentUi;->requestedAmount:D',
        '    const-wide/16 v11, 0x0',
        '    cmpg-double v13, v9, v11',
        '    if-lez v13, :requested_done',
        '    move-wide v7, v9',
        ':requested_done',
        ''
    ])
    e = e[:line70] + insert + e[line70:]

    upload_start = e.find('.method private synthetic lambda$onProofSelected$7(Landroid/net/Uri;)V')
    if upload_start < 0:
        raise SystemExit('EarlyPaymentUi upload method not found')
    upload_end = e.find('.end method', upload_start)
    upload = e[upload_start:upload_end]
    upload = upload.replace('    .locals 6', '    .locals 7', 1)
    call_pos = upload.find('clientEarlyPayoffSubmit(')
    if call_pos < 0:
        raise SystemExit('EarlyPaymentUi upload call anchor not found')
    line_start = upload.rfind('\n', 0, call_pos) + 1
    line_end = upload.find('\n', call_pos)
    replacement = "\n".join([
        '    iget-wide v5, p0, Lbr/com/guerravpn/crediflow/EarlyPaymentUi;->requestedAmount:D',
        '    move-object p1, v0',
        '    move-object v0, v3',
        '    move-object v3, p1',
        '    move-object p1, v1',
        '    move-object v1, v4',
        '    move-object v4, v2',
        '    move-object v2, p1',
        '    invoke-static/range {v0 .. v6}, Lbr/com/guerravpn/crediflow/Api;->clientEarlyPayoffSubmit(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;[BD)Lbr/com/guerravpn/crediflow/Api$Resp;'
    ]) + '\n'
    upload = upload[:line_start] + replacement + upload[line_end + 1:]
    e = e[:upload_start] + upload + e[upload_end:]
    early.write_text(e, encoding='utf-8')

api = next(root.rglob('Api.smali'))
a = api.read_text(encoding='utf-8')
sig = 'clientEarlyPayoffSubmit(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;[BD)'
if sig not in a:
    anchor = '    return-object v1\n.end method\n\n.method static clientLoanPreview'
    if anchor not in a:
        raise SystemExit('Api insertion anchor not found')
    api_method = "\n".join([
        '    return-object v1',
        '.end method',
        '',
        '.method static clientEarlyPayoffSubmit(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;[BD)Lbr/com/guerravpn/crediflow/Api$Resp;',
        '    .locals 4',
        '    .param p0, "accessToken"    # Ljava/lang/String;',
        '    .param p1, "loanId"    # Ljava/lang/String;',
        '    .param p2, "fileName"    # Ljava/lang/String;',
        '    .param p3, "mimeType"    # Ljava/lang/String;',
        '    .param p4, "bytes"    # [B',
        '    .param p5, "amount"    # D',
        '',
        '    new-instance v0, Lorg/json/JSONObject;',
        '    invoke-direct {v0}, Lorg/json/JSONObject;-><init>()V',
        '    const-string v1, "loanId"',
        '    invoke-virtual {v0, v1, p1}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;',
        '    const-string v1, "fileName"',
        '    invoke-virtual {v0, v1, p2}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;',
        '    const-string v1, "mimeType"',
        '    invoke-virtual {v0, v1, p3}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;',
        '    const/4 v1, 0x2',
        '    invoke-static {p4, v1}, Landroid/util/Base64;->encodeToString([BI)Ljava/lang/String;',
        '    move-result-object v1',
        '    const-string v2, "base64"',
        '    invoke-virtual {v0, v2, v1}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;',
        '    const-string v1, "amount"',
        '    invoke-virtual {v0, v1, p5, p6}, Lorg/json/JSONObject;->put(Ljava/lang/String;D)Lorg/json/JSONObject;',
        '    const-string v1, "/functions/v1/client-early-payoff-submit"',
        '    invoke-static {v1, v0, p0}, Lbr/com/guerravpn/crediflow/Api;->post(Ljava/lang/String;Lorg/json/JSONObject;Ljava/lang/String;)Lbr/com/guerravpn/crediflow/Api$Resp;',
        '    move-result-object v1',
        '    return-object v1',
        '.end method',
        '',
        '.method static clientLoanPreview'
    ]) 
    a = a.replace(anchor, api_method, 1)
    api.write_text(a, encoding='utf-8')
