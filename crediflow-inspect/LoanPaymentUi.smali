.class public final Lbr/com/guerravpn/crediflow/LoanPaymentUi;
.super Ljava/lang/Object;

.method public static add(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/widget/LinearLayout;Lorg/json/JSONObject;)V
    .locals 7
    iget-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;
    const-string v1, "AMORTIZAÇÃO"
    invoke-virtual {v0, p1, v1}, Lbr/com/guerravpn/crediflow/Ui;->caption(Landroid/widget/LinearLayout;Ljava/lang/String;)V
    new-instance v1, Landroid/widget/EditText;
    invoke-direct {v1, p0}, Landroid/widget/EditText;-><init>(Landroid/content/Context;)V
    const-string v2, "Quanto deseja pagar? Ex.: 21,90"
    invoke-virtual {v1, v2}, Landroid/widget/EditText;->setHint(Ljava/lang/CharSequence;)V
    sget v2, Lbr/com/guerravpn/crediflow/Ui;->WHITE:I
    invoke-virtual {v1, v2}, Landroid/widget/EditText;->setTextColor(I)V
    sget v2, Lbr/com/guerravpn/crediflow/Ui;->MUTED:I
    invoke-virtual {v1, v2}, Landroid/widget/EditText;->setHintTextColor(I)V
    const/16 v2, 0x2002
    invoke-virtual {v1, v2}, Landroid/widget/EditText;->setInputType(I)V
    const/16 v2, 0x10
    invoke-virtual {v0, v2}, Lbr/com/guerravpn/crediflow/Ui;->dp(I)I
    move-result v2
    invoke-virtual {v1, v2, v2, v2, v2}, Landroid/widget/EditText;->setPadding(IIII)V
    sget v2, Lbr/com/guerravpn/crediflow/Ui;->CARD:I
    const/16 v3, 0x10
    invoke-virtual {v0, v2, v3}, Lbr/com/guerravpn/crediflow/Ui;->bg(II)Landroid/graphics/drawable/GradientDrawable;
    move-result-object v2
    invoke-virtual {v1, v2}, Landroid/widget/EditText;->setBackground(Landroid/graphics/drawable/Drawable;)V
    new-instance v2, Landroid/widget/LinearLayout$LayoutParams;
    const/4 v3, -0x1
    const/16 v4, 0x38
    invoke-virtual {v0, v4}, Lbr/com/guerravpn/crediflow/Ui;->dp(I)I
    move-result v4
    invoke-direct {v2, v3, v4}, Landroid/widget/LinearLayout$LayoutParams;-><init>(II)V
    const/4 v3, 0x6
    invoke-virtual {v0, v3}, Lbr/com/guerravpn/crediflow/Ui;->dp(I)I
    move-result v3
    iput v3, v2, Landroid/widget/LinearLayout$LayoutParams;->topMargin:I
    invoke-virtual {v1, v2}, Landroid/widget/EditText;->setLayoutParams(Landroid/view/ViewGroup$LayoutParams;)V
    invoke-virtual {p1, v1}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    new-instance v2, Landroid/widget/TextView;
    invoke-direct {v2, p0}, Landroid/widget/TextView;-><init>(Landroid/content/Context;)V
    const-string v3, "total_amount"
    const-wide/16 v4, 0x0
    invoke-virtual {p2, v3, v4, v5}, Lorg/json/JSONObject;->optDouble(Ljava/lang/String;D)D
    move-result-wide v4
    invoke-static {v4, v5}, Lbr/com/guerravpn/crediflow/MainActivityV06;->money(D)Ljava/lang/String;
    move-result-object v3
    new-instance v4, Ljava/lang/StringBuilder;
    invoke-direct {v4}, Ljava/lang/StringBuilder;-><init>()V
    const-string v5, "Saldo restante: "
    invoke-virtual {v4, v5}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;
    move-result-object v4
    invoke-virtual {v4, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;
    move-result-object v4
    invoke-virtual {v4}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;
    move-result-object v3
    invoke-virtual {v2, v3}, Landroid/widget/TextView;->setText(Ljava/lang/CharSequence;)V
    sget v3, Lbr/com/guerravpn/crediflow/Ui;->MUTED:I
    invoke-virtual {v2, v3}, Landroid/widget/TextView;->setTextColor(I)V
    const/high16 v3, 0x41600000
    invoke-virtual {v2, v3}, Landroid/widget/TextView;->setTextSize(F)V
    const/16 v3, 0x7
    invoke-virtual {v0, v3}, Lbr/com/guerravpn/crediflow/Ui;->dp(I)I
    move-result v4
    invoke-virtual {v2, v4, v4, v4, v4}, Landroid/widget/TextView;->setPadding(IIII)V
    invoke-virtual {p1, v2}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    new-instance v3, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;
    invoke-direct {v3, p0, p2, v1, v2}, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;Lorg/json/JSONObject;Landroid/widget/EditText;Landroid/widget/TextView;)V
    const-string v4, "Calcular e registrar pagamento"
    invoke-virtual {v0, v4, v3}, Lbr/com/guerravpn/crediflow/Ui;->outline(Ljava/lang/String;Landroid/view/View$OnClickListener;)Landroid/widget/Button;
    move-result-object v4
    invoke-virtual {v3, v4}, Lbr/com/guerravpn/crediflow/LoanAmortizeAction;->setButton(Landroid/widget/Button;)V
    invoke-virtual {p1, v4}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V
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