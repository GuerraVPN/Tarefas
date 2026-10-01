from pathlib import Path
import re

root = Path('/tmp/app')
main = next(root.rglob('MainActivityV06.smali'))
s = main.read_text(encoding='utf-8')

# 1. Keep the 1.9.6 full-payment screen intact.
# 2. Add a separate amortization entry point.
# 3. Do NOT add the misleading "Pagar todos" bulk button.

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

anchor_loan = '''    const-string v13, "Pagar antecipado"'''
insert_loan = '''    invoke-static {v0, v10, v8}, Lbr/com/guerravpn/crediflow/LoanPaymentUi;->add(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/widget/LinearLayout;Lorg/json/JSONObject;)V

    const-string v13, "Pagar antecipado"'''
if s.count(anchor_loan) != 1:
    raise SystemExit('per-loan insertion point count=%d' % s.count(anchor_loan))
s = s.replace(anchor_loan, insert_loan, 1)

loc = s.find('.method private synthetic lambda$showHome$34(')
if loc < 0:
    raise SystemExit('lambda$showHome$34 not found')
end_method = s.find('.end method', loc)
if end_method < 0:
    raise SystemExit('lambda$showHome$34 end not found')
method = s[loc:end_method]
method = re.sub(r'^\s*\.locals \d+', '    .locals 25', method, count=1, flags=re.M)
s = s[:loc] + method + s[end_method:]

# Field used only to pass a partial amount into the existing payment/proof UI.
if '.field partialPaymentAmount:D' not in s:
    first_method = s.find('.method ')
    s = s[:first_method] + '.field partialPaymentAmount:D\n\n' + s[first_method:]

main.write_text(s, encoding='utf-8')

# Seed helper sources.
for name in ['LoanPaymentUi.smali', 'LoanAmortizeAction.smali', 'LoanPaymentAction.smali']:
    src = Path('crediflow-inspect') / name
    if not src.exists():
        raise SystemExit(name + ' source file not found')
    (main.parent / name).write_text(src.read_text(encoding='utf-8'), encoding='utf-8')

# Remove the unused bulk-payment helper entirely.
helper = main.parent / 'LoanPaymentUi.smali'
h = helper.read_text(encoding='utf-8')
bulk_start = h.find('.method public static addAll(')
if bulk_start >= 0:
    bulk_end = h.find('.end method', bulk_start)
    if bulk_end < 0:
        raise SystemExit('bulk helper method end not found')
    h = h[:bulk_start] + h[bulk_end + len('.end method'):]
helper.write_text(h, encoding='utf-8')

# Make amortization a real entry into the existing Pix/proof flow.
# It uses the original EarlyPaymentUi constructor; only the requested amount is
# carried in Activity state. This avoids changing the payment screen renderer.
amort = main.parent / 'LoanAmortizeAction.smali'
a = amort.read_text(encoding='utf-8')
start = a.find('.method public onClick(Landroid/view/View;)V')
end = a.find('.end method', start)
if start < 0 or end < 0:
    raise SystemExit('LoanAmortizeAction onClick not found')
new_onclick = r'''.method public onClick(Landroid/view/View;)V
    .locals 10
    iget-object v0, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->a:Lbr/com/guerravpn/crediflow/MainActivityV06;
    iget-object v1, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->c:Landroid/widget/EditText;
    invoke-virtual {v1}, Landroid/widget/EditText;->getText()Landroid/text/Editable;
    move-result-object v1
    invoke-virtual {v1}, Ljava/lang/Object;->toString()Ljava/lang/String;
    move-result-object v1
    invoke-virtual {v1}, Ljava/lang/String;->trim()Ljava/lang/String;
    move-result-object v1
    const-string v2, ","
    const-string v3, "."
    invoke-virtual {v1, v2, v3}, Ljava/lang/String;->replace(Ljava/lang/CharSequence;Ljava/lang/CharSequence;)Ljava/lang/String;

    :try_start
    invoke-static {v1}, Ljava/lang/Double;->parseDouble(Ljava/lang/String;)D
    move-result-wide v2
    const-wide/16 v4, 0x0
    cmpg-double v6, v2, v4
    if-lez v6, :invalid

    iput-wide v2, v0, Lbr/com/guerravpn/crediflow/MainActivityV06;->partialPaymentAmount:D

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->b:Lorg/json/JSONObject;
    const-string v4, "total_amount"
    const-wide/16 v4, 0x0
    invoke-virtual {v1, v4, v5}, Lorg/json/JSONObject;->optDouble(Ljava/lang/String;D)D
    move-result-wide v4
    sub-double v6, v4, v2
    const-wide/16 v8, 0x0
    cmpg-double v6, v6, v8
    if-gez v6, :show_balance
    move-wide v2, v4
    iput-wide v2, v0, Lbr/com/guerravpn/crediflow/MainActivityV06;->partialPaymentAmount:D

:show_balance
    sub-double v6, v4, v2
    const-wide/16 v8, 0x0
    invoke-static {v8, v9, v6, v7}, Ljava/lang/Math;->max(DD)D
    move-result-wide v6
    invoke-static {v6, v7}, Lbr/com/guerravpn/crediflow/MainActivityV06;->money(D)Ljava/lang/String;
    move-result-object v1
    new-instance v4, Ljava/lang/StringBuilder;
    invoke-direct {v4}, Ljava/lang/StringBuilder;-><init>()V
    const-string v5, "Saldo após amortização: "
    invoke-virtual {v4, v5}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;
    move-result-object v4
    invoke-virtual {v4, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;
    move-result-object v4
    invoke-virtual {v4}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;
    move-result-object v1
    iget-object v4, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->d:Landroid/widget/TextView;
    invoke-virtual {v4, v1}, Landroid/widget/TextView;->setText(Ljava/lang/CharSequence;)V

:open
    iget-object v1, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->b:Lorg/json/JSONObject;
    const-string v4, "id"
    invoke-virtual {v1, v4}, Lorg/json/JSONObject;->optString(Ljava/lang/String;)Ljava/lang/String;
    move-result-object v4
    new-instance v5, Lbr/com/guerravpn/crediflow/EarlyPaymentUi;
    invoke-direct {v5, v0, v4}, Lbr/com/guerravpn/crediflow/EarlyPaymentUi;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;Ljava/lang/String;)V
    iput-object v5, v0, Lbr/com/guerravpn/crediflow/MainActivityV06;->earlyPaymentUi:Lbr/com/guerravpn/crediflow/EarlyPaymentUi;
    invoke-virtual {v5}, Lbr/com/guerravpn/crediflow/EarlyPaymentUi;->show()V
    return-void

:invalid
    const-string v1, "Digite um valor maior que zero."
    const/4 v2, 0x0
    invoke-static {v0, v1, v2}, Landroid/widget/Toast;->makeText(Landroid/content/Context;Ljava/lang/CharSequence;I)Landroid/widget/Toast;
    move-result-object v2
    invoke-virtual {v2}, Landroid/widget/Toast;->show()V
    return-void

    :try_end
    .catch Ljava/lang/Exception; {:try_start .. :try_end} :catch

:catch
    const-string v1, "Valor inválido."
    const/4 v2, 0x0
    invoke-static {v0, v1, v2}, Landroid/widget/Toast;->makeText(Landroid/content/Context;Ljava/lang/CharSequence;I)Landroid/widget/Toast;
    move-result-object v2
    invoke-virtual {v2}, Landroid/widget/Toast;->show()V
    return-void
.end method'''
a = a[:start] + new_onclick + a[end + len('.end method'):]
amort.write_text(a, encoding='utf-8')

# Carry the partial amount through the existing EarlyPaymentUi constructor and
# proof submission, but do NOT modify render(). The full-payment path remains unchanged.
early = next(root.rglob('EarlyPaymentUi.smali'))
e = early.read_text(encoding='utf-8')
if '.field private final requestedAmount:D' not in e:
    e = e.replace('.field private final loanId:Ljava/lang/String;\n',
                  '.field private final loanId:Ljava/lang/String;\n\n.field private final requestedAmount:D\n', 1)
    cs = e.find('.method constructor <init>(Lbr/com/guerravpn/crediflow/MainActivityV06;Ljava/lang/String;)V')
    ce = e.find('.end method', cs)
    if cs < 0 or ce < 0:
        raise SystemExit('EarlyPaymentUi constructor not found')
    ctor = e[cs:ce]
    ctor = re.sub(r'^\s*\.locals \d+', '    .locals 2', ctor, count=1, flags=re.M)
    loan_line = '    iput-object p2, p0, Lbr/com/guerravpn/crediflow/EarlyPaymentUi;->loanId:Ljava/lang/String;'
    if loan_line not in ctor:
        raise SystemExit('loanId assignment not found')
    ctor = ctor.replace(loan_line, loan_line + '''
    iget-wide v0, p1, Lbr/com/guerravpn/crediflow/MainActivityV06;->partialPaymentAmount:D
    iput-wide v0, p0, Lbr/com/guerravpn/crediflow/EarlyPaymentUi;->requestedAmount:D
    const-wide/16 v0, 0x0
    iput-wide v0, p1, Lbr/com/guerravpn/crediflow/MainActivityV06;->partialPaymentAmount:D''', 1)
    e = e[:cs] + ctor + e[ce:]

# Add an amount-aware submit overload without touching the original full-payment method.
api = next(root.rglob('Api.smali'))
ap = api.read_text(encoding='utf-8')
sig = 'clientEarlyPayoffSubmit(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;[BD)'
if sig not in ap:
    anchor = '.method static clientEarlyPayoffSubmit(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;[B)'
    pos = ap.find(anchor)
    if pos < 0:
        raise SystemExit('Api full-payoff method not found')
    method = r'''.method static clientEarlyPayoffSubmit(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;[BD)Lbr/com/guerravpn/crediflow/Api$Resp;
    .locals 3
    new-instance v0, Lorg/json/JSONObject;
    invoke-direct {v0}, Lorg/json/JSONObject;-><init>()V
    const-string v1, "loanId"
    invoke-virtual {v0, v1, p1}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;
    const-string v1, "fileName"
    invoke-virtual {v0, v1, p2}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;
    const-string v1, "mimeType"
    invoke-virtual {v0, v1, p3}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;
    const/4 v1, 0x2
    invoke-static {p4, v1}, Landroid/util/Base64;->encodeToString([BI)Ljava/lang/String;
    move-result-object v1
    const-string v2, "base64"
    invoke-virtual {v0, v2, v1}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;
    const-string v1, "amount"
    invoke-virtual {v0, v1, p5, p6}, Lorg/json/JSONObject;->put(Ljava/lang/String;D)Lorg/json/JSONObject;
    const-string v1, "/functions/v1/client-early-payoff-submit"
    invoke-static {v1, v0, p0}, Lbr/com/guerravpn/crediflow/Api;->post(Ljava/lang/String;Lorg/json/JSONObject;Ljava/lang/String;)Lbr/com/guerravpn/crediflow/Api$Resp;
    move-result-object v1
    return-object v1
.end method

'''
    ap = ap[:pos] + method + ap[pos:]

# Pass the amount only when it is a real partial request; otherwise retain the original call.
us = e.find('.method private synthetic lambda$onProofSelected$7(Landroid/net/Uri;)V')
ue = e.find('.end method', us)
if us < 0 or ue < 0:
    raise SystemExit('proof handler not found')
upload = e[us:ue]
upload = upload.replace('    .locals 6', '    .locals 12', 1)
old = 'invoke-static {v3, v4, v1, v0, v2}, Lbr/com/guerravpn/crediflow/Api;->clientEarlyPayoffSubmit(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;[B)Lbr/com/guerravpn/crediflow/Api$Resp;'
if old not in upload:
    raise SystemExit('original proof submit call not found')
repl = '''iget-wide v5, p0, Lbr/com/guerravpn/crediflow/EarlyPaymentUi;->requestedAmount:D
    const-wide/16 v7, 0x0
    cmpl-double v9, v5, v7
    if-lez v9, :full_submit

    move-object v7, v3
    move-object v8, v4
    move-object v9, v1
    move-object v10, v0
    move-object v11, v2
    move-object v0, v7
    move-object v1, v8
    move-object v2, v9
    move-object v3, v10
    move-object v4, v11
    invoke-static/range {v0 .. v6}, Lbr/com/guerravpn/crediflow/Api;->clientEarlyPayoffSubmit(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;[BD)Lbr/com/guerravpn/crediflow/Api$Resp;
    move-result-object v0
    goto :submit_done
:full_submit
    invoke-static {v3, v4, v1, v0, v2}, Lbr/com/guerravpn/crediflow/Api;->clientEarlyPayoffSubmit(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;[B)Lbr/com/guerravpn/crediflow/Api$Resp;
    move-result-object v0
:submit_done'''
upload=upload.replace(old,repl,1)
e=e[:us]+upload+e[ue:]
early.write_text(e, encoding='utf-8')

# Version metadata.
apktool = root / 'apktool.yml'
t = apktool.read_text(encoding='utf-8')
t = re.sub(r'versionCode: .*', 'versionCode: 201', t)
t = re.sub(r'versionName: .*', 'versionName: 1.9.11', t)
apktool.write_text(t, encoding='utf-8')

up = next(root.rglob('UpdateActivity.smali'))
u = up.read_text(encoding='utf-8')
u = u.replace('current=195', 'current=201').replace('CURRENT=195', 'CURRENT=201')
u = u.replace('CrediFlow 1.9.5 Beta · build 195', 'CrediFlow 1.9.11 Beta · build 201')
u = u.replace('CrediFlow 1.9.10 Beta · build 200', 'CrediFlow 1.9.11 Beta · build 201')
up.write_text(u, encoding='utf-8')

print('CrediFlow 1.9.11: stable full-payment flow + isolated amortization + no bulk-payment button')

# trigger: 1.9.11 QA diagnostics after payment-flow cleanup

# trigger: rerun QA with API descriptor search fix
