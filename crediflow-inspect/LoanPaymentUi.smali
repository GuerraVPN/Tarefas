.class public final Lbr/com/guerravpn/crediflow/LoanPaymentUi;
.super Ljava/lang/Object;

.method public static add(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/widget/LinearLayout;Lorg/json/JSONObject;)V
    .locals 3
    new-instance v0, Lbr/com/guerravpn/crediflow/LoanPaymentAction;
    invoke-direct {v0, p0, p2}, Lbr/com/guerravpn/crediflow/LoanPaymentAction;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;Lorg/json/JSONObject;)V
    iget-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;
    const-string v2, "Amortizar valor"
    invoke-virtual {v1, v2, v0}, Lbr/com/guerravpn/crediflow/Ui;->outline(Ljava/lang/String;Landroid/view/View$OnClickListener;)Landroid/widget/Button;
    move-result-object v2
    invoke-virtual {p1, v2}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V
    return-void
.end method

.method public static addAll(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/widget/LinearLayout;)V
    .locals 3
    new-instance v0, Lbr/com/guerravpn/crediflow/LoanPaymentAction;
    invoke-direct {v0, p0}, Lbr/com/guerravpn/crediflow/LoanPaymentAction;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;)V
    iget-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;
    const-string v2, "Pagar todos os empréstimos"
    invoke-virtual {v1, v2, v0}, Lbr/com/guerravpn/crediflow/Ui;->primary(Ljava/lang/String;Landroid/view/View$OnClickListener;)Landroid/widget/Button;
    move-result-object v2
    invoke-virtual {p1, v2}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V
    return-void
.end method
