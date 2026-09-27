.class public final Lbr/com/guerravpn/crediflow/LoanAmortizeAction;
.super Ljava/lang/Object;
.implements Landroid/view/View$OnClickListener;
.implements Ljava/lang/Runnable;

.field private final a:Lbr/com/guerravpn/crediflow/MainActivityV06;
.field private final b:Lorg/json/JSONObject;
.field private final c:Landroid/widget/EditText;
.field private final d:Landroid/widget/TextView;
.field private e:Landroid/widget/Button;
.field private f:D
.field private g:I
.field private h:D
.field private i:Ljava/lang/String;

.method public constructor <init>(Lbr/com/guerravpn/crediflow/MainActivityV06;Lorg/json/JSONObject;Landroid/widget/EditText;Landroid/widget/TextView;)V
    .locals 0
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V
    iput-object p1, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->a:Lbr/com/guerravpn/crediflow/MainActivityV06;
    iput-object p2, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->b:Lorg/json/JSONObject;
    iput-object p3, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->c:Landroid/widget/EditText;
    iput-object p4, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->d:Landroid/widget/TextView;
    const/4 v0, 0x0
    iput v0, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->g:I
    return-void
.end method

.method public setButton(Landroid/widget/Button;)V
    .locals 0
    iput-object p1, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->e:Landroid/widget/Button;
    return-void
.end method

.method public onClick(Landroid/view/View;)V
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

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->b:Lorg/json/JSONObject;
    const-string v4, "total_amount"
    const-wide/16 v6, 0x0
    invoke-virtual {v1, v4, v6, v7}, Lorg/json/JSONObject;->optDouble(Ljava/lang/String;D)D
    move-result-wide v4

    cmpg-double v8, v4, v2
    if-gtz v8, :partial

:full
    new-instance v6, Lbr/com/guerravpn/crediflow/EarlyPaymentUi;
    const-string v7, "id"
    invoke-virtual {v1, v7}, Lorg/json/JSONObject;->optString(Ljava/lang/String;)Ljava/lang/String;
    move-result-object v7
    invoke-direct {v6, v0, v7}, Lbr/com/guerravpn/crediflow/EarlyPaymentUi;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;Ljava/lang/String;)V
    iput-object v6, v0, Lbr/com/guerravpn/crediflow/MainActivityV06;->earlyPaymentUi:Lbr/com/guerravpn/crediflow/EarlyPaymentUi;
    invoke-virtual {v6}, Lbr/com/guerravpn/crediflow/EarlyPaymentUi;->show()V
    return-void

:partial
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

    iput-wide v2, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->f:D

    iget-object v6, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->e:Landroid/widget/Button;
    if-eqz v6, :schedule
    const/4 v7, 0x0
    invoke-virtual {v6, v7}, Landroid/widget/Button;->setEnabled(Z)V
    const-string v7, "Registrando pagamento..."
    invoke-virtual {v6, v7}, Landroid/widget/Button;->setText(Ljava/lang/CharSequence;)V

:schedule
    const/4 v6, 0x1
    iput v6, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->g:I
    iget-object v6, v0, Lbr/com/guerravpn/crediflow/MainActivityV06;->io:Ljava/util/concurrent/ExecutorService;
    invoke-interface {v6, p0}, Ljava/util/concurrent/ExecutorService;->execute(Ljava/lang/Runnable;)V
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
    invoke-static {v6}, Lbr/com/guerravpn/crediflow/MainActivityV06;->friendly(Ljava/lang/Exception;)Ljava/lang/String;
    move-result-object v7
    const/4 v8, 0x3
    iput v8, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->g:I
    iput-object v7, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->i:Ljava/lang/String;
    invoke-virtual {v0, p0}, Lbr/com/guerravpn/crediflow/MainActivityV06;->runOnUiThread(Ljava/lang/Runnable;)V
    return-void
.end method

.method public run()V
    .locals 12
    iget v0, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->g:I
    const/4 v1, 0x1
    if-ne v0, v1, :ui

    :try_start
    new-instance v2, Lorg/json/JSONObject;
    invoke-direct {v2}, Lorg/json/JSONObject;-><init>()V

    const-string v3, "loanId"
    iget-object v4, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->b:Lorg/json/JSONObject;
    const-string v5, "id"
    invoke-virtual {v4, v5}, Lorg/json/JSONObject;->optString(Ljava/lang/String;)Ljava/lang/String;
    move-result-object v4
    invoke-virtual {v2, v3, v4}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    const-string v3, "amount"
    iget-wide v4, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->f:D
    invoke-virtual {v2, v3, v4, v5}, Lorg/json/JSONObject;->put(Ljava/lang/String;D)Lorg/json/JSONObject;

    const-string v3, "functions/v1/client-partial-payment"
    iget-object v4, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->a:Lbr/com/guerravpn/crediflow/MainActivityV06;
    iget-object v5, v4, Lbr/com/guerravpn/crediflow/MainActivityV06;->accessToken:Ljava/lang/String;
    invoke-static {v3, v2, v5}, Lbr/com/guerravpn/crediflow/Api;->post(Ljava/lang/String;Lorg/json/JSONObject;Ljava/lang/String;)Lbr/com/guerravpn/crediflow/Api$Resp;
    move-result-object v2
    invoke-virtual {v2}, Lbr/com/guerravpn/crediflow/Api$Resp;->ok()Z
    move-result v3
    if-eqz v3, :server_error

    invoke-virtual {v2}, Lbr/com/guerravpn/crediflow/Api$Resp;->object()Lorg/json/JSONObject;
    move-result-object v2
    const-string v3, "remainingAmount"
    const-wide/16 v4, 0x0
    invoke-virtual {v2, v3, v4, v5}, Lorg/json/JSONObject;->optDouble(Ljava/lang/String;D)D
    move-result-wide v2
    iput-wide v2, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->h:D
    const/4 v4, 0x2
    iput v4, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->g:I
    iget-object v4, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->a:Lbr/com/guerravpn/crediflow/MainActivityV06;
    invoke-virtual {v4, p0}, Lbr/com/guerravpn/crediflow/MainActivityV06;->runOnUiThread(Ljava/lang/Runnable;)V
    return-void

:server_error
    invoke-virtual {v2}, Lbr/com/guerravpn/crediflow/Api$Resp;->errorMessage()Ljava/lang/String;
    move-result-object v3
    new-instance v4, Ljava/lang/Exception;
    invoke-direct {v4, v3}, Ljava/lang/Exception;-><init>(Ljava/lang/String;)V
    throw v4

    :try_end
    .catch Ljava/lang/Exception; {:try_start .. :try_end} :catch_worker

:catch_worker
    move-exception v2
    iget-object v3, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->i:Ljava/lang/String;
    invoke-static {v2}, Lbr/com/guerravpn/crediflow/MainActivityV06;->friendly(Ljava/lang/Exception;)Ljava/lang/String;
    move-result-object v3
    iput-object v3, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->i:Ljava/lang/String;
    const/4 v4, 0x3
    iput v4, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->g:I
    iget-object v4, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->a:Lbr/com/guerravpn/crediflow/MainActivityV06;
    invoke-virtual {v4, p0}, Lbr/com/guerravpn/crediflow/MainActivityV06;->runOnUiThread(Ljava/lang/Runnable;)V
    return-void

:ui
    const/4 v1, 0x2
    if-ne v0, v1, :ui_error
    iget-wide v2, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->h:D

    :try_ui
    iget-object v4, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->b:Lorg/json/JSONObject;
    const-string v5, "total_amount"
    invoke-virtual {v4, v5, v2, v3}, Lorg/json/JSONObject;->put(Ljava/lang/String;D)Lorg/json/JSONObject;
    :try_end_ui
    .catch Ljava/lang/Exception; {:try_ui .. :try_end_ui} :ignore_json

:ignore_json
    invoke-static {v2, v3}, Lbr/com/guerravpn/crediflow/MainActivityV06;->money(D)Ljava/lang/String;
    move-result-object v4
    iget-object v5, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->d:Landroid/widget/TextView;
    new-instance v6, Ljava/lang/StringBuilder;
    invoke-direct {v6}, Ljava/lang/StringBuilder;-><init>()V
    const-string v7, "Pagamento registrado\nSaldo restante: "
    invoke-virtual {v6, v7}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;
    move-result-object v6
    invoke-virtual {v6, v4}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;
    move-result-object v6
    invoke-virtual {v6}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;
    move-result-object v6
    invoke-virtual {v5, v6}, Landroid/widget/TextView;->setText(Ljava/lang/CharSequence;)V
    iget-object v5, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->e:Landroid/widget/Button;
    if-eqz v5, :ui_toast
    const/4 v6, 0x1
    invoke-virtual {v5, v6}, Landroid/widget/Button;->setEnabled(Z)V
    const-string v6, "Calcular e registrar pagamento"
    invoke-virtual {v5, v6}, Landroid/widget/Button;->setText(Ljava/lang/CharSequence;)V
    iget-object v5, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->c:Landroid/widget/EditText;
    const-string v6, ""
    invoke-virtual {v5, v6}, Landroid/widget/EditText;->setText(Ljava/lang/CharSequence;)V

:ui_toast
    iget-object v5, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->a:Lbr/com/guerravpn/crediflow/MainActivityV06;
    const-string v6, "Pagamento parcial registrado em Pagamentos."
    const/4 v7, 0x0
    invoke-static {v5, v6, v7}, Landroid/widget/Toast;->makeText(Landroid/content/Context;Ljava/lang/CharSequence;I)Landroid/widget/Toast;
    move-result-object v7
    invoke-virtual {v7}, Landroid/widget/Toast;->show()V
    return-void

:ui_error
    iget-object v5, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->e:Landroid/widget/Button;
    if-eqz v5, :error_toast
    const/4 v6, 0x1
    invoke-virtual {v5, v6}, Landroid/widget/Button;->setEnabled(Z)V
    const-string v6, "Calcular e registrar pagamento"
    invoke-virtual {v5, v6}, Landroid/widget/Button;->setText(Ljava/lang/CharSequence;)V
:error_toast
    const-string v5, "Falha ao registrar pagamento: "
    iget-object v6, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->i:Ljava/lang/String;
    new-instance v7, Ljava/lang/StringBuilder;
    invoke-direct {v7}, Ljava/lang/StringBuilder;-><init>()V
    invoke-virtual {v7, v5}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;
    move-result-object v7
    invoke-virtual {v7, v6}, Ljava/lang/StringBuilder;->append(Ljava/lang/StringBuilder;)Ljava/lang/StringBuilder;
    move-result-object v7
    invoke-virtual {v7}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;
    move-result-object v7
    iget-object v6, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->a:Lbr/com/guerravpn/crediflow/MainActivityV06;
    const/4 v8, 0x0
    invoke-static {v6, v7, v8}, Landroid/widget/Toast;->makeText(Landroid/content/Context;Ljava/lang/CharSequence;I)Landroid/widget/Toast;
    move-result-object v8
    invoke-virtual {v8}, Landroid/widget/Toast;->show()V
    return-void
.end method