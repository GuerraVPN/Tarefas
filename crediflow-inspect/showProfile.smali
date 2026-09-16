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
