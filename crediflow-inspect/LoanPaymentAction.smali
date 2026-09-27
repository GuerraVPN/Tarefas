.class public final Lbr/com/guerravpn/crediflow/LoanPaymentAction;
.super Ljava/lang/Object;
.implements Landroid/view/View$OnClickListener;

.field private final a:Lbr/com/guerravpn/crediflow/MainActivityV06;
.field private final b:Lorg/json/JSONObject;

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
    iput-object p2, p0, Lbr/com/guerravpn/crediflow/LoanPaymentAction;->b:Lorg/json/JSONObject;
    return-void
.end method

.method public onClick(Landroid/view/View;)V
    .locals 12
    iget-object v0, p0, Lbr/com/guerravpn/crediflow/LoanPaymentAction;->a:Lbr/com/guerravpn/crediflow/MainActivityV06;
    iget-object v1, p0, Lbr/com/guerravpn/crediflow/LoanPaymentAction;->b:Lorg/json/JSONObject;
    if-eqz v1, :bulk

    new-instance v2, Lbr/com/guerravpn/crediflow/EarlyPaymentUi;
    const-string v3, "id"
    invoke-virtual {v1, v3}, Lorg/json/JSONObject;->optString(Ljava/lang/String;)Ljava/lang/String;
    move-result-object v3
    invoke-direct {v2, v0, v3}, Lbr/com/guerravpn/crediflow/EarlyPaymentUi;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;Ljava/lang/String;)V
    iput-object v2, v0, Lbr/com/guerravpn/crediflow/MainActivityV06;->earlyPaymentUi:Lbr/com/guerravpn/crediflow/EarlyPaymentUi;
    invoke-virtual {v2}, Lbr/com/guerravpn/crediflow/EarlyPaymentUi;->show()V
    return-void

:bulk
    iget-object v2, v0, Lbr/com/guerravpn/crediflow/MainActivityV06;->currentLoans:Lorg/json/JSONArray;
    if-eqz v2, :none
    const/4 v3, 0x0
    const/4 v4, 0x0
    const-wide/16 v5, 0x0
    const-string v7, ""

:scan
    invoke-virtual {v2}, Lorg/json/JSONArray;->length()I
    move-result v8
    if-ge v4, v8, :scanned
    invoke-virtual {v2, v4}, Lorg/json/JSONArray;->optJSONObject(I)Lorg/json/JSONObject;
    move-result-object v8
    if-eqz v8, :next
    const-string v9, "status"
    invoke-virtual {v8, v9}, Lorg/json/JSONObject;->optString(Ljava/lang/String;)Ljava/lang/String;
    move-result-object v9
    const-string v10, "active"
    invoke-virtual {v10, v9}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z
    move-result v10
    if-nez v10, :eligible
    const-string v10, "late"
    invoke-virtual {v10, v9}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z
    move-result v10
    if-eqz v10, :next
:eligible
    add-int/lit8 v3, v3, 0x1
    const-string v9, "total_amount"
    const-wide/16 v10, 0x0
    invoke-virtual {v8, v9, v10, v11}, Lorg/json/JSONObject;->optDouble(Ljava/lang/String;D)D
    move-result-wide v9
    add-double/2addr v5, v9
    const/4 v10, 0x1
    if-ne v3, v10, :next
    const-string v9, "id"
    invoke-virtual {v8, v9}, Lorg/json/JSONObject;->optString(Ljava/lang/String;)Ljava/lang/String;
    move-result-object v7
:next
    add-int/lit8 v4, v4, 0x1
    goto :scan

:scanned
    if-eqz v3, :none
    const/4 v4, 0x1
    if-ne v3, v4, :many
    invoke-virtual {v7}, Ljava/lang/String;->isEmpty()Z
    move-result v4
    if-nez v4, :many

    new-instance v2, Lbr/com/guerravpn/crediflow/EarlyPaymentUi;
    invoke-direct {v2, v0, v7}, Lbr/com/guerravpn/crediflow/EarlyPaymentUi;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;Ljava/lang/String;)V
    iput-object v2, v0, Lbr/com/guerravpn/crediflow/MainActivityV06;->earlyPaymentUi:Lbr/com/guerravpn/crediflow/EarlyPaymentUi;
    invoke-virtual {v2}, Lbr/com/guerravpn/crediflow/EarlyPaymentUi;->show()V
    return-void

:many
    invoke-static {v5, v6}, Lbr/com/guerravpn/crediflow/MainActivityV06;->money(D)Ljava/lang/String;
    move-result-object v2
    new-instance v4, Landroid/app/AlertDialog$Builder;
    invoke-direct {v4, v0}, Landroid/app/AlertDialog$Builder;-><init>(Landroid/content/Context;)V
    const-string v5, "Pagar todos os empréstimos"
    invoke-virtual {v4, v5}, Landroid/app/AlertDialog$Builder;->setTitle(Ljava/lang/CharSequence;)Landroid/app/AlertDialog$Builder;
    new-instance v5, Ljava/lang/StringBuilder;
    invoke-direct {v5}, Ljava/lang/StringBuilder;-><init>()V
    const-string v6, "Saldo total: "
    invoke-virtual {v5, v6}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;
    move-result-object v5
    invoke-virtual {v5, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;
    move-result-object v5
    const-string v6, "\n\nHá mais de um empréstimo ativo ou em atraso. A quitação é feita individualmente para manter cada comprovante vinculado ao empréstimo correto."
    invoke-virtual {v5, v6}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;
    move-result-object v5
    invoke-virtual {v5}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;
    move-result-object v5
    invoke-virtual {v4, v5}, Landroid/app/AlertDialog$Builder;->setMessage(Ljava/lang/CharSequence;)Landroid/app/AlertDialog$Builder;
    const-string v5, "Fechar"
    const/4 v6, 0x0
    invoke-virtual {v4, v5, v6}, Landroid/app/AlertDialog$Builder;->setPositiveButton(Ljava/lang/CharSequence;Landroid/content/DialogInterface$OnClickListener;)Landroid/app/AlertDialog$Builder;
    invoke-virtual {v4}, Landroid/app/AlertDialog$Builder;->show()Landroid/app/AlertDialog;
    return-void

:none
    const-string v2, "Nenhum empréstimo ativo ou em atraso para quitar."
    const/4 v3, 0x0
    invoke-static {v0, v2, v3}, Landroid/widget/Toast;->makeText(Landroid/content/Context;Ljava/lang/CharSequence;I)Landroid/widget/Toast;
    move-result-object v2
    invoke-virtual {v2}, Landroid/widget/Toast;->show()V
    return-void
.end method

# trigger approved CrediFlow 1.9.7 signing build
# build trigger: final build verification 2
