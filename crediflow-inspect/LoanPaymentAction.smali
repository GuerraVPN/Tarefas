.class final Lbr/com/guerravpn/crediflow/LoanPaymentAction;
.super Ljava/lang/Object;
.implements Landroid/view/View$OnClickListener;
.implements Landroid/content/DialogInterface$OnClickListener;

.field private final a:Lbr/com/guerravpn/crediflow/MainActivityV06;
.field private final b:Lorg/json/JSONObject;
.field private c:Landroid/widget/EditText;

.method constructor <init>(Lbr/com/guerravpn/crediflow/MainActivityV06;)V
    .locals 1
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V
    iput-object p1, p0, Lbr/com/guerravpn/crediflow/LoanPaymentAction;->a:Lbr/com/guerravpn/crediflow/MainActivityV06;
    const/4 v0, 0x0
    iput-object v0, p0, Lbr/com/guerravpn/crediflow/LoanPaymentAction;->b:Lorg/json/JSONObject;
    return-void
.end method

.method constructor <init>(Lbr/com/guerravpn/crediflow/MainActivityV06;Lorg/json/JSONObject;)V
    .locals 0
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V
    iput-object p1, p0, Lbr/com/guerravpn/crediflow/LoanPaymentAction;->a:Lbr/com/guerravpn/crediflow/MainActivityV06;
    iput-object p2, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->b:Lorg/json/JSONObject;
    return-void
.end method

.method public onClick(Landroid/view/View;)V
    .locals 10
    iget-object v0, p0, Lbr/com/guerravpn/crediflow/LoanPaymentAction;->b:Lorg/json/JSONObject;
    if-eqz v0, :all

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/LoanPaymentAction;->a:Lbr/com/guerravpn/crediflow/MainActivityV06;
    new-instance v2, Landroid/app/AlertDialog$Builder;
    invoke-direct {v2, v1}, Landroid/app/AlertDialog$Builder;-><init>(Landroid/content/Context;)V
    const-string v3, "Amortizar empréstimo"
    invoke-virtual {v2, v3}, Landroid/app/AlertDialog$Builder;->setTitle(Ljava/lang/CharSequence;)Landroid/app/AlertDialog$Builder;

    new-instance v3, Landroid/widget/LinearLayout;
    invoke-direct {v3, v1}, Landroid/widget/LinearLayout;-><init>(Landroid/content/Context;)V
    const/4 v4, 0x1
    invoke-virtual {v3, v4}, Landroid/widget/LinearLayout;->setOrientation(I)V
    const/16 v4, 0x18
    invoke-virtual {v3, v4, v4, v4, v4}, Landroid/widget/LinearLayout;->setPadding(IIII)V

    new-instance v4, Landroid/widget/TextView;
    invoke-direct {v4, v1}, Landroid/widget/TextView;-><init>(Landroid/content/Context;)V
    const-string v5, "Digite quanto pretende pagar neste empréstimo."
    invoke-virtual {v4, v5}, Landroid/widget/TextView;->setText(Ljava/lang/CharSequence;)V
    const/high16 v5, 0x41800000
    invoke-virtual {v4, v5}, Landroid/widget/TextView;->setTextSize(F)V
    invoke-virtual {v3, v4}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    new-instance v4, Landroid/widget/EditText;
    invoke-direct {v4, v1}, Landroid/widget/EditText;-><init>(Landroid/content/Context;)V
    const-string v5, "Valor a pagar"
    invoke-virtual {v4, v5}, Landroid/widget/EditText;->setHint(Ljava/lang/CharSequence;)V
    const/16 v5, 0x2002
    invoke-virtual {v4, v5}, Landroid/widget/EditText;->setInputType(I)V
    invoke-virtual {v3, v4}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V
    iput-object v4, p0, Lbr/com/guerravpn/crediflow/LoanPaymentAction;->c:Landroid/widget/EditText;

    invoke-virtual {v2, v3}, Landroid/app/AlertDialog$Builder;->setView(Landroid/view/View;)Landroid/app/AlertDialog$Builder;
    const-string v3, "Ver saldo restante"
    invoke-virtual {v2, v3, p0}, Landroid/app/AlertDialog$Builder;->setPositiveButton(Ljava/lang/CharSequence;Landroid/content/DialogInterface$OnClickListener;)Landroid/app/AlertDialog$Builder;
    const-string v3, "Cancelar"
    const/4 v4, 0x0
    invoke-virtual {v2, v3, v4}, Landroid/app/AlertDialog$Builder;->setNegativeButton(Ljava/lang/CharSequence;Landroid/content/DialogInterface$OnClickListener;)Landroid/app/AlertDialog$Builder;
    invoke-virtual {v2}, Landroid/app/AlertDialog$Builder;->show()Landroid/app/AlertDialog;
    return-void

:all
    iget-object v1, p0, Lbr/com/guerravpn/crediflow/LoanPaymentAction;->a:Lbr/com/guerravpn/crediflow/MainActivityV06;
    iget-object v2, v1, Lbr/com/guerravpn/crediflow/MainActivityV06;->currentLoans:Lorg/json/JSONArray;
    if-eqz v2, :none

    const-wide/16 v3, 0x0
    const/4 v5, 0x0
:loop
    invoke-virtual {v2}, Lorg/json/JSONArray;->length()I
    move-result v6
    if-ge v5, v6, :done
    invoke-virtual {v2, v5}, Lorg/json/JSONArray;->optJSONObject(I)Lorg/json/JSONObject;
    move-result-object v6
    if-eqz v6, :next
    const-string v7, "status"
    invoke-virtual {v6, v7}, Lorg/json/JSONObject;->optString(Ljava/lang/String;)Ljava/lang/String;
    move-result-object v7
    const-string v8, "active"
    invoke-virtual {v8, v7}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z
    move-result v8
    if-nez v8, :eligible
    const-string v8, "late"
    invoke-virtual {v8, v7}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z
    move-result v8
    if-eqz v8, :next
:eligible
    const-string v7, "total_amount"
    const-wide/16 v8, 0x0
    invoke-virtual {v6, v7, v8, v9}, Lorg/json/JSONObject;->optDouble(Ljava/lang/String;D)D
    move-result-wide v7
    add-double/2addr v3, v7
:next
    add-int/lit8 v5, v5, 0x1
    goto :loop

:done
    invoke-static {v3, v4}, Lbr/com/guerravpn/crediflow/MainActivityV06;->money(D)Ljava/lang/String;
    move-result-object v5
    new-instance v6, Landroid/app/AlertDialog$Builder;
    invoke-direct {v6, v1}, Landroid/app/AlertDialog$Builder;-><init>(Landroid/content/Context;)V
    const-string v7, "Pagar todos os empréstimos"
    invoke-virtual {v6, v7}, Landroid/app/AlertDialog$Builder;->setTitle(Ljava/lang/CharSequence;)Landroid/app/AlertDialog$Builder;
    new-instance v7, Ljava/lang/StringBuilder;
    invoke-direct {v7}, Ljava/lang/StringBuilder;-><init>()V
    const-string v8, "Saldo total dos empréstimos ativos/em atraso: "
    invoke-virtual {v7, v8}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;
    move-result-object v7
    invoke-virtual {v7, v5}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;
    move-result-object v7
    const-string v8, ". A quitação continuará sendo enviada empréstimo por empréstimo para registrar cada comprovante."
    invoke-virtual {v7, v8}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;
    move-result-object v7
    invoke-virtual {v7}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;
    move-result-object v7
    invoke-virtual {v6, v7}, Landroid/app/AlertDialog$Builder;->setMessage(Ljava/lang/CharSequence;)Landroid/app/AlertDialog$Builder;
    const-string v7, "Fechar"
    const/4 v8, 0x0
    invoke-virtual {v6, v7, v8}, Landroid/app/AlertDialog$Builder;->setPositiveButton(Ljava/lang/CharSequence;Landroid/content/DialogInterface$OnClickListener;)Landroid/app/AlertDialog$Builder;
    invoke-virtual {v6}, Landroid/app/AlertDialog$Builder;->show()Landroid/app/AlertDialog;
    return-void

:none
    new-instance v2, Landroid/widget/Toast;
    const-string v3, "Aguarde os empréstimos terminarem de carregar."
    const/4 v4, 0x0
    invoke-static {v1, v3, v4}, Landroid/widget/Toast;->makeText(Landroid/content/Context;Ljava/lang/CharSequence;I)Landroid/widget/Toast;
    move-result-object v2
    invoke-virtual {v2}, Landroid/widget/Toast;->show()V
    return-void
.end method

.method public onClick(Landroid/content/DialogInterface;I)V
    .locals 10
    iget-object v0, p0, Lbr/com/guerravpn/crediflow/LoanPaymentAction;->c:Landroid/widget/EditText;
    if-nez v0, :go
    return-void
:go
    iget-object v1, p0, Lbr/com/guerravpn/crediflow/LoanPaymentAction;->a:Lbr/com/guerravpn/crediflow/MainActivityV06;
    invoke-virtual {v0}, Landroid/widget/EditText;->getText()Landroid/text/Editable;
    move-result-object v0
    invoke-virtual {v0}, Ljava/lang/Object;->toString()Ljava/lang/String;
    move-result-object v0
    invoke-virtual {v0}, Ljava/lang/String;->trim()Ljava/lang/String;
    move-result-object v0
    const-string v2, ","
    const-string v3, "."
    invoke-virtual {v0, v2, v3}, Ljava/lang/String;->replace(Ljava/lang/CharSequence;Ljava/lang/CharSequence;)Ljava/lang/String;

    :try_start_0
    invoke-static {v0}, Ljava/lang/Double;->parseDouble(Ljava/lang/String;)D
    move-result-wide v2
    const-wide/16 v4, 0x0
    cmpg-double v6, v2, v4
    if-lez v6, :invalid

    iget-object v0, p0, Lbr/com/guerravpn/crediflow/LoanPaymentAction;->b:Lorg/json/JSONObject;
    const-string v4, "total_amount"
    const-wide/16 v6, 0x0
    invoke-virtual {v0, v4, v6, v7}, Lorg/json/JSONObject;->optDouble(Ljava/lang/String;D)D
    move-result-wide v4
    sub-double v6, v4, v2
    const-wide/16 v8, 0x0
    invoke-static {v8, v9, v6, v7}, Ljava/lang/Math;->max(DD)D
    move-result-wide v6

    cmpg-double v8, v4, v2
    if-gtz v8, :partial

    new-instance v4, Lbr/com/guerravpn/crediflow/EarlyPaymentUi;
    const-string v5, "id"
    iget-object v8, p0, Lbr/com/guerravpn/crediflow/LoanPaymentAction;->b:Lorg/json/JSONObject;
    invoke-virtual {v8, v5}, Lorg/json/JSONObject;->optString(Ljava/lang/String;)Ljava/lang/String;
    move-result-object v5
    invoke-direct {v4, v1, v5}, Lbr/com/guerravpn/crediflow/EarlyPaymentUi;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;Ljava/lang/String;)V
    iput-object v4, v1, Lbr/com/guerravpn/crediflow/MainActivityV06;->earlyPaymentUi:Lbr/com/guerravpn/crediflow/EarlyPaymentUi;
    invoke-virtual {v4}, Lbr/com/guerravpn/crediflow/EarlyPaymentUi;->show()V
    return-void

:partial
    invoke-static {v6, v7}, Lbr/com/guerravpn/crediflow/MainActivityV06;->money(D)Ljava/lang/String;
    move-result-object v0
    new-instance v4, Landroid/app/AlertDialog$Builder;
    invoke-direct {v4, v1}, Landroid/app/AlertDialog$Builder;-><init>(Landroid/content/Context;)V
    const-string v5, "Saldo restante"
    invoke-virtual {v4, v5}, Landroid/app/AlertDialog$Builder;->setTitle(Ljava/lang/CharSequence;)Landroid/app/AlertDialog$Builder;
    new-instance v5, Ljava/lang/StringBuilder;
    invoke-direct {v5}, Ljava/lang/StringBuilder;-><init>()V
    const-string v8, "Após pagar o valor informado, o saldo estimado ficará em "
    invoke-virtual {v5, v8}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;
    move-result-object v5
    invoke-virtual {v5, v0}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;
    move-result-object v5
    const-string v8, "."
    invoke-virtual {v5, v8}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;
    move-result-object v5
    invoke-virtual {v5}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;
    move-result-object v5
    invoke-virtual {v4, v5}, Landroid/app/AlertDialog$Builder;->setMessage(Ljava/lang/CharSequence;)Landroid/app/AlertDialog$Builder;
    const-string v5, "Fechar"
    const/4 v8, 0x0
    invoke-virtual {v4, v5, v8}, Landroid/app/AlertDialog$Builder;->setPositiveButton(Ljava/lang/CharSequence;Landroid/content/DialogInterface$OnClickListener;)Landroid/app/AlertDialog$Builder;
    invoke-virtual {v4}, Landroid/app/AlertDialog$Builder;->show()Landroid/app/AlertDialog;
    return-void

:invalid
    new-instance v4, Landroid/widget/Toast;
    const-string v5, "Informe um valor maior que zero."
    const/4 v6, 0x0
    invoke-static {v1, v5, v6}, Landroid/widget/Toast;->makeText(Landroid/content/Context;Ljava/lang/CharSequence;I)Landroid/widget/Toast;
    move-result-object v4
    invoke-virtual {v4}, Landroid/widget/Toast;->show()V
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0
    return-void

:catch_0
    new-instance v4, Landroid/widget/Toast;
    const-string v5, "Valor inválido."
    const/4 v6, 0x0
    invoke-static {v1, v5, v6}, Landroid/widget/Toast;->makeText(Landroid/content/Context;Ljava/lang/CharSequence;I)Landroid/widget/Toast;
    move-result-object v4
    invoke-virtual {v4}, Landroid/widget/Toast;->show()V
    return-void
.end method
