from pathlib import Path
import re

root = Path('/tmp/app')
main = next(root.rglob('MainActivityV06.smali'))
s = main.read_text(encoding='utf-8')

# Keep the updater delivered by Beta 1.9.5 and add Beta 1.9.10 payment controls.
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

# Keep EarlyPaymentUi and Api full-payoff flow completely untouched (1.9.6 baseline).
# The payment screen must use the original constructor and original Pix/proof submission path.

# Bump APK version.
apktool = root / 'apktool.yml'
t = apktool.read_text(encoding='utf-8')
t = re.sub(r'versionCode: .*', 'versionCode: 201', t)
t = re.sub(r'versionName: .*', 'versionName: 1.9.11', t)
apktool.write_text(t, encoding='utf-8')

# Update the in-app updater metadata.
up = next(root.rglob('UpdateActivity.smali'))
u = up.read_text(encoding='utf-8')
u = u.replace('current=195', 'current=201')
u = u.replace('CURRENT=195', 'CURRENT=201')
u = u.replace('CrediFlow 1.9.5 Beta · build 195', 'CrediFlow 1.9.11 Beta · build 201')
u = u.replace('CrediFlow 1.9.10 Beta · build 200', 'CrediFlow 1.9.11 Beta · build 201')
up.write_text(u, encoding='utf-8')

print('CrediFlow 1.9.11 conservative payment fix: original EarlyPaymentUi preserved')
