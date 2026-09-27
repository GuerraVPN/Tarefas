.class public final Lbr/com/guerravpn/crediflow/LoanAmortizeAction;
.super Ljava/lang/Object;
.implements Landroid/view/View$OnClickListener;

.field private final a:Lbr/com/guerravpn/crediflow/MainActivityV06;
.field private final b:Lorg/json/JSONObject;
.field private final c:Landroid/widget/EditText;
.field private final d:Landroid/widget/TextView;

.method public constructor <init>(Lbr/com/guerravpn/crediflow/MainActivityV06;Lorg/json/JSONObject;Landroid/widget/EditText;Landroid/widget/TextView;)V
    .locals 0
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V
    iput-object p1, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->a:Lbr/com/guerravpn/crediflow/MainActivityV06;
    iput-object p2, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->b:Lorg/json/JSONObject;
    iput-object p3, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->c:Landroid/widget/EditText;
    iput-object p4, p0, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->d:Landroid/widget/TextView;
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

    # Store the amount in the Activity and reuse the existing Pix/proof flow.
    iput-wide v2, v0, Lbr/com/guerravpn/crediflow/MainActivityV06;->partialPaymentAmount:D

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
.end method
