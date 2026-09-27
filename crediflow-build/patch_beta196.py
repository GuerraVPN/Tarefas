from pathlib import Path
import re

root = Path('/tmp/app')
main = next(root.rglob('MainActivityV06.smali'))
s = main.read_text(encoding='utf-8')

# Keep the updater delivered by Beta 1.9.5 and add Beta 1.9.6 payment controls.
if '.field currentLoans:Lorg/json/JSONArray;' not in s:
    s = s.replace('.method ', '.field currentLoans:Lorg/json/JSONArray;\n\n.method ', 1)

needle_field = '''    invoke-virtual {v12}, Lbr/com/guerravpn/crediflow/Api$Resp;->array()Lorg/json/JSONArray;

    move-result-object v8

    .local v8, "loa":Lorg/json/JSONArray;'''
replace_field = '''    invoke-virtual {v12}, Lbr/com/guerravpn/crediflow/Api$Resp;->array()Lorg/json/JSONArray;

    move-result-object v8

    .local v8, "loa":Lorg/json/JSONArray;
    iput-object v8, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->currentLoans:Lorg/json/JSONArray;'''
if s.count(needle_field) != 1:
    raise SystemExit(f'currentLoans insertion point count={s.count(needle_field)}')
s = s.replace(needle_field, replace_field, 1)

# Add "Amortizar valor" to every eligible loan card, immediately before the existing full-payoff button.
needle_loan = '''    iget-object v3, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    new-instance v12, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda36;'''
repl_loan = '''    iget-object v25, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    new-instance v26, Lbr/com/guerravpn/crediflow/LoanPaymentAction;

    invoke-direct {v26, p0, v8}, Lbr/com/guerravpn/crediflow/LoanPaymentAction;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;Lorg/json/JSONObject;)V

    const-string v27, "Amortizar valor"

    invoke-virtual {v25, v27, v26}, Lbr/com/guerravpn/crediflow/Ui;->outline(Ljava/lang/String;Landroid/view/View$OnClickListener;)Landroid/widget/Button;

    move-result-object v27

    invoke-virtual {v10, v27}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    iget-object v3, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    new-instance v12, Lbr/com/guerravpn/crediflow/MainActivityV06$ExternalSyntheticLambda36;'''
if s.count(needle_loan) != 1:
    raise SystemExit(f'per-loan insertion point count={s.count(needle_loan)}')
s = s.replace(needle_loan, repl_loan, 1)

# Add "Pagar todos os empréstimos" directly below "Solicitar empréstimo" on the home screen.
needle_home = '''    invoke-virtual {v0, v4}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    iget-object v4, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    new-instance v5, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda12;'''
repl_home = '''    invoke-virtual {v0, v4}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    iget-object v4, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    new-instance v5, Lbr/com/guerravpn/crediflow/LoanPaymentAction;

    invoke-direct {v5, p0}, Lbr/com/guerravpn/crediflow/LoanPaymentAction;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;)V

    const-string v6, "Pagar todos os empréstimos"

    invoke-virtual {v4, v6, v5}, Lbr/com/guerravpn/crediflow/Ui;->primary(Ljava/lang/String;Landroid/view/View$OnClickListener;)Landroid/widget/Button;

    move-result-object v4

    invoke-virtual {v0, v4}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    iget-object v4, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    new-instance v5, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda12;'''
if s.count(needle_home) != 1:
    raise SystemExit(f'home button insertion point count={s.count(needle_home)}')
s = s.replace(needle_home, repl_home, 1)

# The method now uses v25-v27.
loc = s.find('.method private synthetic lambda$showHome$32(')
end = s.find('.end method', loc)
if loc < 0 or end < 0:
    raise SystemExit('lambda$showHome$32 not found')
method = s[loc:end]
method = method.replace('.locals 25', '.locals 28', 1)
s = s[:loc] + method + s[end:]

main.write_text(s, encoding='utf-8')

# Bump APK version.
apktool = root / 'apktool.yml'
t = apktool.read_text(encoding='utf-8')
t = re.sub(r'versionCode: .*', 'versionCode: 196', t)
t = re.sub(r'versionName: .*', 'versionName: 1.9.6', t)
apktool.write_text(t, encoding='utf-8')

# Update the Beta 1.9.5 in-app updater to identify build 196.
up = next(root.rglob('UpdateActivity.smali'))
u = up.read_text(encoding='utf-8')
u = u.replace('current=195', 'current=196')
u = u.replace('CURRENT=195', 'CURRENT=196')
u = u.replace('CrediFlow 1.9.5 Beta · build 195', 'CrediFlow 1.9.6 Beta · build 196')
up.write_text(u, encoding='utf-8')

listener_src = Path('crediflow-inspect/LoanPaymentAction.smali')
if not listener_src.exists():
    raise SystemExit('LoanPaymentAction source file not found')
(main.parent / 'LoanPaymentAction.smali').write_text(listener_src.read_text(encoding='utf-8'), encoding='utf-8')
