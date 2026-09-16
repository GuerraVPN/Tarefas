.method private synthetic lambda$showHome$28(Landroid/view/View;)V
    .locals 1
    .param p1, "v"    # Landroid/view/View;

    .line 56
    new-instance v0, Lbr/com/guerravpn/crediflow/LoanUi;

    invoke-direct {v0, p0}, Lbr/com/guerravpn/crediflow/LoanUi;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;)V

    invoke-virtual {v0}, Lbr/com/guerravpn/crediflow/LoanUi;->show()V

    return-void
.end method


.method private synthetic lambda$showHome$29(Landroid/view/View;)V
    .locals 0
    .param p1, "v"    # Landroid/view/View;

    .line 56
    invoke-virtual {p0}, Lbr/com/guerravpn/crediflow/MainActivityV06;->showProfile()V

    return-void
.end method


.method private synthetic lambda$showHome$30(Landroid/view/View;)V
    .locals 0
    .param p1, "v"    # Landroid/view/View;

    .line 56
    invoke-virtual {p0}, Lbr/com/guerravpn/crediflow/MainActivityV06;->logout()V

    return-void
.end method


.method private synthetic lambda$showHome$31(Lorg/json/JSONObject;Landroid/view/View;)V
    .locals 2
    .param p1, "l"    # Lorg/json/JSONObject;
    .param p2, "v"    # Landroid/view/View;

    .line 56
    new-instance v0, Lbr/com/guerravpn/crediflow/EarlyPaymentUi;

    const-string v1, "id"

    invoke-virtual {p1, v1}, Lorg/json/JSONObject;->optString(Ljava/lang/String;)Ljava/lang/String;

    move-result-object v1

    invoke-direct {v0, p0, v1}, Lbr/com/guerravpn/crediflow/EarlyPaymentUi;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;Ljava/lang/String;)V

    iput-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->earlyPaymentUi:Lbr/com/guerravpn/crediflow/EarlyPaymentUi;

    iget-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->earlyPaymentUi:Lbr/com/guerravpn/crediflow/EarlyPaymentUi;

    invoke-virtual {v0}, Lbr/com/guerravpn/crediflow/EarlyPaymentUi;->show()V

    return-void
.end method


.method private synthetic lambda$showHome$32(Landroid/widget/ProgressBar;Lorg/json/JSONObject;Landroid/widget/TextView;Landroid/widget/TextView;Lorg/json/JSONObject;Lorg/json/JSONArray;Landroid/widget/LinearLayout;)V
    .locals 25
    .param p1, "p"    # Landroid/widget/ProgressBar;
    .param p2, "prof"    # Lorg/json/JSONObject;
    .param p3, "title"    # Landroid/widget/TextView;
    .param p4, "sub"    # Landroid/widget/TextView;
    .param p5, "lim"    # Lorg/json/JSONObject;
    .param p6, "loa"    # Lorg/json/JSONArray;
    .param p7, "box"    # Landroid/widget/LinearLayout;

    .line 56
    move-object/from16 v0, p0

    move-object/from16 v1, p2

    move-object/from16 v2, p5

    move-object/from16 v3, p6

    move-object/from16 v4, p7

    const/16 v5, 0x8

    move-object/from16 v6, p1

    invoke-virtual {v6, v5}, Landroid/widget/ProgressBar;->setVisibility(I)V

    const-string v5, "full_name"

    const-string v7, "Cliente"

    invoke-virtual {v1, v5, v7}, Lorg/json/JSONObject;->optString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v5

    const-string v7, "display_name"

    invoke-virtual {v1, v7, v5}, Lorg/json/JSONObject;->optString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v5

    .local v5, "name":Ljava/lang/String;
    new-instance v7, Ljava/lang/StringBuilder;

    invoke-direct {v7}, Ljava/lang/StringBuilder;-><init>()V

    const-string v8, "Ol\u00e1, "

    invoke-virtual {v7, v8}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v7

    invoke-static {v5}, Lbr/com/guerravpn/crediflow/MainActivityV06;->firstName(Ljava/lang/String;)Ljava/lang/String;

    move-result-object v8

    invoke-virtual {v7, v8}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v7

    invoke-virtual {v7}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v7

    move-object/from16 v8, p3

    invoke-virtual {v8, v7}, Landroid/widget/TextView;->setText(Ljava/lang/CharSequence;)V

    const-string v7, "Sua conta CrediFlow"

    move-object/from16 v9, p4

    invoke-virtual {v9, v7}, Landroid/widget/TextView;->setText(Ljava/lang/CharSequence;)V

    const-string v7, "limit_amount"

    const-wide/16 v10, 0x0

    invoke-virtual {v2, v7, v10, v11}, Lorg/json/JSONObject;->optDouble(Ljava/lang/String;D)D

    move-result-wide v12

    .local v12, "approved":D
    const-wide/16 v14, 0x0

    .local v14, "used":D
    const/4 v7, 0x0

    .local v7, "i":I
    :goto_0
    invoke-virtual/range {p6 .. p6}, Lorg/json/JSONArray;->length()I

    move-result v10

    const-string v11, "late"

    const-string v1, "active"

    move-object/from16 v18, v5

    .end local v5    # "name":Ljava/lang/String;
    .local v18, "name":Ljava/lang/String;
    const-string v5, "principal"

    const-string v6, "status"

    if-ge v7, v10, :cond_3

    invoke-virtual {v3, v7}, Lorg/json/JSONArray;->optJSONObject(I)Lorg/json/JSONObject;

    move-result-object v10

    .local v10, "l":Lorg/json/JSONObject;
    if-nez v10, :cond_0

    goto :goto_1

    :cond_0
    invoke-virtual {v10, v6}, Lorg/json/JSONObject;->optString(Ljava/lang/String;)Ljava/lang/String;

    move-result-object v6

    .local v6, "st":Ljava/lang/String;
    const-string v8, "requested"

    invoke-virtual {v8, v6}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v8

    if-nez v8, :cond_1

    const-string v8, "approved"

    invoke-virtual {v8, v6}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v8

    if-nez v8, :cond_1

    const-string v8, "disbursing"

    invoke-virtual {v8, v6}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v8

    if-nez v8, :cond_1

    invoke-virtual {v1, v6}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v1

    if-nez v1, :cond_1

    invoke-virtual {v11, v6}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v1

    if-eqz v1, :cond_2

    :cond_1
    const-wide/16 v8, 0x0

    invoke-virtual {v10, v5, v8, v9}, Lorg/json/JSONObject;->optDouble(Ljava/lang/String;D)D

    move-result-wide v19

    add-double v14, v14, v19

    .end local v6    # "st":Ljava/lang/String;
    .end local v10    # "l":Lorg/json/JSONObject;
    :cond_2
    :goto_1
    add-int/lit8 v7, v7, 0x1

    move-object/from16 v6, p1

    move-object/from16 v1, p2

    move-object/from16 v8, p3

    move-object/from16 v9, p4

    move-object/from16 v5, v18

    const-wide/16 v10, 0x0

    goto :goto_0

    .end local v7    # "i":I
    :cond_3
    iget-object v7, v0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v8, "LIMITE DISPON\u00cdVEL"

    invoke-virtual {v7, v4, v8}, Lbr/com/guerravpn/crediflow/Ui;->eyebrow(Landroid/widget/LinearLayout;Ljava/lang/String;)V

    iget-object v7, v0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    sub-double v8, v12, v14

    move-wide/from16 v19, v14

    const-wide/16 v14, 0x0

    .end local v14    # "used":D
    .local v19, "used":D
    invoke-static {v14, v15, v8, v9}, Ljava/lang/Math;->max(DD)D

    move-result-wide v8

    invoke-static {v8, v9}, Lbr/com/guerravpn/crediflow/MainActivityV06;->money(D)Ljava/lang/String;

    move-result-object v8

    const/16 v9, 0x22

    invoke-virtual {v7, v4, v8, v9}, Lbr/com/guerravpn/crediflow/Ui;->title(Landroid/widget/LinearLayout;Ljava/lang/String;I)Landroid/widget/TextView;

    iget-object v7, v0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    new-instance v8, Ljava/lang/StringBuilder;

    invoke-direct {v8}, Ljava/lang/StringBuilder;-><init>()V

    const-string v9, "Limite aprovado "

    invoke-virtual {v8, v9}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v8

    invoke-static {v12, v13}, Lbr/com/guerravpn/crediflow/MainActivityV06;->money(D)Ljava/lang/String;

    move-result-object v9

    invoke-virtual {v8, v9}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v8

    const-string v9, " \u00b7 taxa "

    invoke-virtual {v8, v9}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v8

    const-string v9, "monthly_rate"

    const-wide/16 v14, 0x0

    invoke-virtual {v2, v9, v14, v15}, Lorg/json/JSONObject;->optDouble(Ljava/lang/String;D)D

    move-result-wide v9

    invoke-static {v9, v10}, Lbr/com/guerravpn/crediflow/MainActivityV06;->percent(D)Ljava/lang/String;

    move-result-object v9

    invoke-virtual {v8, v9}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v8

    const-string v9, " a.m. \u00b7 at\u00e9 "

    invoke-virtual {v8, v9}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v8

    const-string v9, "max_installments"

    const/4 v10, 0x1

    invoke-virtual {v2, v9, v10}, Lorg/json/JSONObject;->optInt(Ljava/lang/String;I)I

    move-result v9

    invoke-virtual {v8, v9}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    move-result-object v8

    const-string v9, "x"

    invoke-virtual {v8, v9}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v8

    invoke-virtual {v8}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v8

    invoke-virtual {v7, v4, v8}, Lbr/com/guerravpn/crediflow/Ui;->body(Landroid/widget/LinearLayout;Ljava/lang/String;)Landroid/widget/TextView;

    iget-object v7, v0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    new-instance v8, Ljava/lang/StringBuilder;

    invoke-direct {v8}, Ljava/lang/StringBuilder;-><init>()V

    const-string v14, "Atraso: "

    invoke-virtual {v8, v14}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v8

    const-string v14, "late_interest_daily_rate"

    move-object v15, v11

    const-wide/16 v10, 0x0

    invoke-virtual {v2, v14, v10, v11}, Lorg/json/JSONObject;->optDouble(Ljava/lang/String;D)D

    move-result-wide v16

    invoke-static/range {v16 .. v17}, Lbr/com/guerravpn/crediflow/MainActivityV06;->percent(D)Ljava/lang/String;

    move-result-object v14

    invoke-virtual {v8, v14}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v8

    const-string v14, " ao dia \u00b7 multa "

    invoke-virtual {v8, v14}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v8

    const-string v14, "late_fee_rate"

    invoke-virtual {v2, v14, v10, v11}, Lorg/json/JSONObject;->optDouble(Ljava/lang/String;D)D

    move-result-wide v21

    invoke-static/range {v21 .. v22}, Lbr/com/guerravpn/crediflow/MainActivityV06;->percent(D)Ljava/lang/String;

    move-result-object v10

    invoke-virtual {v8, v10}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v8

    invoke-virtual {v8}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v8

    invoke-virtual {v7, v4, v8}, Lbr/com/guerravpn/crediflow/Ui;->caption(Landroid/widget/LinearLayout;Ljava/lang/String;)V

    iget-object v7, v0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v8, "Empr\u00e9stimos"

    invoke-virtual {v7, v4, v8}, Lbr/com/guerravpn/crediflow/Ui;->cardTitle(Landroid/widget/LinearLayout;Ljava/lang/String;)V

    invoke-virtual/range {p6 .. p6}, Lorg/json/JSONArray;->length()I

    move-result v7

    if-nez v7, :cond_4

    iget-object v7, v0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v8, "Nenhum empr\u00e9stimo ainda."

    invoke-virtual {v7, v4, v8}, Lbr/com/guerravpn/crediflow/Ui;->body(Landroid/widget/LinearLayout;Ljava/lang/String;)Landroid/widget/TextView;

    :cond_4
    const/4 v7, 0x0

    .restart local v7    # "i":I
    :goto_2
    invoke-virtual/range {p6 .. p6}, Lorg/json/JSONArray;->length()I

    move-result v8

    if-ge v7, v8, :cond_a

    invoke-virtual {v3, v7}, Lorg/json/JSONArray;->optJSONObject(I)Lorg/json/JSONObject;

    move-result-object v8

    .local v8, "l":Lorg/json/JSONObject;
    if-nez v8, :cond_5

    move-object v3, v4

    move-wide/from16 v21, v12

    move-object v4, v15

    const-wide/16 v14, 0x0

    goto/16 :goto_5

    :cond_5
    iget-object v10, v0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    invoke-virtual {v10}, Lbr/com/guerravpn/crediflow/Ui;->mini()Landroid/widget/LinearLayout;

    move-result-object v10

    .local v10, "c":Landroid/widget/LinearLayout;
    invoke-virtual {v8, v6}, Lorg/json/JSONObject;->optString(Ljava/lang/String;)Ljava/lang/String;

    move-result-object v11

    .local v11, "st":Ljava/lang/String;
    iget-object v14, v0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    new-instance v2, Ljava/lang/StringBuilder;

    invoke-direct {v2}, Ljava/lang/StringBuilder;-><init>()V

    move-wide/from16 v21, v12

    const-wide/16 v12, 0x0

    .end local v12    # "approved":D
    .local v21, "approved":D
    invoke-virtual {v8, v5, v12, v13}, Lorg/json/JSONObject;->optDouble(Ljava/lang/String;D)D

    move-result-wide v23

    invoke-static/range {v23 .. v24}, Lbr/com/guerravpn/crediflow/MainActivityV06;->money(D)Ljava/lang/String;

    move-result-object v12

    invoke-virtual {v2, v12}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v2

    const-string v12, " \u00b7 "

    invoke-virtual {v2, v12}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v2

    const-string v13, "installments_count"

    const/4 v3, 0x1

    invoke-virtual {v8, v13, v3}, Lorg/json/JSONObject;->optInt(Ljava/lang/String;I)I

    move-result v13

    invoke-virtual {v2, v13}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    move-result-object v2

    invoke-virtual {v2, v9}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v2

    invoke-virtual {v2}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v2

    invoke-virtual {v14, v10, v2}, Lbr/com/guerravpn/crediflow/Ui;->cardTitle(Landroid/widget/LinearLayout;Ljava/lang/String;)V

    iget-object v2, v0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    new-instance v13, Ljava/lang/StringBuilder;

    invoke-direct {v13}, Ljava/lang/StringBuilder;-><init>()V

    const-string v14, "Total "

    invoke-virtual {v13, v14}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v13

    const-string v14, "total_amount"

    const-wide/16 v3, 0x0

    invoke-virtual {v8, v14, v3, v4}, Lorg/json/JSONObject;->optDouble(Ljava/lang/String;D)D

    move-result-wide v23

    invoke-static/range {v23 .. v24}, Lbr/com/guerravpn/crediflow/MainActivityV06;->money(D)Ljava/lang/String;

    move-result-object v3

    invoke-virtual {v13, v3}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v3

    invoke-virtual {v3, v12}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v3

    invoke-static {v11}, Lbr/com/guerravpn/crediflow/MainActivityV06;->statusPt(Ljava/lang/String;)Ljava/lang/String;

    move-result-object v4

    invoke-virtual {v3, v4}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v3

    invoke-virtual {v3}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v3

    invoke-virtual {v2, v10, v3}, Lbr/com/guerravpn/crediflow/Ui;->body(Landroid/widget/LinearLayout;Ljava/lang/String;)Landroid/widget/TextView;

    const-string v2, "first_due_date"

    const-string v3, ""

    invoke-virtual {v8, v2, v3}, Lorg/json/JSONObject;->optString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v2

    .local v2, "fd":Ljava/lang/String;
    invoke-virtual {v2}, Ljava/lang/String;->isEmpty()Z

    move-result v4

    if-nez v4, :cond_6

    iget-object v4, v0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    new-instance v12, Ljava/lang/StringBuilder;

    invoke-direct {v12}, Ljava/lang/StringBuilder;-><init>()V

    const-string v13, "1\u00ba vencimento: "

    invoke-virtual {v12, v13}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v12

    invoke-virtual {v12, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v12

    invoke-virtual {v12}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v12

    invoke-virtual {v4, v10, v12}, Lbr/com/guerravpn/crediflow/Ui;->caption(Landroid/widget/LinearLayout;Ljava/lang/String;)V

    :cond_6
    invoke-virtual {v1, v11}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v4

    if-nez v4, :cond_7

    move-object v4, v15

    invoke-virtual {v4, v11}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v12

    if-eqz v12, :cond_8

    goto :goto_3

    :cond_7
    move-object v4, v15

    :goto_3
    const-string v12, "id"

    invoke-virtual {v8, v12, v3}, Lorg/json/JSONObject;->optString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v3

    invoke-virtual {v3}, Ljava/lang/String;->isEmpty()Z

    move-result v3

    if-nez v3, :cond_8

    iget-object v3, v0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    new-instance v12, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda36;

    invoke-direct {v12, v0, v8}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda36;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;Lorg/json/JSONObject;)V

    const-string v13, "Pagar antecipado"

    invoke-virtual {v3, v13, v12}, Lbr/com/guerravpn/crediflow/Ui;->outline(Ljava/lang/String;Landroid/view/View$OnClickListener;)Landroid/widget/Button;

    move-result-object v3

    invoke-virtual {v10, v3}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    :cond_8
    const-string v3, "paid"

    invoke-virtual {v3, v11}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v3

    if-eqz v3, :cond_9

    const-string v3, "settlement_type"

    invoke-virtual {v8, v3}, Lorg/json/JSONObject;->optString(Ljava/lang/String;)Ljava/lang/String;

    move-result-object v3

    const-string v12, "early_pix"

    invoke-virtual {v12, v3}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v3

    if-eqz v3, :cond_9

    iget-object v3, v0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    new-instance v12, Ljava/lang/StringBuilder;

    invoke-direct {v12}, Ljava/lang/StringBuilder;-><init>()V

    const-string v13, "Quitado antecipadamente por Pix \u00b7 "

    invoke-virtual {v12, v13}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v12

    const-string v13, "settlement_amount"

    const-wide/16 v14, 0x0

    invoke-virtual {v8, v13, v14, v15}, Lorg/json/JSONObject;->optDouble(Ljava/lang/String;D)D

    move-result-wide v16

    invoke-static/range {v16 .. v17}, Lbr/com/guerravpn/crediflow/MainActivityV06;->money(D)Ljava/lang/String;

    move-result-object v13

    invoke-virtual {v12, v13}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v12

    invoke-virtual {v12}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v12

    invoke-virtual {v3, v10, v12}, Lbr/com/guerravpn/crediflow/Ui;->caption(Landroid/widget/LinearLayout;Ljava/lang/String;)V

    goto :goto_4

    :cond_9
    const-wide/16 v14, 0x0

    :goto_4
    move-object/from16 v3, p7

    invoke-virtual {v3, v10}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    .end local v2    # "fd":Ljava/lang/String;
    .end local v8    # "l":Lorg/json/JSONObject;
    .end local v10    # "c":Landroid/widget/LinearLayout;
    .end local v11    # "st":Ljava/lang/String;
    :goto_5
    add-int/lit8 v7, v7, 0x1

    move-object/from16 v2, p5

    move-object v15, v4

    move-wide/from16 v12, v21

    move-object v4, v3

    move-object/from16 v3, p6

    goto/16 :goto_2

    .end local v7    # "i":I
    .end local v21    # "approved":D
    .restart local v12    # "approved":D
    :cond_a
    return-void
.end method


.method static synthetic lambda$showHome$33(Landroid/widget/ProgressBar;Landroid/widget/TextView;Ljava/lang/Exception;)V
    .locals 1
    .param p0, "p"    # Landroid/widget/ProgressBar;
    .param p1, "sub"    # Landroid/widget/TextView;
    .param p2, "ex"    # Ljava/lang/Exception;

    .line 56
    const/16 v0, 0x8

    invoke-virtual {p0, v0}, Landroid/widget/ProgressBar;->setVisibility(I)V

    invoke-static {p2}, Lbr/com/guerravpn/crediflow/MainActivityV06;->friendly(Ljava/lang/Exception;)Ljava/lang/String;

    move-result-object v0

    invoke-virtual {p1, v0}, Landroid/widget/TextView;->setText(Ljava/lang/CharSequence;)V

    return-void
.end method


.method private synthetic lambda$showHome$34(Landroid/widget/ProgressBar;Landroid/widget/TextView;Landroid/widget/TextView;Landroid/widget/LinearLayout;)V
    .locals 16
    .param p1, "p"    # Landroid/widget/ProgressBar;
    .param p2, "title"    # Landroid/widget/TextView;
    .param p3, "sub"    # Landroid/widget/TextView;
    .param p4, "box"    # Landroid/widget/LinearLayout;

    .line 56
    move-object/from16 v10, p0

    :try_start_0
    new-instance v0, Ljava/lang/StringBuilder;

    invoke-direct {v0}, Ljava/lang/StringBuilder;-><init>()V

    const-string v1, "/rest/v1/profiles?select=full_name,display_name,email,phone,cpf_last4,account_status&user_id=eq."

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v0

    iget-object v1, v10, Lbr/com/guerravpn/crediflow/MainActivityV06;->userId:Ljava/lang/String;

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v0

    const-string v1, "&limit=1"

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v0

    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v0

    iget-object v1, v10, Lbr/com/guerravpn/crediflow/MainActivityV06;->accessToken:Ljava/lang/String;

    invoke-static {v0, v1}, Lbr/com/guerravpn/crediflow/Api;->get(Ljava/lang/String;Ljava/lang/String;)Lbr/com/guerravpn/crediflow/Api$Resp;

    move-result-object v0

    .local v0, "pr":Lbr/com/guerravpn/crediflow/Api$Resp;
    new-instance v1, Ljava/lang/StringBuilder;

    invoke-direct {v1}, Ljava/lang/StringBuilder;-><init>()V

    const-string v2, "/rest/v1/credit_limits?select=limit_amount,risk_tier,monthly_rate,max_installments,late_interest_daily_rate,late_fee_rate&user_id=eq."

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v1

    iget-object v2, v10, Lbr/com/guerravpn/crediflow/MainActivityV06;->userId:Ljava/lang/String;

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v1

    const-string v2, "&active=eq.true&limit=1"

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v1

    invoke-virtual {v1}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v1

    iget-object v2, v10, Lbr/com/guerravpn/crediflow/MainActivityV06;->accessToken:Ljava/lang/String;

    invoke-static {v1, v2}, Lbr/com/guerravpn/crediflow/Api;->get(Ljava/lang/String;Ljava/lang/String;)Lbr/com/guerravpn/crediflow/Api$Resp;

    move-result-object v1

    move-object v11, v1

    .local v11, "lr":Lbr/com/guerravpn/crediflow/Api$Resp;
    new-instance v1, Ljava/lang/StringBuilder;

    invoke-direct {v1}, Ljava/lang/StringBuilder;-><init>()V

    const-string v2, "/rest/v1/loans?select=id,principal,total_amount,installments_count,status,requested_at,first_due_date,settlement_amount,settlement_type&user_id=eq."

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v1

    iget-object v2, v10, Lbr/com/guerravpn/crediflow/MainActivityV06;->userId:Ljava/lang/String;

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v1

    const-string v2, "&order=requested_at.desc"

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v1

    invoke-virtual {v1}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v1

    iget-object v2, v10, Lbr/com/guerravpn/crediflow/MainActivityV06;->accessToken:Ljava/lang/String;

    invoke-static {v1, v2}, Lbr/com/guerravpn/crediflow/Api;->get(Ljava/lang/String;Ljava/lang/String;)Lbr/com/guerravpn/crediflow/Api$Resp;

    move-result-object v1

    move-object v12, v1

    .local v12, "lo":Lbr/com/guerravpn/crediflow/Api$Resp;
    invoke-virtual {v0}, Lbr/com/guerravpn/crediflow/Api$Resp;->ok()Z

    move-result v1

    if-eqz v1, :cond_4

    invoke-virtual {v11}, Lbr/com/guerravpn/crediflow/Api$Resp;->ok()Z

    move-result v1

    if-eqz v1, :cond_3

    invoke-virtual {v12}, Lbr/com/guerravpn/crediflow/Api$Resp;->ok()Z

    move-result v1

    if-eqz v1, :cond_2

    invoke-virtual {v0}, Lbr/com/guerravpn/crediflow/Api$Resp;->array()Lorg/json/JSONArray;

    move-result-object v1

    move-object v13, v1

    .local v13, "pa":Lorg/json/JSONArray;
    invoke-virtual {v11}, Lbr/com/guerravpn/crediflow/Api$Resp;->array()Lorg/json/JSONArray;

    move-result-object v1

    move-object v14, v1

    .local v14, "la":Lorg/json/JSONArray;
    invoke-virtual {v12}, Lbr/com/guerravpn/crediflow/Api$Resp;->array()Lorg/json/JSONArray;

    move-result-object v8

    .local v8, "loa":Lorg/json/JSONArray;
    invoke-virtual {v13}, Lorg/json/JSONArray;->length()I

    move-result v1

    const/4 v2, 0x0

    if-lez v1, :cond_0

    invoke-virtual {v13, v2}, Lorg/json/JSONArray;->getJSONObject(I)Lorg/json/JSONObject;

    move-result-object v1

    goto :goto_0

    :cond_0
    new-instance v1, Lorg/json/JSONObject;

    invoke-direct {v1}, Lorg/json/JSONObject;-><init>()V

    :goto_0
    move-object v4, v1

    .local v4, "prof":Lorg/json/JSONObject;
    invoke-virtual {v14}, Lorg/json/JSONArray;->length()I

    move-result v1

    if-lez v1, :cond_1

    invoke-virtual {v14, v2}, Lorg/json/JSONArray;->getJSONObject(I)Lorg/json/JSONObject;

    move-result-object v1

    goto :goto_1

    :cond_1
    new-instance v1, Lorg/json/JSONObject;

    invoke-direct {v1}, Lorg/json/JSONObject;-><init>()V

    :goto_1
    move-object v7, v1

    .local v7, "lim":Lorg/json/JSONObject;
    new-instance v15, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda42;

    move-object v1, v15

    move-object/from16 v2, p0

    move-object/from16 v3, p1

    move-object/from16 v5, p2

    move-object/from16 v6, p3

    move-object/from16 v9, p4

    invoke-direct/range {v1 .. v9}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda42;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/widget/ProgressBar;Lorg/json/JSONObject;Landroid/widget/TextView;Landroid/widget/TextView;Lorg/json/JSONObject;Lorg/json/JSONArray;Landroid/widget/LinearLayout;)V

    invoke-virtual {v10, v15}, Lbr/com/guerravpn/crediflow/MainActivityV06;->runOnUiThread(Ljava/lang/Runnable;)V

    move-object/from16 v2, p1

    move-object/from16 v3, p3

    .end local v0    # "pr":Lbr/com/guerravpn/crediflow/Api$Resp;
    .end local v4    # "prof":Lorg/json/JSONObject;
    .end local v7    # "lim":Lorg/json/JSONObject;
    .end local v8    # "loa":Lorg/json/JSONArray;
    .end local v11    # "lr":Lbr/com/guerravpn/crediflow/Api$Resp;
    .end local v12    # "lo":Lbr/com/guerravpn/crediflow/Api$Resp;
    .end local v13    # "pa":Lorg/json/JSONArray;
    .end local v14    # "la":Lorg/json/JSONArray;
    goto :goto_3

    .restart local v0    # "pr":Lbr/com/guerravpn/crediflow/Api$Resp;
    .restart local v11    # "lr":Lbr/com/guerravpn/crediflow/Api$Resp;
    .restart local v12    # "lo":Lbr/com/guerravpn/crediflow/Api$Resp;
    :cond_2
    new-instance v1, Ljava/lang/Exception;

    invoke-virtual {v12}, Lbr/com/guerravpn/crediflow/Api$Resp;->errorMessage()Ljava/lang/String;

    move-result-object v2

    invoke-direct {v1, v2}, Ljava/lang/Exception;-><init>(Ljava/lang/String;)V

    .end local p1    # "p":Landroid/widget/ProgressBar;
    .end local p2    # "title":Landroid/widget/TextView;
    .end local p3    # "sub":Landroid/widget/TextView;
    .end local p4    # "box":Landroid/widget/LinearLayout;
    :goto_2
    throw v1

    .restart local p1    # "p":Landroid/widget/ProgressBar;
    .restart local p2    # "title":Landroid/widget/TextView;
    .restart local p3    # "sub":Landroid/widget/TextView;
    .restart local p4    # "box":Landroid/widget/LinearLayout;
    :cond_3
    new-instance v1, Ljava/lang/Exception;

    invoke-virtual {v11}, Lbr/com/guerravpn/crediflow/Api$Resp;->errorMessage()Ljava/lang/String;

    move-result-object v2

    invoke-direct {v1, v2}, Ljava/lang/Exception;-><init>(Ljava/lang/String;)V

    goto :goto_2

    :cond_4
    new-instance v1, Ljava/lang/Exception;

    invoke-virtual {v0}, Lbr/com/guerravpn/crediflow/Api$Resp;->errorMessage()Ljava/lang/String;

    move-result-object v2

    invoke-direct {v1, v2}, Ljava/lang/Exception;-><init>(Ljava/lang/String;)V
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    goto :goto_2

    .end local v0    # "pr":Lbr/com/guerravpn/crediflow/Api$Resp;
    .end local v11    # "lr":Lbr/com/guerravpn/crediflow/Api$Resp;
    .end local v12    # "lo":Lbr/com/guerravpn/crediflow/Api$Resp;
    :catch_0
    move-exception v0

    .local v0, "ex":Ljava/lang/Exception;
    new-instance v1, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda43;

    move-object/from16 v2, p1

    move-object/from16 v3, p3

    invoke-direct {v1, v2, v3, v0}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda43;-><init>(Landroid/widget/ProgressBar;Landroid/widget/TextView;Ljava/lang/Exception;)V

    invoke-virtual {v10, v1}, Lbr/com/guerravpn/crediflow/MainActivityV06;->runOnUiThread(Ljava/lang/Runnable;)V

    .end local v0    # "ex":Ljava/lang/Exception;
    :goto_3
    return-void
.end method


.method private synthetic lambda$showProfile$35(Landroid/view/View;)V
    .locals 0
    .param p1, "v"    # Landroid/view/View;

    .line 58
    invoke-virtual {p0}, Lbr/com/guerravpn/crediflow/MainActivityV06;->logout()V

    return-void
.end method


.method private synthetic lambda$showProfile$36(Landroid/widget/ProgressBar;Landroid/widget/LinearLayout;Lorg/json/JSONObject;)V
    .locals 4
    .param p1, "p"    # Landroid/widget/ProgressBar;
    .param p2, "box"    # Landroid/widget/LinearLayout;
    .param p3, "q"    # Lorg/json/JSONObject;

    .line 58
    const/16 v0, 0x8

    invoke-virtual {p1, v0}, Landroid/widget/ProgressBar;->setVisibility(I)V

    iget-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v1, "full_name"

    const-string v2, "-"

    invoke-virtual {p3, v1, v2}, Lorg/json/JSONObject;->optString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v1

    const-string v3, "display_name"

    invoke-virtual {p3, v3, v1}, Lorg/json/JSONObject;->optString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v1

    const-string v3, "Nome"

    invoke-virtual {v0, p2, v3, v1}, Lbr/com/guerravpn/crediflow/Ui;->stat(Landroid/widget/LinearLayout;Ljava/lang/String;Ljava/lang/String;)V

    iget-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v1, "email"

    iget-object v3, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->email:Ljava/lang/String;

    invoke-virtual {p3, v1, v3}, Lorg/json/JSONObject;->optString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v1

    const-string v3, "E-mail"

    invoke-virtual {v0, p2, v3, v1}, Lbr/com/guerravpn/crediflow/Ui;->stat(Landroid/widget/LinearLayout;Ljava/lang/String;Ljava/lang/String;)V

    iget-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v1, "phone"

    invoke-virtual {p3, v1, v2}, Lorg/json/JSONObject;->optString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v1

    const-string v2, "Celular"

    invoke-virtual {v0, p2, v2, v1}, Lbr/com/guerravpn/crediflow/Ui;->stat(Landroid/widget/LinearLayout;Ljava/lang/String;Ljava/lang/String;)V

    iget-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    new-instance v1, Ljava/lang/StringBuilder;

    invoke-direct {v1}, Ljava/lang/StringBuilder;-><init>()V

    const-string v2, "\u2022\u2022\u2022.\u2022\u2022\u2022.\u2022\u2022\u2022-"

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v1

    const-string v2, "cpf_last4"

    const-string v3, "----"

    invoke-virtual {p3, v2, v3}, Lorg/json/JSONObject;->optString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v2

    invoke-virtual {v1, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v1

    invoke-virtual {v1}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v1

    const-string v2, "CPF"

    invoke-virtual {v0, p2, v2, v1}, Lbr/com/guerravpn/crediflow/Ui;->stat(Landroid/widget/LinearLayout;Ljava/lang/String;Ljava/lang/String;)V

    iget-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v1, "account_status"

    const-string v2, "active"

    invoke-virtual {p3, v1, v2}, Lorg/json/JSONObject;->optString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v1

    const-string v2, "Conta"

    invoke-virtual {v0, p2, v2, v1}, Lbr/com/guerravpn/crediflow/Ui;->stat(Landroid/widget/LinearLayout;Ljava/lang/String;Ljava/lang/String;)V

    return-void
.end method


.method private synthetic lambda$showProfile$37(Landroid/widget/ProgressBar;Landroid/widget/LinearLayout;Ljava/lang/Exception;)V
    .locals 2
    .param p1, "p"    # Landroid/widget/ProgressBar;
    .param p2, "box"    # Landroid/widget/LinearLayout;
    .param p3, "ex"    # Ljava/lang/Exception;

    .line 58
    const/16 v0, 0x8

    invoke-virtual {p1, v0}, Landroid/widget/ProgressBar;->setVisibility(I)V

    iget-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    invoke-static {p3}, Lbr/com/guerravpn/crediflow/MainActivityV06;->friendly(Ljava/lang/Exception;)Ljava/lang/String;

    move-result-object v1

    invoke-virtual {v0, p2, v1}, Lbr/com/guerravpn/crediflow/Ui;->body(Landroid/widget/LinearLayout;Ljava/lang/String;)Landroid/widget/TextView;

    return-void
.end method


.method private synthetic lambda$showProfile$38(Landroid/widget/ProgressBar;Landroid/widget/LinearLayout;)V
    .locals 4
    .param p1, "p"    # Landroid/widget/ProgressBar;
    .param p2, "box"    # Landroid/widget/LinearLayout;

    .line 58
    :try_start_0
    new-instance v0, Ljava/lang/StringBuilder;

    invoke-direct {v0}, Ljava/lang/StringBuilder;-><init>()V

    const-string v1, "/rest/v1/profiles?select=full_name,display_name,email,phone,cpf_last4,account_status&user_id=eq."

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v0

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->userId:Ljava/lang/String;

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v0

    const-string v1, "&limit=1"

    invoke-virtual {v0, v1}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v0

    invoke-virtual {v0}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v0

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->accessToken:Ljava/lang/String;

    invoke-static {v0, v1}, Lbr/com/guerravpn/crediflow/Api;->get(Ljava/lang/String;Ljava/lang/String;)Lbr/com/guerravpn/crediflow/Api$Resp;

    move-result-object v0

    .local v0, "x":Lbr/com/guerravpn/crediflow/Api$Resp;
    invoke-virtual {v0}, Lbr/com/guerravpn/crediflow/Api$Resp;->ok()Z

    move-result v1

    if-eqz v1, :cond_1

    invoke-virtual {v0}, Lbr/com/guerravpn/crediflow/Api$Resp;->array()Lorg/json/JSONArray;

    move-result-object v1

    .local v1, "a":Lorg/json/JSONArray;
    invoke-virtual {v1}, Lorg/json/JSONArray;->length()I

    move-result v2

    if-lez v2, :cond_0

    const/4 v2, 0x0

    invoke-virtual {v1, v2}, Lorg/json/JSONArray;->getJSONObject(I)Lorg/json/JSONObject;

    move-result-object v2

    goto :goto_0

    :cond_0
    new-instance v2, Lorg/json/JSONObject;

    invoke-direct {v2}, Lorg/json/JSONObject;-><init>()V

    .local v2, "q":Lorg/json/JSONObject;
    :goto_0
    new-instance v3, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda1;

    invoke-direct {v3, p0, p1, p2, v2}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda1;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/widget/ProgressBar;Landroid/widget/LinearLayout;Lorg/json/JSONObject;)V

    invoke-virtual {p0, v3}, Lbr/com/guerravpn/crediflow/MainActivityV06;->runOnUiThread(Ljava/lang/Runnable;)V

    .end local v0    # "x":Lbr/com/guerravpn/crediflow/Api$Resp;
    .end local v1    # "a":Lorg/json/JSONArray;
    .end local v2    # "q":Lorg/json/JSONObject;
    goto :goto_1

    .restart local v0    # "x":Lbr/com/guerravpn/crediflow/Api$Resp;
    :cond_1
    new-instance v1, Ljava/lang/Exception;

    invoke-virtual {v0}, Lbr/com/guerravpn/crediflow/Api$Resp;->errorMessage()Ljava/lang/String;

    move-result-object v2

    invoke-direct {v1, v2}, Ljava/lang/Exception;-><init>(Ljava/lang/String;)V

    .end local p1    # "p":Landroid/widget/ProgressBar;
    .end local p2    # "box":Landroid/widget/LinearLayout;
    throw v1
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    .end local v0    # "x":Lbr/com/guerravpn/crediflow/Api$Resp;
    .restart local p1    # "p":Landroid/widget/ProgressBar;
    .restart local p2    # "box":Landroid/widget/LinearLayout;
    :catch_0
    move-exception v0

    .local v0, "ex":Ljava/lang/Exception;
    new-instance v1, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda2;

    invoke-direct {v1, p0, p1, p2, v0}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda2;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/widget/ProgressBar;Landroid/widget/LinearLayout;Ljava/lang/Exception;)V

    invoke-virtual {p0, v1}, Lbr/com/guerravpn/crediflow/MainActivityV06;->runOnUiThread(Ljava/lang/Runnable;)V

    .end local v0    # "ex":Ljava/lang/Exception;
    :goto_1
    return-void
.end method


.method logout()V
    .locals 2

    .line 39
    const/4 v0, 0x0

    iput-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->email:Ljava/lang/String;

    iput-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->role:Ljava/lang/String;

    iput-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->userId:Ljava/lang/String;

    iput-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->refreshToken:Ljava/lang/String;

    iput-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->accessToken:Ljava/lang/String;

    iget-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->prefs:Landroid/content/SharedPreferences;

    invoke-interface {v0}, Landroid/content/SharedPreferences;->edit()Landroid/content/SharedPreferences$Editor;

    move-result-object v0

    const-string v1, "access_token"

    invoke-interface {v0, v1}, Landroid/content/SharedPreferences$Editor;->remove(Ljava/lang/String;)Landroid/content/SharedPreferences$Editor;

    move-result-object v0

    const-string v1, "refresh_token"

    invoke-interface {v0, v1}, Landroid/content/SharedPreferences$Editor;->remove(Ljava/lang/String;)Landroid/content/SharedPreferences$Editor;

    move-result-object v0

    const-string v1, "user_id"

    invoke-interface {v0, v1}, Landroid/content/SharedPreferences$Editor;->remove(Ljava/lang/String;)Landroid/content/SharedPreferences$Editor;

    move-result-object v0

    const-string v1, "role"

    invoke-interface {v0, v1}, Landroid/content/SharedPreferences$Editor;->remove(Ljava/lang/String;)Landroid/content/SharedPreferences$Editor;

    move-result-object v0

    const-string v1, "email"

    invoke-interface {v0, v1}, Landroid/content/SharedPreferences$Editor;->remove(Ljava/lang/String;)Landroid/content/SharedPreferences$Editor;

    move-result-object v0

    invoke-interface {v0}, Landroid/content/SharedPreferences$Editor;->apply()V

    invoke-virtual {p0}, Lbr/com/guerravpn/crediflow/MainActivityV06;->showWelcome()V

    return-void
.end method


.method protected onCreate(Landroid/os/Bundle;)V
    .locals 3
    .param p1, "b"    # Landroid/os/Bundle;

    .line 36
    invoke-super {p0, p1}, Landroid/app/Activity;->onCreate(Landroid/os/Bundle;)V

    invoke-virtual {p0}, Lbr/com/guerravpn/crediflow/MainActivityV06;->getWindow()Landroid/view/Window;

    move-result-object v0

    .local v0, "w":Landroid/view/Window;
    sget v1, Lbr/com/guerravpn/crediflow/Ui;->NAVY:I

    invoke-virtual {v0, v1}, Landroid/view/Window;->setStatusBarColor(I)V

    sget v1, Lbr/com/guerravpn/crediflow/Ui;->NAVY:I

    invoke-virtual {v0, v1}, Landroid/view/Window;->setNavigationBarColor(I)V

    new-instance v1, Lbr/com/guerravpn/crediflow/Ui;

    invoke-direct {v1, p0}, Lbr/com/guerravpn/crediflow/Ui;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;)V

    iput-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v1, "crediflow"

    const/4 v2, 0x0

    invoke-virtual {p0, v1, v2}, Lbr/com/guerravpn/crediflow/MainActivityV06;->getSharedPreferences(Ljava/lang/String;I)Landroid/content/SharedPreferences;

    move-result-object v1

    iput-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->prefs:Landroid/content/SharedPreferences;

    invoke-virtual {p0}, Lbr/com/guerravpn/crediflow/MainActivityV06;->load()V

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->accessToken:Ljava/lang/String;

    if-eqz v1, :cond_1

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->accessToken:Ljava/lang/String;

    invoke-virtual {v1}, Ljava/lang/String;->isEmpty()Z

    move-result v1

    if-nez v1, :cond_1

    const-string v1, "admin"

    iget-object v2, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->role:Ljava/lang/String;

    invoke-virtual {v1, v2}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v1

    if-eqz v1, :cond_0

    new-instance v1, Lbr/com/guerravpn/crediflow/AdminUi;

    invoke-direct {v1, p0}, Lbr/com/guerravpn/crediflow/AdminUi;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;)V

    invoke-virtual {v1}, Lbr/com/guerravpn/crediflow/AdminUi;->show()V

    goto :goto_0

    :cond_0
    invoke-virtual {p0}, Lbr/com/guerravpn/crediflow/MainActivityV06;->showHome()V

    goto :goto_0

    :cond_1
    invoke-virtual {p0}, Lbr/com/guerravpn/crediflow/MainActivityV06;->showWelcome()V

    :goto_0
    return-void
.end method


.method showHome()V
    .locals 13

    .line 56
    iget-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    invoke-virtual {v0}, Lbr/com/guerravpn/crediflow/Ui;->page()Landroid/widget/LinearLayout;

    move-result-object v0

    .local v0, "r":Landroid/widget/LinearLayout;
    iget-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    invoke-virtual {v1, v0}, Lbr/com/guerravpn/crediflow/Ui;->logo(Landroid/widget/LinearLayout;)V

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const/16 v2, 0x12

    invoke-virtual {v1, v0, v2}, Lbr/com/guerravpn/crediflow/Ui;->spacer(Landroid/widget/LinearLayout;I)V

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v2, "Minha conta"

    const/16 v3, 0x1e

    invoke-virtual {v1, v0, v2, v3}, Lbr/com/guerravpn/crediflow/Ui;->title(Landroid/widget/LinearLayout;Ljava/lang/String;I)Landroid/widget/TextView;

    move-result-object v1

    .local v1, "title":Landroid/widget/TextView;
    iget-object v2, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v3, "Carregando seus dados..."

    invoke-virtual {v2, v0, v3}, Lbr/com/guerravpn/crediflow/Ui;->body(Landroid/widget/LinearLayout;Ljava/lang/String;)Landroid/widget/TextView;

    move-result-object v2

    .local v2, "sub":Landroid/widget/TextView;
    iget-object v3, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    invoke-virtual {v3}, Lbr/com/guerravpn/crediflow/Ui;->card()Landroid/widget/LinearLayout;

    move-result-object v3

    .local v3, "box":Landroid/widget/LinearLayout;
    new-instance v4, Landroid/widget/ProgressBar;

    invoke-direct {v4, p0}, Landroid/widget/ProgressBar;-><init>(Landroid/content/Context;)V

    move-object v10, v4

    .local v10, "p":Landroid/widget/ProgressBar;
    invoke-virtual {v3, v10}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    invoke-virtual {v0, v3}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    iget-object v4, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    new-instance v5, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda10;

    invoke-direct {v5, p0}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda10;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;)V

    const-string v6, "Solicitar empr\u00e9stimo"

    invoke-virtual {v4, v6, v5}, Lbr/com/guerravpn/crediflow/Ui;->primary(Ljava/lang/String;Landroid/view/View$OnClickListener;)Landroid/widget/Button;

    move-result-object v4

    invoke-virtual {v0, v4}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    iget-object v4, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    new-instance v5, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda12;

    invoke-direct {v5, p0}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda12;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;)V

    const-string v6, "Meu perfil"

    invoke-virtual {v4, v6, v5}, Lbr/com/guerravpn/crediflow/Ui;->outline(Ljava/lang/String;Landroid/view/View$OnClickListener;)Landroid/widget/Button;

    move-result-object v4

    invoke-virtual {v0, v4}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    iget-object v4, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    new-instance v5, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda13;

    invoke-direct {v5, p0}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda13;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;)V

    const-string v6, "Sair"

    invoke-virtual {v4, v6, v5}, Lbr/com/guerravpn/crediflow/Ui;->outline(Ljava/lang/String;Landroid/view/View$OnClickListener;)Landroid/widget/Button;

    move-result-object v4

    invoke-virtual {v0, v4}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    iget-object v11, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->io:Ljava/util/concurrent/ExecutorService;

    new-instance v12, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda14;

    move-object v4, v12

    move-object v5, p0

    move-object v6, v10

    move-object v7, v1

    move-object v8, v2

    move-object v9, v3

    invoke-direct/range {v4 .. v9}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda14;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/widget/ProgressBar;Landroid/widget/TextView;Landroid/widget/TextView;Landroid/widget/LinearLayout;)V

    invoke-interface {v11, v12}, Ljava/util/concurrent/ExecutorService;->execute(Ljava/lang/Runnable;)V

    return-void
.end method


.method showProfile()V
    .locals 6

    .line 58
    iget-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    invoke-virtual {v0}, Lbr/com/guerravpn/crediflow/Ui;->page()Landroid/widget/LinearLayout;

    move-result-object v0

    .local v0, "r":Landroid/widget/LinearLayout;
    iget-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    new-instance v2, Lbr/com/guerravpn/crediflow/EarlyPaymentUi$$ExternalSyntheticLambda5;

    invoke-direct {v2, p0}, Lbr/com/guerravpn/crediflow/EarlyPaymentUi$$ExternalSyntheticLambda5;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;)V

    invoke-virtual {v1, v0, v2}, Lbr/com/guerravpn/crediflow/Ui;->back(Landroid/widget/LinearLayout;Ljava/lang/Runnable;)V

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v2, "Meu perfil"

    const/16 v3, 0x1e

    invoke-virtual {v1, v0, v2, v3}, Lbr/com/guerravpn/crediflow/Ui;->title(Landroid/widget/LinearLayout;Ljava/lang/String;I)Landroid/widget/TextView;

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    invoke-virtual {v1}, Lbr/com/guerravpn/crediflow/Ui;->card()Landroid/widget/LinearLayout;

    move-result-object v1

    .local v1, "box":Landroid/widget/LinearLayout;
    new-instance v2, Landroid/widget/ProgressBar;

    invoke-direct {v2, p0}, Landroid/widget/ProgressBar;-><init>(Landroid/content/Context;)V

    .local v2, "p":Landroid/widget/ProgressBar;
    invoke-virtual {v1, v2}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    invoke-virtual {v0, v1}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    iget-object v3, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    new-instance v4, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda40;

    invoke-direct {v4, p0}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda40;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;)V

    const-string v5, "Sair da conta"

    invoke-virtual {v3, v5, v4}, Lbr/com/guerravpn/crediflow/Ui;->outline(Ljava/lang/String;Landroid/view/View$OnClickListener;)Landroid/widget/Button;

    move-result-object v3

    invoke-virtual {v0, v3}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    iget-object v3, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->io:Ljava/util/concurrent/ExecutorService;

    new-instance v4, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda41;

    invoke-direct {v4, p0, v2, v1}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda41;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/widget/ProgressBar;Landroid/widget/LinearLayout;)V

    invoke-interface {v3, v4}, Ljava/util/concurrent/ExecutorService;->execute(Ljava/lang/Runnable;)V

    return-void
.end method
