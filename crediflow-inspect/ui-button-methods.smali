.method primary(Ljava/lang/String;Landroid/view/View$OnClickListener;)Landroid/widget/Button;
    .locals 6
    .param p1, "x"    # Ljava/lang/String;
    .param p2, "c"    # Landroid/view/View$OnClickListener;

    .line 36
    sget v2, Lbr/com/guerravpn/crediflow/Ui;->BLUE:I

    sget v3, Lbr/com/guerravpn/crediflow/Ui;->WHITE:I

    const/4 v5, 0x0

    move-object v0, p0

    move-object v1, p1

    move-object v4, p2

    invoke-direct/range {v0 .. v5}, Lbr/com/guerravpn/crediflow/Ui;->button(Ljava/lang/String;IILandroid/view/View$OnClickListener;Z)Landroid/widget/Button;

    move-result-object v0

    return-object v0
.end method

.method outline(Ljava/lang/String;Landroid/view/View$OnClickListener;)Landroid/widget/Button;
    .locals 6
    .param p1, "x"    # Ljava/lang/String;
    .param p2, "c"    # Landroid/view/View$OnClickListener;

    .line 37
    sget v3, Lbr/com/guerravpn/crediflow/Ui;->WHITE:I

    const/4 v5, 0x1

    const/4 v2, 0x0

    move-object v0, p0

    move-object v1, p1

    move-object v4, p2

    invoke-direct/range {v0 .. v5}, Lbr/com/guerravpn/crediflow/Ui;->button(Ljava/lang/String;IILandroid/view/View$OnClickListener;Z)Landroid/widget/Button;

    move-result-object v0

    return-object v0
.end method

.method title(Landroid/widget/LinearLayout;Ljava/lang/String;I)Landroid/widget/TextView;
    .locals 4
    .param p1, "r"    # Landroid/widget/LinearLayout;
    .param p2, "x"    # Ljava/lang/String;
    .param p3, "s"    # I

    .line 28
    sget v0, Lbr/com/guerravpn/crediflow/Ui;->WHITE:I

    const/4 v1, 0x1

    invoke-virtual {p0, p2, p3, v0, v1}, Lbr/com/guerravpn/crediflow/Ui;->text(Ljava/lang/String;IIZ)Landroid/widget/TextView;

    move-result-object v0

    .local v0, "t":Landroid/widget/TextView;
    const/4 v1, 0x3

    invoke-virtual {p0, v1}, Lbr/com/guerravpn/crediflow/Ui;->dp(I)I

    move-result v1

    const/16 v2, 0x8

    invoke-virtual {p0, v2}, Lbr/com/guerravpn/crediflow/Ui;->dp(I)I

    move-result v2

    const/4 v3, 0x0

    invoke-virtual {v0, v3, v1, v3, v2}, Landroid/widget/TextView;->setPadding(IIII)V

    invoke-virtual {p1, v0}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    return-object v0
.end method

.method body(Landroid/widget/LinearLayout;Ljava/lang/String;)Landroid/widget/TextView;
    .locals 4
    .param p1, "r"    # Landroid/widget/LinearLayout;
    .param p2, "x"    # Ljava/lang/String;

    .line 29
    sget v0, Lbr/com/guerravpn/crediflow/Ui;->MUTED:I

    const/16 v1, 0x10

    const/4 v2, 0x0

    invoke-virtual {p0, p2, v1, v0, v2}, Lbr/com/guerravpn/crediflow/Ui;->text(Ljava/lang/String;IIZ)Landroid/widget/TextView;

    move-result-object v0

    .local v0, "t":Landroid/widget/TextView;
    const/4 v1, 0x0

    const v3, 0x3f970a3d    # 1.18f

    invoke-virtual {v0, v1, v3}, Landroid/widget/TextView;->setLineSpacing(FF)V

    const/16 v1, 0x9

    invoke-virtual {p0, v1}, Lbr/com/guerravpn/crediflow/Ui;->dp(I)I

    move-result v1

    invoke-virtual {v0, v2, v2, v2, v1}, Landroid/widget/TextView;->setPadding(IIII)V

    invoke-virtual {p1, v0}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    return-object v0
.end method
