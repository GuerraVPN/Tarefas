from pathlib import Path
import re

root = Path('/tmp/app')
main = next(root.rglob('MainActivityV06.smali'))
s = main.read_text(encoding='utf-8')

# Keep the updater delivered by Beta 1.9.5 and add Beta 1.9.8 payment controls.
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

# Safe partial-payment implementation:
# rebuild trigger: verify crash-safe constructor registers
# - keep the existing EarlyPaymentUi constructor/call path intact;
# - pass the requested amount through a field on MainActivityV06;
# - submit Pix + proof through the same early-payment request flow;
# - never mutate loan/installments directly from the client.
partial_field = '.field partialPaymentAmount:D'
if partial_field not in s:
    first_method = s.find('.method ')
    if first_method < 0:
        raise SystemExit('no method for partialPaymentAmount field')
    s = s[:first_method] + partial_field + '\n\n' + s[first_method:]

# Persist the new activity field before helper edits.
main.write_text(s, encoding='utf-8')

# Seed the helper sources into the decoded APK before applying runtime-safe edits.
# Seed the helper sources into the decoded APK before applying runtime-safe edits.
for name in ['LoanPaymentAction.smali', 'LoanPaymentUi.smali', 'LoanAmortizeAction.smali']:
    src = Path('crediflow-inspect') / name
    if not src.exists():
        raise SystemExit(name + ' source file not found')
    (main.parent / name).write_text(src.read_text(encoding='utf-8'), encoding='utf-8')

# The renderer only calculates/validates the amount and then opens the normal Pix/proof screen.
amort = main.parent / 'LoanAmortizeAction.smali'
a = amort.read_text(encoding='utf-8')
old_note = '    const-string v1, "Saldo calculado. O pagamento parcial ainda não é registrado no servidor."'
if old_note in a:
    a = re.sub(r'\.method public onClick\(Landroid/view/View;\)V[\s\S]*?\.end method',
r'''.method public onClick(Landroid/view/View;)V
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
    const-wide/16 v6, 0x0
    invoke-virtual {v1, v4, v6, v7}, Lorg/json/JSONObject;->optDouble(Ljava/lang/String;D)D
    move-result-wide v4
    sub-double v6, v4, v2
    const-wide/16 v8, 0x0
    invoke-static {v8, v9, v6, v7}, Ljava/lang/Math;->max(DD)D
    move-result-wide v6
    invoke-static {v6, v7}, Lbr/com/guerravpn/crediflow/MainActivityV06;->money(D)Ljava/lang/String;
    move-result-object v1

    const-string v4, "Saldo restante: "
    invoke-virtual {v4, v1}, Ljava/lang/String;->concat(Ljava/lang/String;)Ljava/lang/String;
    move-result-object v4
    iget-object v5, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->d:Landroid/widget/TextView;
    invoke-virtual {v5, v4}, Landroid/widget/TextView;->setText(Ljava/lang/CharSequence;)V

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
.end method''',a,count=1)
a = a.replace('const-string v1, "Saldo calculado. O pagamento parcial ainda não é registrado no servidor."','const-string v1, "Pagamento parcial: envie o Pix e o comprovante para análise do Admin."')
amort.write_text(a,encoding='utf-8')

# Ensure the MainActivity field is in the patched smali.
main.write_text(s,encoding='utf-8')

# Patch existing EarlyPaymentUi without adding a second constructor.
early = next(root.rglob('EarlyPaymentUi.smali'))
e = early.read_text(encoding='utf-8')
if '.field private final requestedAmount:D' not in e:
    e=e.replace('.field private final loanId:Ljava/lang/String;\n','.field private final loanId:Ljava/lang/String;\n\n.field private final requestedAmount:D\n',1)

    ctor_start=e.find('.method constructor <init>(Lbr/com/guerravpn/crediflow/MainActivityV06;Ljava/lang/String;)V')
    if ctor_start < 0:
        raise SystemExit('EarlyPaymentUi constructor not found')
    ctor_end=e.find('.end method',ctor_start)
    if ctor_end < 0:
        raise SystemExit('EarlyPaymentUi constructor end not found')
    ctor=e[ctor_start:ctor_end]
    ctor=ctor.replace('    .locals 1','    .locals 2',1)
    loan_line='    iput-object p2, p0, Lbr/com/guerravpn/crediflow/EarlyPaymentUi;->loanId:Ljava/lang/String;'
    if loan_line not in ctor:
        raise SystemExit('EarlyPaymentUi loanId assignment not found')
    ctor=ctor.replace(
        loan_line,
        loan_line+'\n\n    iget-wide v0, p1, Lbr/com/guerravpn/crediflow/MainActivityV06;->partialPaymentAmount:D\n    iput-wide v0, p0, Lbr/com/guerravpn/crediflow/EarlyPaymentUi;->requestedAmount:D\n    const-wide/16 v0, 0x0\n    iput-wide v0, p1, Lbr/com/guerravpn/crediflow/MainActivityV06;->partialPaymentAmount:D',
        1
    )
    e=e[:ctor_start]+ctor+e[ctor_end:]

# Use the requested amount for the amount displayed on the existing Pix screen.
render_start=e.find('.method private render(Lorg/json/JSONObject;)V')
render_end=e.find('.end method',render_start)
if render_start<0 or render_end<0: raise SystemExit('EarlyPaymentUi render method not found')
render=e[render_start:render_end]
needle='''    move-result-wide v7

    .line 70'''
replacement='''    move-result-wide v7

    iget-wide v9, v0, Lbr/com/guerravpn/crediflow/EarlyPaymentUi;->requestedAmount:D
    const-wide/16 v11, 0x0
    cmpg-double v13, v9, v11
    if-lez v13, :requested_done
    move-wide v7, v9
:requested_done

    .line 70'''
if needle not in render: raise SystemExit('EarlyPaymentUi render amount anchor not found')
render=render.replace(needle,replacement,1)
e=e[:render_start]+render+e[render_end:]

# Send the same proof file, now with the requested amount, using range-safe registers.
upload_start=e.find('.method private synthetic lambda$onProofSelected$7(Landroid/net/Uri;)V')
upload_end=e.find('.end method',upload_start)
if upload_start<0 or upload_end<0: raise SystemExit('EarlyPaymentUi proof method not found')
upload=e[upload_start:upload_end]
upload=upload.replace('    .locals 6','    .locals 7',1)
old_call='''    invoke-static {v3, v4, v1, v0, v2}, Lbr/com/guerravpn/crediflow/Api;->clientEarlyPayoffSubmit(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;[B)Lbr/com/guerravpn/crediflow/Api$Resp;'''
new_call='''    move-object v5, v0
    move-object v0, v3
    move-object v3, v5
    move-object v5, v1
    move-object v1, v4
    move-object v4, v2
    move-object v2, v5
    iget-wide v5, p0, Lbr/com/guerravpn/crediflow/EarlyPaymentUi;->requestedAmount:D
    invoke-static/range {v0 .. v6}, Lbr/com/guerravpn/crediflow/Api;->clientEarlyPayoffSubmit(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;[BD)Lbr/com/guerravpn/crediflow/Api$Resp;'''
if old_call not in upload: raise SystemExit('EarlyPaymentUi proof call anchor not found')
upload=upload.replace(old_call,new_call,1)
e=e[:upload_start]+upload+e[upload_end:]
early.write_text(e,encoding='utf-8')

# Add an overloaded API call that includes amount while preserving the old full-payment API method.
api=next(root.rglob('Api.smali'))
a_api=api.read_text(encoding='utf-8')
sig='clientEarlyPayoffSubmit(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;[BD)'
if sig not in a_api:
    insert_before='.method static clientEarlyPayoffSubmit(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;[B)'
    pos=a_api.find(insert_before)
    if pos<0: raise SystemExit('Api early payment method anchor not found')
    new_method='''.method static clientEarlyPayoffSubmit(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;[BD)Lbr/com/guerravpn/crediflow/Api$Resp;
    .locals 3
    .param p0, "accessToken"    # Ljava/lang/String;
    .param p1, "loanId"    # Ljava/lang/String;
    .param p2, "fileName"    # Ljava/lang/String;
    .param p3, "mimeType"    # Ljava/lang/String;
    .param p4, "bytes"    # [B
    .param p5, "amount"    # D

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
    a_api=a_api[:pos]+new_method+a_api[pos:]
    api.write_text(a_api,encoding='utf-8')

# Bump APK version.
apktool = root / 'apktool.yml'
t = apktool.read_text(encoding='utf-8')
t = re.sub(r'versionCode: .*', 'versionCode: 198', t)
t = re.sub(r'versionName: .*', 'versionName: 1.9.8', t)
apktool.write_text(t, encoding='utf-8')

# Update the Beta 1.9.5 in-app updater to identify build 196.
up = next(root.rglob('UpdateActivity.smali'))
u = up.read_text(encoding='utf-8')
u = u.replace('current=195', 'current=198')
u = u.replace('CURRENT=195', 'CURRENT=198')
u = u.replace('CrediFlow 1.9.5 Beta · build 195', 'CrediFlow 1.9.8 Beta · build 198')
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

# approved signing workflow trigger: Beta 1.9.8
