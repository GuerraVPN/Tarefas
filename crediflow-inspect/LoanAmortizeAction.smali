.class public final Lbr/com/guerravpn/crediflow/LoanAmortizeAction;
.super Ljava/lang/Object;
.implements Landroid/view/View$OnClickListener;

.field private final a:Lbr/com/guerravpn/crediflow/MainActivityV06;
.field private final b:Lorg/json/JSONObject;
.field private final c:Landroid/widget/EditText;
.field private final d:Landroid/widget/TextView;
.field private e:Landroid/widget/Button;

.method public constructor <init>(Lbr/com/guerravpn/crediflow/MainActivityV06;Lorg/json/JSONObject;Landroid/widget/EditText;Landroid/widget/TextView;)V
    .locals 0
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V
    iput-object p1, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->a:Lbr/com/guerravpn/crediflow/MainActivityV06;
    iput-object p2, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->b:Lorg/json/JSONObject;
    iput-object p3, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->c:Landroid/widget/EditText;
    iput-object p4, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->d:Landroid/widget/TextView;
    return-void
.end method

.method public setButton(Landroid/widget/Button;)V
    .locals 0
    iput-object p1, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->e:Landroid/widget/Button;
    return-void
.end method

.method public onClick(Landroid/view/View;)V
    .locals 12
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

    new-instance v6, Ljava/lang/StringBuilder;
    invoke-direct {v6}, Ljava/lang/StringBuilder;-><init>()V
    const-string v7, "Saldo restante: "
    invoke-virtual {v6, v7}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;
    move-result-object v6
    invoke-virtual {v6, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;
    move-result-object v6
    invoke-virtual {v6}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;
    move-result-object v1
    iget-object v6, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->d:Landroid/widget/TextView;
    invoke-virtual {v6, v1}, Landroid/widget/TextView;->setText(Ljava/lang/CharSequence;)V

    cmpg-double v8, v4, v2
    if-lez v8, :full

    iget-object v6, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->e:Landroid/widget/Button;
    const/4 v8, 0x0
    if-eqz v6, :button_ready
    invoke-virtual {v6, v8}, Landroid/widget/Button;->setEnabled(Z)V

:button_ready
    new-instance v6, Lorg/json/JSONObject;
    invoke-direct {v6}, Lorg/json/JSONObject;-><init>()V
    const-string v7, "loanId"
    iget-object v8, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->b:Lorg/json/JSONObject;
    const-string v9, "id"
    invoke-virtual {v8, v9}, Lorg/json/JSONObject;->optString(Ljava/lang/String;)Ljava/lang/String;
    move-result-object v8
    invoke-virtual {v6, v7, v8}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;
    const-string v7, "amount"
    invoke-virtual {v6, v7, v2, v3}, Lorg/json/JSONObject;->put(Ljava/lang/String;D)Lorg/json/JSONObject;

    const-string v7, "functions/v1/client-partial-payment"
    iget-object v8, v0, Lbr/com/guerravpn/crediflow/MainActivityV06;->accessToken:Ljava/lang/String;
    invoke-static {v7, v6, v8}, Lbr/com/guerravpn/crediflow/Api;->post(Ljava/lang/String;Lorg/json/JSONObject;Ljava/lang/String;)Lbr/com/guerravpn/crediflow/Api$Resp;
    move-result-object v7
    invoke-virtual {v7}, Lbr/com/guerravpn/crediflow/Api$Resp;->ok()Z
    move-result v8
    if-eqz v8, :server_error

    invoke-virtual {v7}, Lbr/com/guerravpn/crediflow/Api$Resp;->object()Lorg/json/JSONObject;
    move-result-object v8
    const-string v9, "remainingAmount"
    const-wide/16 v10, 0x0
    invoke-virtual {v8, v9, v10, v11}, Lorg/json/JSONObject;->optDouble(Ljava/lang/String;D)D
    move-result-wide v6
    invoke-static {v6, v7}, Lbr/com/guerravpn/crediflow/MainActivityV06;->money(D)Ljava/lang/String;
    move-result-object v6

    iget-object v7, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->d:Landroid/widget/TextView;
    new-instance v8, Ljava/lang/StringBuilder;
    invoke-direct {v8}, Ljava/lang/StringBuilder;-><init>()V
    const-string v9, "Pagamento registrado\nSaldo restante: "
    invoke-virtual {v8, v9}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;
    move-result-object v8
    invoke-virtual {v8, v6}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;
    move-result-object v8
    invoke-virtual {v8}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;
    move-result-object v8
    invoke-virtual {v7, v8}, Landroid/widget/TextView;->setText(Ljava/lang/CharSequence;)V

    iget-object v7, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->e:Landroid/widget/Button;
    if-eqz v7, :toast_ok
    const/4 v8, 0x0
    invoke-virtual {v7, v8}, Landroid/widget/Button;->setEnabled(Z)V
    const-string v8, "Pagamento registrado"
    invoke-virtual {v7, v8}, Landroid/widget/Button;->setText(Ljava/lang/CharSequence;)V

:toast_ok
    const-string v7, "Pagamento parcial registrado e lançado em Pagamentos."
    const/4 v8, 0x0
    invoke-static {v0, v7, v8}, Landroid/widget/Toast;->makeText(Landroid/content/Context;Ljava/lang/CharSequence;I)Landroid/widget/Toast;
    move-result-object v8
    invoke-virtual {v8}, Landroid/widget/Toast;->show()V
    return-void

:server_error
    iget-object v6, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->e:Landroid/widget/Button;
    if-eqz v6, :server_msg
    const/4 v8, 0x1
    invoke-virtual {v6, v8}, Landroid/widget/Button;->setEnabled(Z)V
:server_msg
    invoke-virtual {v7}, Lbr/com/guerravpn/crediflow/Api$Resp;->errorMessage()Ljava/lang/String;
    move-result-object v6
    new-instance v7, Ljava/lang/Exception;
    invoke-direct {v7, v6}, Ljava/lang/Exception;-><init>(Ljava/lang/String;)V
    throw v7

:full
    new-instance v6, Lbr/com/guerravpn/crediflow/EarlyPaymentUi;
    iget-object v1, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->b:Lorg/json/JSONObject;
    const-string v7, "id"
    invoke-virtual {v1, v7}, Lorg/json/JSONObject;->optString(Ljava/lang/String;)Ljava/lang/String;
    move-result-object v7
    invoke-direct {v6, v0, v7}, Lbr/com/guerravpn/crediflow/EarlyPaymentUi;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;Ljava/lang/String;)V
    iput-object v6, v0, Lbr/com/guerravpn/crediflow/MainActivityV06;->earlyPaymentUi:Lbr/com/guerravpn/crediflow/EarlyPaymentUi;
    invoke-virtual {v6}, Lbr/com/guerravpn/crediflow/EarlyPaymentUi;->show()V
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
    move-exception v6
    iget-object v3, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->e:Landroid/widget/Button;
    const/4 v2, 0x1
    if-eqz v3, :catch_toast
    invoke-virtual {v3, v2}, Landroid/widget/Button;->setEnabled(Z)V
:catch_toast
    invoke-static {v6}, Lbr/com/guerravpn/crediflow/MainActivityV06;->friendly(Ljava/lang/Exception;)Ljava/lang/String;
    move-result-object v4
    new-instance v5, Ljava/lang/StringBuilder;
    invoke-direct {v5}, Ljava/lang/StringBuilder;-><init>()V
    const-string v1, "Falha ao registrar pagamento: "
    invoke-virtual {v5, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;
    move-result-object v5
    invoke-virtual {v5, v4}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;
    move-result-object v4
    invoke-virtual {v5}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;
    move-result-object v4
    const/4 v5, 0x0
    invoke-static {v0, v4, v5}, Landroid/widget/Toast;->makeText(Landroid/content/Context;Ljava/lang/CharSequence;I)Landroid/widget/Toast;
    move-result-object v5
    invoke-virtual {v5}, Landroid/widget/Toast;->show()V
    return-void
.end method