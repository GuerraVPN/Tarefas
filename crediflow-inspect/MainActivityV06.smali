.class public Lbr/com/guerravpn/crediflow/MainActivityV06;
.super Landroid/app/Activity;
.source "MainActivityV06.java"


# static fields
.field static final PICK_BACK:I = 0xca

.field static final PICK_EARLY_PROOF:I = 0xcc

.field static final PICK_FRONT:I = 0xc9

.field static final PICK_PAY:I = 0xcb


# instance fields
.field accessToken:Ljava/lang/String;

.field earlyPaymentUi:Lbr/com/guerravpn/crediflow/EarlyPaymentUi;

.field email:Ljava/lang/String;

.field final io:Ljava/util/concurrent/ExecutorService;

.field pendingEmail:Ljava/lang/String;

.field pendingId:Ljava/lang/String;

.field pendingSecret:Ljava/lang/String;

.field prefs:Landroid/content/SharedPreferences;

.field refreshToken:Ljava/lang/String;

.field role:Ljava/lang/String;

.field u:Lbr/com/guerravpn/crediflow/Ui;

.field userId:Ljava/lang/String;


# direct methods
.method public static synthetic $r8$lambda$1NmUJ_BZMnNRnCJs4TDTlthwnCo(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/widget/Button;Landroid/widget/TextView;Ljava/lang/Exception;)V
    .locals 0

    invoke-direct {p0, p1, p2, p3}, Lbr/com/guerravpn/crediflow/MainActivityV06;->lambda$showRegister$10(Landroid/widget/Button;Landroid/widget/TextView;Ljava/lang/Exception;)V

    return-void
.end method

.method public static synthetic $r8$lambda$3s0aSNJZvCcT7E_9JGnL4E7u_q8(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/view/View;)V
    .locals 0

    invoke-direct {p0, p1}, Lbr/com/guerravpn/crediflow/MainActivityV06;->lambda$showStatus$16(Landroid/view/View;)V

    return-void
.end method

.method public static synthetic $r8$lambda$4bmLR6YyoGf0FN1C9-mpNaQ-qQ8(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/widget/CheckBox;Landroid/widget/TextView;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/Button;Landroid/view/View;)V
    .locals 0

    invoke-direct/range {p0 .. p18}, Lbr/com/guerravpn/crediflow/MainActivityV06;->lambda$showRegister$12(Landroid/widget/CheckBox;Landroid/widget/TextView;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/Button;Landroid/view/View;)V

    return-void
.end method

.method public static synthetic $r8$lambda$5WOI5mJdADcXpWBFFzI5XxSsPXw(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/view/View;)V
    .locals 0

    invoke-direct {p0, p1}, Lbr/com/guerravpn/crediflow/MainActivityV06;->lambda$showWelcome$0(Landroid/view/View;)V

    return-void
.end method

.method public static synthetic $r8$lambda$6UEjUOQv9jE9rIBnWde2Yh93E0o(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/view/View;)V
    .locals 0

    invoke-direct {p0, p1}, Lbr/com/guerravpn/crediflow/MainActivityV06;->lambda$showProfile$35(Landroid/view/View;)V

    return-void
.end method

.method public static synthetic $r8$lambda$9-l19FYqP5-5imdFBk3rlpB28LI(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/view/View;)V
    .locals 0

    invoke-direct {p0, p1}, Lbr/com/guerravpn/crediflow/MainActivityV06;->lambda$showStatus$14(Landroid/view/View;)V

    return-void
.end method

.method public static synthetic $r8$lambda$95OrRxunjbP4bYJ81pfAWdq0Ymw(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/view/View;)V
    .locals 0

    invoke-direct {p0, p1}, Lbr/com/guerravpn/crediflow/MainActivityV06;->lambda$showStatus$13(Landroid/view/View;)V

    return-void
.end method

.method public static synthetic $r8$lambda$Ac85AOKCY5vm1BovkvKCh9KnQZQ(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/view/View;)V
    .locals 0

    invoke-direct {p0, p1}, Lbr/com/guerravpn/crediflow/MainActivityV06;->lambda$showHome$29(Landroid/view/View;)V

    return-void
.end method

.method public static synthetic $r8$lambda$BRh8qSj9CH7993JrtJzU9uki_IQ(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/widget/EditText;Landroid/widget/TextView;Landroid/widget/Button;Landroid/view/View;)V
    .locals 0

    invoke-direct {p0, p1, p2, p3, p4}, Lbr/com/guerravpn/crediflow/MainActivityV06;->lambda$showActivation$24(Landroid/widget/EditText;Landroid/widget/TextView;Landroid/widget/Button;Landroid/view/View;)V

    return-void
.end method

.method public static synthetic $r8$lambda$CT2nQo5vefXnWuWxk9Qo0sazmPA(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/view/View;)V
    .locals 0

    invoke-direct {p0, p1}, Lbr/com/guerravpn/crediflow/MainActivityV06;->lambda$showWelcome$1(Landroid/view/View;)V

    return-void
.end method

.method public static synthetic $r8$lambda$E7EP5OOJF9uDbGkabvcjMxilD-U(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/view/View;)V
    .locals 0

    invoke-direct {p0, p1}, Lbr/com/guerravpn/crediflow/MainActivityV06;->lambda$showWelcome$2(Landroid/view/View;)V

    return-void
.end method

.method public static synthetic $r8$lambda$FRmM2ZWYOlKn4WNEL3Bwa_mna1A(Lbr/com/guerravpn/crediflow/MainActivityV06;)V
    .locals 0

    invoke-direct {p0}, Lbr/com/guerravpn/crediflow/MainActivityV06;->lambda$onActivityResult$39()V

    return-void
.end method

.method public static synthetic $r8$lambda$GPtqKJhOwg71Fm314O9_Eq1O2zI(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/view/View;)V
    .locals 0

    invoke-direct {p0, p1}, Lbr/com/guerravpn/crediflow/MainActivityV06;->lambda$showTracking$4(Landroid/view/View;)V

    return-void
.end method

.method public static synthetic $r8$lambda$LAHGu4AvsQAL4BJhTbWMGIejRds(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/view/View;)V
    .locals 0

    invoke-direct {p0, p1}, Lbr/com/guerravpn/crediflow/MainActivityV06;->lambda$showStatus$15(Landroid/view/View;)V

    return-void
.end method

.method public static synthetic $r8$lambda$LiDHyisG5NCu5cAiFD9Y6b_RZkU(Lbr/com/guerravpn/crediflow/MainActivityV06;Ljava/lang/Exception;)V
    .locals 0

    invoke-direct {p0, p1}, Lbr/com/guerravpn/crediflow/MainActivityV06;->lambda$onActivityResult$40(Ljava/lang/Exception;)V

    return-void
.end method

.method public static synthetic $r8$lambda$QPYTuTLD1w5W1x6nESYL1-4S7bs(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/content/Intent;Ljava/lang/String;)V
    .locals 0

    invoke-direct {p0, p1, p2}, Lbr/com/guerravpn/crediflow/MainActivityV06;->lambda$onActivityResult$41(Landroid/content/Intent;Ljava/lang/String;)V

    return-void
.end method

.method public static synthetic $r8$lambda$RQntrOKAn6JNcMB7TuaUi7Ex-6w(Lbr/com/guerravpn/crediflow/MainActivityV06;Ljava/lang/String;Landroid/widget/Button;Landroid/widget/TextView;)V
    .locals 0

    invoke-direct {p0, p1, p2, p3}, Lbr/com/guerravpn/crediflow/MainActivityV06;->lambda$showActivation$23(Ljava/lang/String;Landroid/widget/Button;Landroid/widget/TextView;)V

    return-void
.end method

.method public static synthetic $r8$lambda$VMSskC6_zcBM_wmtM9VHuYiIQts(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/view/View;)V
    .locals 0

    invoke-direct {p0, p1}, Lbr/com/guerravpn/crediflow/MainActivityV06;->lambda$renderStatus$20(Landroid/view/View;)V

    return-void
.end method

.method public static synthetic $r8$lambda$WB1D-255KL6oCQBgDIMZGR54B1I(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/widget/ProgressBar;Landroid/widget/LinearLayout;)V
    .locals 0

    invoke-direct {p0, p1, p2}, Lbr/com/guerravpn/crediflow/MainActivityV06;->lambda$showProfile$38(Landroid/widget/ProgressBar;Landroid/widget/LinearLayout;)V

    return-void
.end method

.method public static synthetic $r8$lambda$YBoZ5yF31nd5-ovIoCjQ_KBJrkY(Lbr/com/guerravpn/crediflow/MainActivityV06;Ljava/lang/String;Landroid/widget/Button;Landroid/widget/TextView;)V
    .locals 0

    invoke-direct {p0, p1, p2, p3}, Lbr/com/guerravpn/crediflow/MainActivityV06;->lambda$showPassword$26(Ljava/lang/String;Landroid/widget/Button;Landroid/widget/TextView;)V

    return-void
.end method

.method public static synthetic $r8$lambda$YRIlLZeLNSMNh1FR14kx9JXsofk(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/widget/ProgressBar;Landroid/widget/LinearLayout;Ljava/lang/Exception;)V
    .locals 0

    invoke-direct {p0, p1, p2, p3}, Lbr/com/guerravpn/crediflow/MainActivityV06;->lambda$showProfile$37(Landroid/widget/ProgressBar;Landroid/widget/LinearLayout;Ljava/lang/Exception;)V

    return-void
.end method

.method public static synthetic $r8$lambda$YWzJpXF9Tqb8NIPnhTCHVmLDY3o(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/widget/LinearLayout;Landroid/widget/ProgressBar;Landroid/widget/TextView;)V
    .locals 0

    invoke-direct {p0, p1, p2, p3}, Lbr/com/guerravpn/crediflow/MainActivityV06;->lambda$showStatus$19(Landroid/widget/LinearLayout;Landroid/widget/ProgressBar;Landroid/widget/TextView;)V

    return-void
.end method

.method public static synthetic $r8$lambda$YkHTs97ZexdmDDVPu1r9w-BkaMs(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/TextView;Landroid/widget/Button;Landroid/view/View;)V
    .locals 0

    invoke-direct/range {p0 .. p5}, Lbr/com/guerravpn/crediflow/MainActivityV06;->lambda$showLogin$8(Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/TextView;Landroid/widget/Button;Landroid/view/View;)V

    return-void
.end method

.method public static synthetic $r8$lambda$_y892EDMn1Do5rNGYyfKLXstyJA(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/widget/ProgressBar;Lorg/json/JSONObject;Landroid/widget/TextView;Landroid/widget/TextView;Lorg/json/JSONObject;Lorg/json/JSONArray;Landroid/widget/LinearLayout;)V
    .locals 0

    invoke-direct/range {p0 .. p7}, Lbr/com/guerravpn/crediflow/MainActivityV06;->lambda$showHome$32(Landroid/widget/ProgressBar;Lorg/json/JSONObject;Landroid/widget/TextView;Landroid/widget/TextView;Lorg/json/JSONObject;Lorg/json/JSONArray;Landroid/widget/LinearLayout;)V

    return-void
.end method

.method public static synthetic $r8$lambda$aVkSHiYCqfh0R91smFn9N0OxhyY(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/view/View;)V
    .locals 0

    invoke-direct {p0, p1}, Lbr/com/guerravpn/crediflow/MainActivityV06;->lambda$showHome$28(Landroid/view/View;)V

    return-void
.end method

.method public static synthetic $r8$lambda$ad1jgUE23X5oDFrJMsGSoKQWCC4(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/widget/ProgressBar;Landroid/widget/LinearLayout;Lorg/json/JSONObject;)V
    .locals 0

    invoke-direct {p0, p1, p2, p3}, Lbr/com/guerravpn/crediflow/MainActivityV06;->lambda$showProfile$36(Landroid/widget/ProgressBar;Landroid/widget/LinearLayout;Lorg/json/JSONObject;)V

    return-void
.end method

.method public static synthetic $r8$lambda$bcQoF2qZD3XisOPcETodDCiZlTk(Lbr/com/guerravpn/crediflow/MainActivityV06;Lorg/json/JSONObject;Landroid/widget/Button;)V
    .locals 0

    invoke-direct {p0, p1, p2}, Lbr/com/guerravpn/crediflow/MainActivityV06;->lambda$showLogin$5(Lorg/json/JSONObject;Landroid/widget/Button;)V

    return-void
.end method

.method public static synthetic $r8$lambda$bkb6icb3rRZhe450bXjJvi75vNE(Lbr/com/guerravpn/crediflow/MainActivityV06;Ljava/lang/String;Ljava/lang/String;Landroid/widget/Button;Landroid/widget/TextView;)V
    .locals 0

    invoke-direct {p0, p1, p2, p3, p4}, Lbr/com/guerravpn/crediflow/MainActivityV06;->lambda$showLogin$7(Ljava/lang/String;Ljava/lang/String;Landroid/widget/Button;Landroid/widget/TextView;)V

    return-void
.end method

.method public static synthetic $r8$lambda$dSASh85_WHhjqmz9tlGd45RZwVM(Lbr/com/guerravpn/crediflow/MainActivityV06;Lorg/json/JSONObject;)V
    .locals 0

    invoke-direct {p0, p1}, Lbr/com/guerravpn/crediflow/MainActivityV06;->lambda$showActivation$21(Lorg/json/JSONObject;)V

    return-void
.end method

.method public static synthetic $r8$lambda$dtvy4PzwQTGz0pChk-h19NLmVVU(Lbr/com/guerravpn/crediflow/MainActivityV06;Ljava/lang/String;Ljava/lang/String;Landroid/widget/EditText;)V
    .locals 0

    invoke-direct {p0, p1, p2, p3}, Lbr/com/guerravpn/crediflow/MainActivityV06;->lambda$showRegister$9(Ljava/lang/String;Ljava/lang/String;Landroid/widget/EditText;)V

    return-void
.end method

.method public static synthetic $r8$lambda$f95_tUPByInZarhNgXLfnIiU4Q4(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/view/View;)V
    .locals 0

    invoke-direct {p0, p1}, Lbr/com/guerravpn/crediflow/MainActivityV06;->lambda$showTracking$3(Landroid/view/View;)V

    return-void
.end method

.method public static synthetic $r8$lambda$gu9JKxY27xqgIw8orHWIA1_CUig(Lbr/com/guerravpn/crediflow/MainActivityV06;Lorg/json/JSONObject;Landroid/view/View;)V
    .locals 0

    invoke-direct {p0, p1, p2}, Lbr/com/guerravpn/crediflow/MainActivityV06;->lambda$showHome$31(Lorg/json/JSONObject;Landroid/view/View;)V

    return-void
.end method

.method public static synthetic $r8$lambda$hzEjEz_UOe4X8chJdnBpxBJxpRo(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/widget/ProgressBar;Landroid/widget/TextView;Landroid/widget/TextView;Landroid/widget/LinearLayout;)V
    .locals 0

    invoke-direct {p0, p1, p2, p3, p4}, Lbr/com/guerravpn/crediflow/MainActivityV06;->lambda$showHome$34(Landroid/widget/ProgressBar;Landroid/widget/TextView;Landroid/widget/TextView;Landroid/widget/LinearLayout;)V

    return-void
.end method

.method public static synthetic $r8$lambda$m6cgNx_7pzGpDMS9JmDuizKjmkY(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/widget/Button;Landroid/widget/TextView;Ljava/lang/Exception;)V
    .locals 0

    invoke-direct {p0, p1, p2, p3}, Lbr/com/guerravpn/crediflow/MainActivityV06;->lambda$showLogin$6(Landroid/widget/Button;Landroid/widget/TextView;Ljava/lang/Exception;)V

    return-void
.end method

.method public static synthetic $r8$lambda$oGsE9KyKio8u38vizEsS7geDW24(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/view/View;)V
    .locals 0

    invoke-direct {p0, p1}, Lbr/com/guerravpn/crediflow/MainActivityV06;->lambda$showHome$30(Landroid/view/View;)V

    return-void
.end method

.method public static synthetic $r8$lambda$omLmKoznCpujWFUeCheSTD9dsMg(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/widget/Button;Landroid/widget/TextView;Ljava/lang/Exception;)V
    .locals 0

    invoke-direct {p0, p1, p2, p3}, Lbr/com/guerravpn/crediflow/MainActivityV06;->lambda$showPassword$25(Landroid/widget/Button;Landroid/widget/TextView;Ljava/lang/Exception;)V

    return-void
.end method

.method public static synthetic $r8$lambda$rB6qpU1f1VO0lQ6y3Ayl1sONnSk(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/TextView;Landroid/widget/Button;Landroid/view/View;)V
    .locals 0

    invoke-direct/range {p0 .. p5}, Lbr/com/guerravpn/crediflow/MainActivityV06;->lambda$showPassword$27(Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/TextView;Landroid/widget/Button;Landroid/view/View;)V

    return-void
.end method

.method public static synthetic $r8$lambda$sjsEq3KObxl8t3bRGpHsWHE9698(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/widget/LinearLayout;Landroid/widget/ProgressBar;Lorg/json/JSONObject;)V
    .locals 0

    invoke-direct {p0, p1, p2, p3}, Lbr/com/guerravpn/crediflow/MainActivityV06;->lambda$showStatus$17(Landroid/widget/LinearLayout;Landroid/widget/ProgressBar;Lorg/json/JSONObject;)V

    return-void
.end method

.method public static synthetic $r8$lambda$ssUSp5Wb8Rm_Tiyxf_Aj7wAWz1Y(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/widget/Button;Landroid/widget/TextView;Ljava/lang/Exception;)V
    .locals 0

    invoke-direct {p0, p1, p2, p3}, Lbr/com/guerravpn/crediflow/MainActivityV06;->lambda$showActivation$22(Landroid/widget/Button;Landroid/widget/TextView;Ljava/lang/Exception;)V

    return-void
.end method

.method public static synthetic $r8$lambda$x0e8NxpnK2DOVn3pLPcUfA3u7cQ(Lbr/com/guerravpn/crediflow/MainActivityV06;Lorg/json/JSONObject;Ljava/lang/String;Landroid/widget/EditText;Landroid/widget/Button;Landroid/widget/TextView;)V
    .locals 0

    invoke-direct/range {p0 .. p5}, Lbr/com/guerravpn/crediflow/MainActivityV06;->lambda$showRegister$11(Lorg/json/JSONObject;Ljava/lang/String;Landroid/widget/EditText;Landroid/widget/Button;Landroid/widget/TextView;)V

    return-void
.end method

.method public constructor <init>()V
    .locals 1

    .line 29
    invoke-direct {p0}, Landroid/app/Activity;-><init>()V

    .line 31
    const/4 v0, 0x4

    invoke-static {v0}, Ljava/util/concurrent/Executors;->newFixedThreadPool(I)Ljava/util/concurrent/ExecutorService;

    move-result-object v0

    iput-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->io:Ljava/util/concurrent/ExecutorService;

    return-void
.end method

.method static firstName(Ljava/lang/String;)Ljava/lang/String;
    .locals 2
    .param p0, "x"    # Ljava/lang/String;

    .line 67
    if-eqz p0, :cond_1

    invoke-virtual {p0}, Ljava/lang/String;->trim()Ljava/lang/String;

    move-result-object v0

    invoke-virtual {v0}, Ljava/lang/String;->isEmpty()Z

    move-result v0

    if-eqz v0, :cond_0

    goto :goto_0

    :cond_0
    invoke-virtual {p0}, Ljava/lang/String;->trim()Ljava/lang/String;

    move-result-object v0

    const-string v1, "\\s+"

    invoke-virtual {v0, v1}, Ljava/lang/String;->split(Ljava/lang/String;)[Ljava/lang/String;

    move-result-object v0

    const/4 v1, 0x0

    aget-object v0, v0, v1

    return-object v0

    :cond_1
    :goto_0
    const-string v0, "Cliente"

    return-object v0
.end method

.method static friendly(Ljava/lang/Exception;)Ljava/lang/String;
    .locals 2
    .param p0, "e"    # Ljava/lang/Exception;

    .line 69
    invoke-virtual {p0}, Ljava/lang/Exception;->getMessage()Ljava/lang/String;

    move-result-object v0

    .local v0, "m":Ljava/lang/String;
    if-eqz v0, :cond_12

    invoke-virtual {v0}, Ljava/lang/String;->isEmpty()Z

    move-result v1

    if-eqz v1, :cond_0

    goto/16 :goto_0

    :cond_0
    const-string v1, "Invalid login credentials"

    invoke-virtual {v0, v1}, Ljava/lang/String;->contains(Ljava/lang/CharSequence;)Z

    move-result v1

    if-eqz v1, :cond_1

    const-string v1, "E-mail ou senha incorretos."

    return-object v1

    :cond_1
    const-string v1, "amount_exceeds_available_limit"

    invoke-virtual {v0, v1}, Ljava/lang/String;->contains(Ljava/lang/CharSequence;)Z

    move-result v1

    if-eqz v1, :cond_2

    const-string v1, "O valor ultrapassa o limite dispon\u00edvel."

    return-object v1

    :cond_2
    const-string v1, "required_documents_missing"

    invoke-virtual {v0, v1}, Ljava/lang/String;->contains(Ljava/lang/CharSequence;)Z

    move-result v1

    if-eqz v1, :cond_3

    const-string v1, "Faltam documentos obrigat\u00f3rios."

    return-object v1

    :cond_3
    const-string v1, "application_already_exists"

    invoke-virtual {v0, v1}, Ljava/lang/String;->contains(Ljava/lang/CharSequence;)Z

    move-result v1

    if-eqz v1, :cond_4

    const-string v1, "J\u00e1 existe um cadastro para esses dados."

    return-object v1

    :cond_4
    const-string v1, "application_closed"

    invoke-virtual {v0, v1}, Ljava/lang/String;->contains(Ljava/lang/CharSequence;)Z

    move-result v1

    if-eqz v1, :cond_5

    const-string v1, "Este cadastro est\u00e1 encerrado e n\u00e3o pode mais ser alterado por essa an\u00e1lise."

    return-object v1

    :cond_5
    const-string v1, "application_already_provisioned"

    invoke-virtual {v0, v1}, Ljava/lang/String;->contains(Ljava/lang/CharSequence;)Z

    move-result v1

    if-eqz v1, :cond_6

    const-string v1, "A conta j\u00e1 foi criada. Para alterar as condi\u00e7\u00f5es, use Atualizar condi\u00e7\u00f5es."

    return-object v1

    :cond_6
    const-string v1, "first_due_date_in_past"

    invoke-virtual {v0, v1}, Ljava/lang/String;->contains(Ljava/lang/CharSequence;)Z

    move-result v1

    if-eqz v1, :cond_7

    const-string v1, "A primeira parcela n\u00e3o pode estar no passado."

    return-object v1

    :cond_7
    const-string v1, "first_due_date_too_far"

    invoke-virtual {v0, v1}, Ljava/lang/String;->contains(Ljava/lang/CharSequence;)Z

    move-result v1

    if-eqz v1, :cond_8

    const-string v1, "A primeira parcela n\u00e3o pode passar de 1 m\u00eas a partir de hoje."

    return-object v1

    :cond_8
    const-string v1, "invalid_first_due_date"

    invoke-virtual {v0, v1}, Ljava/lang/String;->contains(Ljava/lang/CharSequence;)Z

    move-result v1

    if-eqz v1, :cond_9

    const-string v1, "Escolha uma data v\u00e1lida para a primeira parcela."

    return-object v1

    :cond_9
    const-string v1, "early_payment_already_pending"

    invoke-virtual {v0, v1}, Ljava/lang/String;->contains(Ljava/lang/CharSequence;)Z

    move-result v1

    if-eqz v1, :cond_a

    const-string v1, "J\u00e1 existe um comprovante aguardando confer\u00eancia do Admin."

    return-object v1

    :cond_a
    const-string v1, "repayment_pix_not_configured"

    invoke-virtual {v0, v1}, Ljava/lang/String;->contains(Ljava/lang/CharSequence;)Z

    move-result v1

    if-eqz v1, :cond_b

    const-string v1, "A chave Pix de pagamento ainda n\u00e3o foi configurada."

    return-object v1

    :cond_b
    const-string v1, "unsupported_proof_type"

    invoke-virtual {v0, v1}, Ljava/lang/String;->contains(Ljava/lang/CharSequence;)Z

    move-result v1

    if-eqz v1, :cond_c

    const-string v1, "Envie o comprovante em PDF, JPG, PNG ou WEBP."

    return-object v1

    :cond_c
    const-string v1, "proof_too_large"

    invoke-virtual {v0, v1}, Ljava/lang/String;->contains(Ljava/lang/CharSequence;)Z

    move-result v1

    if-eqz v1, :cond_d

    const-string v1, "O comprovante precisa ter no m\u00e1ximo 10 MB."

    return-object v1

    :cond_d
    const-string v1, "proof_upload_failed"

    invoke-virtual {v0, v1}, Ljava/lang/String;->contains(Ljava/lang/CharSequence;)Z

    move-result v1

    if-eqz v1, :cond_e

    const-string v1, "N\u00e3o foi poss\u00edvel enviar o comprovante. Tente novamente."

    return-object v1

    :cond_e
    const-string v1, "loan_not_payoff_eligible"

    invoke-virtual {v0, v1}, Ljava/lang/String;->contains(Ljava/lang/CharSequence;)Z

    move-result v1

    if-eqz v1, :cond_f

    const-string v1, "Este empr\u00e9stimo n\u00e3o pode ser quitado antecipadamente neste momento."

    return-object v1

    :cond_f
    const-string v1, "nothing_to_pay"

    invoke-virtual {v0, v1}, Ljava/lang/String;->contains(Ljava/lang/CharSequence;)Z

    move-result v1

    if-eqz v1, :cond_10

    const-string v1, "N\u00e3o h\u00e1 saldo pendente para quitar."

    return-object v1

    :cond_10
    const-string v1, "rejection_reason_required"

    invoke-virtual {v0, v1}, Ljava/lang/String;->contains(Ljava/lang/CharSequence;)Z

    move-result v1

    if-eqz v1, :cond_11

    const-string v1, "Informe o motivo para devolver o comprovante ao cliente."

    return-object v1

    :cond_11
    return-object v0

    :cond_12
    :goto_0
    const-string v1, "N\u00e3o foi poss\u00edvel concluir. Tente novamente."

    return-object v1
.end method

.method private synthetic lambda$onActivityResult$39()V
    .locals 2

    .line 63
    const-string v0, "Documento enviado."

    const/4 v1, 0x0

    invoke-static {p0, v0, v1}, Landroid/widget/Toast;->makeText(Landroid/content/Context;Ljava/lang/CharSequence;I)Landroid/widget/Toast;

    move-result-object v0

    invoke-virtual {v0}, Landroid/widget/Toast;->show()V

    invoke-virtual {p0}, Lbr/com/guerravpn/crediflow/MainActivityV06;->showStatus()V

    return-void
.end method

.method private synthetic lambda$onActivityResult$40(Ljava/lang/Exception;)V
    .locals 2
    .param p1, "ex"    # Ljava/lang/Exception;

    .line 63
    invoke-static {p1}, Lbr/com/guerravpn/crediflow/MainActivityV06;->friendly(Ljava/lang/Exception;)Ljava/lang/String;

    move-result-object v0

    const/4 v1, 0x1

    invoke-static {p0, v0, v1}, Landroid/widget/Toast;->makeText(Landroid/content/Context;Ljava/lang/CharSequence;I)Landroid/widget/Toast;

    move-result-object v0

    invoke-virtual {v0}, Landroid/widget/Toast;->show()V

    return-void
.end method

.method private synthetic lambda$onActivityResult$41(Landroid/content/Intent;Ljava/lang/String;)V
    .locals 6
    .param p1, "data"    # Landroid/content/Intent;
    .param p2, "kind"    # Ljava/lang/String;

    .line 63
    :try_start_0
    invoke-virtual {p0}, Lbr/com/guerravpn/crediflow/MainActivityV06;->getContentResolver()Landroid/content/ContentResolver;

    move-result-object v0

    .local v0, "cr":Landroid/content/ContentResolver;
    invoke-virtual {p1}, Landroid/content/Intent;->getData()Landroid/net/Uri;

    move-result-object v1

    invoke-virtual {v0, v1}, Landroid/content/ContentResolver;->getType(Landroid/net/Uri;)Ljava/lang/String;

    move-result-object v1

    .local v1, "mime":Ljava/lang/String;
    if-nez v1, :cond_0

    const-string v2, "application/octet-stream"

    move-object v1, v2

    :cond_0
    invoke-virtual {p1}, Landroid/content/Intent;->getData()Landroid/net/Uri;

    move-result-object v2

    invoke-virtual {p0, v2}, Lbr/com/guerravpn/crediflow/MainActivityV06;->read(Landroid/net/Uri;)[B

    move-result-object v2

    .local v2, "bytes":[B
    iget-object v3, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->pendingId:Ljava/lang/String;

    iget-object v4, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->pendingSecret:Ljava/lang/String;

    invoke-static {v3, v4, p2, v1, v2}, Lbr/com/guerravpn/crediflow/Api;->uploadApplicationDocument(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;[B)Lbr/com/guerravpn/crediflow/Api$Resp;

    move-result-object v3

    .local v3, "x":Lbr/com/guerravpn/crediflow/Api$Resp;
    invoke-virtual {v3}, Lbr/com/guerravpn/crediflow/Api$Resp;->ok()Z

    move-result v4

    if-eqz v4, :cond_1

    new-instance v4, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda37;

    invoke-direct {v4, p0}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda37;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;)V

    invoke-virtual {p0, v4}, Lbr/com/guerravpn/crediflow/MainActivityV06;->runOnUiThread(Ljava/lang/Runnable;)V

    .end local v0    # "cr":Landroid/content/ContentResolver;
    .end local v1    # "mime":Ljava/lang/String;
    .end local v2    # "bytes":[B
    .end local v3    # "x":Lbr/com/guerravpn/crediflow/Api$Resp;
    goto :goto_0

    .restart local v0    # "cr":Landroid/content/ContentResolver;
    .restart local v1    # "mime":Ljava/lang/String;
    .restart local v2    # "bytes":[B
    .restart local v3    # "x":Lbr/com/guerravpn/crediflow/Api$Resp;
    :cond_1
    new-instance v4, Ljava/lang/Exception;

    invoke-virtual {v3}, Lbr/com/guerravpn/crediflow/Api$Resp;->errorMessage()Ljava/lang/String;

    move-result-object v5

    invoke-direct {v4, v5}, Ljava/lang/Exception;-><init>(Ljava/lang/String;)V

    .end local p1    # "data":Landroid/content/Intent;
    .end local p2    # "kind":Ljava/lang/String;
    throw v4
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    .end local v0    # "cr":Landroid/content/ContentResolver;
    .end local v1    # "mime":Ljava/lang/String;
    .end local v2    # "bytes":[B
    .end local v3    # "x":Lbr/com/guerravpn/crediflow/Api$Resp;
    .restart local p1    # "data":Landroid/content/Intent;
    .restart local p2    # "kind":Ljava/lang/String;
    :catch_0
    move-exception v0

    .local v0, "ex":Ljava/lang/Exception;
    new-instance v1, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda38;

    invoke-direct {v1, p0, v0}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda38;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;Ljava/lang/Exception;)V

    invoke-virtual {p0, v1}, Lbr/com/guerravpn/crediflow/MainActivityV06;->runOnUiThread(Ljava/lang/Runnable;)V

    .end local v0    # "ex":Ljava/lang/Exception;
    :goto_0
    return-void
.end method

.method private synthetic lambda$renderStatus$20(Landroid/view/View;)V
    .locals 0
    .param p1, "v"    # Landroid/view/View;

    .line 51
    invoke-virtual {p0}, Lbr/com/guerravpn/crediflow/MainActivityV06;->showActivation()V

    return-void
.end method

.method private synthetic lambda$showActivation$21(Lorg/json/JSONObject;)V
    .locals 0
    .param p1, "a"    # Lorg/json/JSONObject;

    .line 53
    invoke-virtual {p0, p1}, Lbr/com/guerravpn/crediflow/MainActivityV06;->saveSession(Lorg/json/JSONObject;)V

    invoke-virtual {p0}, Lbr/com/guerravpn/crediflow/MainActivityV06;->showPassword()V

    return-void
.end method

.method private synthetic lambda$showActivation$22(Landroid/widget/Button;Landroid/widget/TextView;Ljava/lang/Exception;)V
    .locals 2
    .param p1, "go"    # Landroid/widget/Button;
    .param p2, "err"    # Landroid/widget/TextView;
    .param p3, "ex"    # Ljava/lang/Exception;

    .line 53
    const/4 v0, 0x0

    const-string v1, "Verificar c\u00f3digo"

    invoke-virtual {p0, p1, v0, v1}, Lbr/com/guerravpn/crediflow/MainActivityV06;->busy(Landroid/widget/Button;ZLjava/lang/String;)V

    invoke-static {p3}, Lbr/com/guerravpn/crediflow/MainActivityV06;->friendly(Ljava/lang/Exception;)Ljava/lang/String;

    move-result-object v0

    invoke-virtual {p2, v0}, Landroid/widget/TextView;->setText(Ljava/lang/CharSequence;)V

    return-void
.end method

.method private synthetic lambda$showActivation$23(Ljava/lang/String;Landroid/widget/Button;Landroid/widget/TextView;)V
    .locals 3
    .param p1, "c"    # Ljava/lang/String;
    .param p2, "go"    # Landroid/widget/Button;
    .param p3, "err"    # Landroid/widget/TextView;

    .line 53
    :try_start_0
    iget-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->pendingEmail:Ljava/lang/String;

    invoke-static {v0, p1}, Lbr/com/guerravpn/crediflow/Api;->verifyEmailOtp(Ljava/lang/String;Ljava/lang/String;)Lbr/com/guerravpn/crediflow/Api$Resp;

    move-result-object v0

    .local v0, "x":Lbr/com/guerravpn/crediflow/Api$Resp;
    invoke-virtual {v0}, Lbr/com/guerravpn/crediflow/Api$Resp;->ok()Z

    move-result v1

    if-eqz v1, :cond_0

    invoke-virtual {v0}, Lbr/com/guerravpn/crediflow/Api$Resp;->object()Lorg/json/JSONObject;

    move-result-object v1

    .local v1, "a":Lorg/json/JSONObject;
    new-instance v2, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda8;

    invoke-direct {v2, p0, v1}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda8;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;Lorg/json/JSONObject;)V

    invoke-virtual {p0, v2}, Lbr/com/guerravpn/crediflow/MainActivityV06;->runOnUiThread(Ljava/lang/Runnable;)V

    .end local v0    # "x":Lbr/com/guerravpn/crediflow/Api$Resp;
    .end local v1    # "a":Lorg/json/JSONObject;
    goto :goto_0

    .restart local v0    # "x":Lbr/com/guerravpn/crediflow/Api$Resp;
    :cond_0
    new-instance v1, Ljava/lang/Exception;

    invoke-virtual {v0}, Lbr/com/guerravpn/crediflow/Api$Resp;->errorMessage()Ljava/lang/String;

    move-result-object v2

    invoke-direct {v1, v2}, Ljava/lang/Exception;-><init>(Ljava/lang/String;)V

    .end local p1    # "c":Ljava/lang/String;
    .end local p2    # "go":Landroid/widget/Button;
    .end local p3    # "err":Landroid/widget/TextView;
    throw v1
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    .end local v0    # "x":Lbr/com/guerravpn/crediflow/Api$Resp;
    .restart local p1    # "c":Ljava/lang/String;
    .restart local p2    # "go":Landroid/widget/Button;
    .restart local p3    # "err":Landroid/widget/TextView;
    :catch_0
    move-exception v0

    .local v0, "ex":Ljava/lang/Exception;
    new-instance v1, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda9;

    invoke-direct {v1, p0, p2, p3, v0}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda9;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/widget/Button;Landroid/widget/TextView;Ljava/lang/Exception;)V

    invoke-virtual {p0, v1}, Lbr/com/guerravpn/crediflow/MainActivityV06;->runOnUiThread(Ljava/lang/Runnable;)V

    .end local v0    # "ex":Ljava/lang/Exception;
    :goto_0
    return-void
.end method

.method private synthetic lambda$showActivation$24(Landroid/widget/EditText;Landroid/widget/TextView;Landroid/widget/Button;Landroid/view/View;)V
    .locals 3
    .param p1, "code"    # Landroid/widget/EditText;
    .param p2, "err"    # Landroid/widget/TextView;
    .param p3, "go"    # Landroid/widget/Button;
    .param p4, "v"    # Landroid/view/View;

    .line 53
    invoke-virtual {p1}, Landroid/widget/EditText;->getText()Landroid/text/Editable;

    move-result-object v0

    invoke-virtual {v0}, Ljava/lang/Object;->toString()Ljava/lang/String;

    move-result-object v0

    invoke-virtual {v0}, Ljava/lang/String;->trim()Ljava/lang/String;

    move-result-object v0

    .local v0, "c":Ljava/lang/String;
    invoke-virtual {v0}, Ljava/lang/String;->length()I

    move-result v1

    const/4 v2, 0x6

    if-ge v1, v2, :cond_0

    const-string v1, "Digite o c\u00f3digo completo."

    invoke-virtual {p2, v1}, Landroid/widget/TextView;->setText(Ljava/lang/CharSequence;)V

    return-void

    :cond_0
    const/4 v1, 0x1

    const-string v2, "Verificando..."

    invoke-virtual {p0, p3, v1, v2}, Lbr/com/guerravpn/crediflow/MainActivityV06;->busy(Landroid/widget/Button;ZLjava/lang/String;)V

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->io:Ljava/util/concurrent/ExecutorService;

    new-instance v2, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda21;

    invoke-direct {v2, p0, v0, p3, p2}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda21;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;Ljava/lang/String;Landroid/widget/Button;Landroid/widget/TextView;)V

    invoke-interface {v1, v2}, Ljava/util/concurrent/ExecutorService;->execute(Ljava/lang/Runnable;)V

    return-void
.end method

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

.method private synthetic lambda$showLogin$5(Lorg/json/JSONObject;Landroid/widget/Button;)V
    .locals 2
    .param p1, "a"    # Lorg/json/JSONObject;
    .param p2, "go"    # Landroid/widget/Button;

    .line 46
    invoke-virtual {p0, p1}, Lbr/com/guerravpn/crediflow/MainActivityV06;->saveSession(Lorg/json/JSONObject;)V

    const/4 v0, 0x0

    const-string v1, "Entrar"

    invoke-virtual {p0, p2, v0, v1}, Lbr/com/guerravpn/crediflow/MainActivityV06;->busy(Landroid/widget/Button;ZLjava/lang/String;)V

    const-string v0, "admin"

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->role:Ljava/lang/String;

    invoke-virtual {v0, v1}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v0

    if-eqz v0, :cond_0

    new-instance v0, Lbr/com/guerravpn/crediflow/AdminUi;

    invoke-direct {v0, p0}, Lbr/com/guerravpn/crediflow/AdminUi;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;)V

    invoke-virtual {v0}, Lbr/com/guerravpn/crediflow/AdminUi;->show()V

    goto :goto_0

    :cond_0
    invoke-virtual {p0}, Lbr/com/guerravpn/crediflow/MainActivityV06;->showHome()V

    :goto_0
    return-void
.end method

.method private synthetic lambda$showLogin$6(Landroid/widget/Button;Landroid/widget/TextView;Ljava/lang/Exception;)V
    .locals 2
    .param p1, "go"    # Landroid/widget/Button;
    .param p2, "err"    # Landroid/widget/TextView;
    .param p3, "ex"    # Ljava/lang/Exception;

    .line 46
    const/4 v0, 0x0

    const-string v1, "Entrar"

    invoke-virtual {p0, p1, v0, v1}, Lbr/com/guerravpn/crediflow/MainActivityV06;->busy(Landroid/widget/Button;ZLjava/lang/String;)V

    invoke-static {p3}, Lbr/com/guerravpn/crediflow/MainActivityV06;->friendly(Ljava/lang/Exception;)Ljava/lang/String;

    move-result-object v0

    invoke-virtual {p2, v0}, Landroid/widget/TextView;->setText(Ljava/lang/CharSequence;)V

    return-void
.end method

.method private synthetic lambda$showLogin$7(Ljava/lang/String;Ljava/lang/String;Landroid/widget/Button;Landroid/widget/TextView;)V
    .locals 3
    .param p1, "e"    # Ljava/lang/String;
    .param p2, "p"    # Ljava/lang/String;
    .param p3, "go"    # Landroid/widget/Button;
    .param p4, "err"    # Landroid/widget/TextView;

    .line 46
    :try_start_0
    invoke-static {p1, p2}, Lbr/com/guerravpn/crediflow/Api;->signIn(Ljava/lang/String;Ljava/lang/String;)Lbr/com/guerravpn/crediflow/Api$Resp;

    move-result-object v0

    .local v0, "x":Lbr/com/guerravpn/crediflow/Api$Resp;
    invoke-virtual {v0}, Lbr/com/guerravpn/crediflow/Api$Resp;->ok()Z

    move-result v1

    if-eqz v1, :cond_0

    invoke-virtual {v0}, Lbr/com/guerravpn/crediflow/Api$Resp;->object()Lorg/json/JSONObject;

    move-result-object v1

    .local v1, "a":Lorg/json/JSONObject;
    new-instance v2, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda19;

    invoke-direct {v2, p0, v1, p3}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda19;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;Lorg/json/JSONObject;Landroid/widget/Button;)V

    invoke-virtual {p0, v2}, Lbr/com/guerravpn/crediflow/MainActivityV06;->runOnUiThread(Ljava/lang/Runnable;)V

    .end local v0    # "x":Lbr/com/guerravpn/crediflow/Api$Resp;
    .end local v1    # "a":Lorg/json/JSONObject;
    goto :goto_0

    .restart local v0    # "x":Lbr/com/guerravpn/crediflow/Api$Resp;
    :cond_0
    new-instance v1, Ljava/lang/Exception;

    invoke-virtual {v0}, Lbr/com/guerravpn/crediflow/Api$Resp;->errorMessage()Ljava/lang/String;

    move-result-object v2

    invoke-direct {v1, v2}, Ljava/lang/Exception;-><init>(Ljava/lang/String;)V

    .end local p1    # "e":Ljava/lang/String;
    .end local p2    # "p":Ljava/lang/String;
    .end local p3    # "go":Landroid/widget/Button;
    .end local p4    # "err":Landroid/widget/TextView;
    throw v1
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    .end local v0    # "x":Lbr/com/guerravpn/crediflow/Api$Resp;
    .restart local p1    # "e":Ljava/lang/String;
    .restart local p2    # "p":Ljava/lang/String;
    .restart local p3    # "go":Landroid/widget/Button;
    .restart local p4    # "err":Landroid/widget/TextView;
    :catch_0
    move-exception v0

    .local v0, "ex":Ljava/lang/Exception;
    new-instance v1, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda20;

    invoke-direct {v1, p0, p3, p4, v0}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda20;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/widget/Button;Landroid/widget/TextView;Ljava/lang/Exception;)V

    invoke-virtual {p0, v1}, Lbr/com/guerravpn/crediflow/MainActivityV06;->runOnUiThread(Ljava/lang/Runnable;)V

    .end local v0    # "ex":Ljava/lang/Exception;
    :goto_0
    return-void
.end method

.method private synthetic lambda$showLogin$8(Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/TextView;Landroid/widget/Button;Landroid/view/View;)V
    .locals 10
    .param p1, "em"    # Landroid/widget/EditText;
    .param p2, "pw"    # Landroid/widget/EditText;
    .param p3, "err"    # Landroid/widget/TextView;
    .param p4, "go"    # Landroid/widget/Button;
    .param p5, "v"    # Landroid/view/View;

    .line 46
    invoke-virtual {p1}, Landroid/widget/EditText;->getText()Landroid/text/Editable;

    move-result-object v0

    invoke-virtual {v0}, Ljava/lang/Object;->toString()Ljava/lang/String;

    move-result-object v0

    invoke-virtual {v0}, Ljava/lang/String;->trim()Ljava/lang/String;

    move-result-object v0

    sget-object v1, Ljava/util/Locale;->ROOT:Ljava/util/Locale;

    invoke-virtual {v0, v1}, Ljava/lang/String;->toLowerCase(Ljava/util/Locale;)Ljava/lang/String;

    move-result-object v0

    .local v0, "e":Ljava/lang/String;
    invoke-virtual {p2}, Landroid/widget/EditText;->getText()Landroid/text/Editable;

    move-result-object v1

    invoke-virtual {v1}, Ljava/lang/Object;->toString()Ljava/lang/String;

    move-result-object v1

    .local v1, "p":Ljava/lang/String;
    invoke-virtual {v0}, Ljava/lang/String;->isEmpty()Z

    move-result v2

    if-nez v2, :cond_1

    invoke-virtual {v1}, Ljava/lang/String;->length()I

    move-result v2

    const/4 v3, 0x6

    if-ge v2, v3, :cond_0

    goto :goto_0

    :cond_0
    const/4 v2, 0x1

    const-string v3, "Entrando..."

    invoke-virtual {p0, p4, v2, v3}, Lbr/com/guerravpn/crediflow/MainActivityV06;->busy(Landroid/widget/Button;ZLjava/lang/String;)V

    iget-object v8, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->io:Ljava/util/concurrent/ExecutorService;

    new-instance v9, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda17;

    move-object v2, v9

    move-object v3, p0

    move-object v4, v0

    move-object v5, v1

    move-object v6, p4

    move-object v7, p3

    invoke-direct/range {v2 .. v7}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda17;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;Ljava/lang/String;Ljava/lang/String;Landroid/widget/Button;Landroid/widget/TextView;)V

    invoke-interface {v8, v9}, Ljava/util/concurrent/ExecutorService;->execute(Ljava/lang/Runnable;)V

    return-void

    :cond_1
    :goto_0
    const-string v2, "Confira e-mail e senha."

    invoke-virtual {p3, v2}, Landroid/widget/TextView;->setText(Ljava/lang/CharSequence;)V

    return-void
.end method

.method private synthetic lambda$showPassword$25(Landroid/widget/Button;Landroid/widget/TextView;Ljava/lang/Exception;)V
    .locals 2
    .param p1, "go"    # Landroid/widget/Button;
    .param p2, "err"    # Landroid/widget/TextView;
    .param p3, "ex"    # Ljava/lang/Exception;

    .line 54
    const/4 v0, 0x0

    const-string v1, "Criar senha e entrar"

    invoke-virtual {p0, p1, v0, v1}, Lbr/com/guerravpn/crediflow/MainActivityV06;->busy(Landroid/widget/Button;ZLjava/lang/String;)V

    invoke-static {p3}, Lbr/com/guerravpn/crediflow/MainActivityV06;->friendly(Ljava/lang/Exception;)Ljava/lang/String;

    move-result-object v0

    invoke-virtual {p2, v0}, Landroid/widget/TextView;->setText(Ljava/lang/CharSequence;)V

    return-void
.end method

.method private synthetic lambda$showPassword$26(Ljava/lang/String;Landroid/widget/Button;Landroid/widget/TextView;)V
    .locals 3
    .param p1, "p"    # Ljava/lang/String;
    .param p2, "go"    # Landroid/widget/Button;
    .param p3, "err"    # Landroid/widget/TextView;

    .line 54
    :try_start_0
    iget-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->accessToken:Ljava/lang/String;

    invoke-static {v0, p1}, Lbr/com/guerravpn/crediflow/Api;->updatePassword(Ljava/lang/String;Ljava/lang/String;)Lbr/com/guerravpn/crediflow/Api$Resp;

    move-result-object v0

    .local v0, "x":Lbr/com/guerravpn/crediflow/Api$Resp;
    invoke-virtual {v0}, Lbr/com/guerravpn/crediflow/Api$Resp;->ok()Z

    move-result v1

    if-eqz v1, :cond_1

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->accessToken:Ljava/lang/String;

    invoke-static {v1}, Lbr/com/guerravpn/crediflow/Api;->completeActivation(Ljava/lang/String;)Lbr/com/guerravpn/crediflow/Api$Resp;

    move-result-object v1

    move-object v0, v1

    invoke-virtual {v0}, Lbr/com/guerravpn/crediflow/Api$Resp;->ok()Z

    move-result v1

    if-eqz v1, :cond_0

    new-instance v1, Lbr/com/guerravpn/crediflow/EarlyPaymentUi$$ExternalSyntheticLambda5;

    invoke-direct {v1, p0}, Lbr/com/guerravpn/crediflow/EarlyPaymentUi$$ExternalSyntheticLambda5;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;)V

    invoke-virtual {p0, v1}, Lbr/com/guerravpn/crediflow/MainActivityV06;->runOnUiThread(Ljava/lang/Runnable;)V

    .end local v0    # "x":Lbr/com/guerravpn/crediflow/Api$Resp;
    goto :goto_1

    .restart local v0    # "x":Lbr/com/guerravpn/crediflow/Api$Resp;
    :cond_0
    new-instance v1, Ljava/lang/Exception;

    invoke-virtual {v0}, Lbr/com/guerravpn/crediflow/Api$Resp;->errorMessage()Ljava/lang/String;

    move-result-object v2

    invoke-direct {v1, v2}, Ljava/lang/Exception;-><init>(Ljava/lang/String;)V

    .end local p1    # "p":Ljava/lang/String;
    .end local p2    # "go":Landroid/widget/Button;
    .end local p3    # "err":Landroid/widget/TextView;
    :goto_0
    throw v1

    .restart local p1    # "p":Ljava/lang/String;
    .restart local p2    # "go":Landroid/widget/Button;
    .restart local p3    # "err":Landroid/widget/TextView;
    :cond_1
    new-instance v1, Ljava/lang/Exception;

    invoke-virtual {v0}, Lbr/com/guerravpn/crediflow/Api$Resp;->errorMessage()Ljava/lang/String;

    move-result-object v2

    invoke-direct {v1, v2}, Ljava/lang/Exception;-><init>(Ljava/lang/String;)V
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    goto :goto_0

    .end local v0    # "x":Lbr/com/guerravpn/crediflow/Api$Resp;
    :catch_0
    move-exception v0

    .local v0, "ex":Ljava/lang/Exception;
    new-instance v1, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda32;

    invoke-direct {v1, p0, p2, p3, v0}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda32;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/widget/Button;Landroid/widget/TextView;Ljava/lang/Exception;)V

    invoke-virtual {p0, v1}, Lbr/com/guerravpn/crediflow/MainActivityV06;->runOnUiThread(Ljava/lang/Runnable;)V

    .end local v0    # "ex":Ljava/lang/Exception;
    :goto_1
    return-void
.end method

.method private synthetic lambda$showPassword$27(Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/TextView;Landroid/widget/Button;Landroid/view/View;)V
    .locals 3
    .param p1, "a"    # Landroid/widget/EditText;
    .param p2, "b"    # Landroid/widget/EditText;
    .param p3, "err"    # Landroid/widget/TextView;
    .param p4, "go"    # Landroid/widget/Button;
    .param p5, "v"    # Landroid/view/View;

    .line 54
    invoke-virtual {p1}, Landroid/widget/EditText;->getText()Landroid/text/Editable;

    move-result-object v0

    invoke-virtual {v0}, Ljava/lang/Object;->toString()Ljava/lang/String;

    move-result-object v0

    .local v0, "p":Ljava/lang/String;
    invoke-virtual {v0}, Ljava/lang/String;->length()I

    move-result v1

    const/16 v2, 0x8

    if-lt v1, v2, :cond_1

    invoke-virtual {p2}, Landroid/widget/EditText;->getText()Landroid/text/Editable;

    move-result-object v1

    invoke-virtual {v1}, Ljava/lang/Object;->toString()Ljava/lang/String;

    move-result-object v1

    invoke-virtual {v0, v1}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v1

    if-nez v1, :cond_0

    goto :goto_0

    :cond_0
    const/4 v1, 0x1

    const-string v2, "Salvando..."

    invoke-virtual {p0, p4, v1, v2}, Lbr/com/guerravpn/crediflow/MainActivityV06;->busy(Landroid/widget/Button;ZLjava/lang/String;)V

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->io:Ljava/util/concurrent/ExecutorService;

    new-instance v2, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda23;

    invoke-direct {v2, p0, v0, p4, p3}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda23;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;Ljava/lang/String;Landroid/widget/Button;Landroid/widget/TextView;)V

    invoke-interface {v1, v2}, Ljava/util/concurrent/ExecutorService;->execute(Ljava/lang/Runnable;)V

    return-void

    :cond_1
    :goto_0
    const-string v1, "Use 8+ caracteres e confirme a mesma senha."

    invoke-virtual {p3, v1}, Landroid/widget/TextView;->setText(Ljava/lang/CharSequence;)V

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

.method private synthetic lambda$showRegister$10(Landroid/widget/Button;Landroid/widget/TextView;Ljava/lang/Exception;)V
    .locals 2
    .param p1, "send"    # Landroid/widget/Button;
    .param p2, "err"    # Landroid/widget/TextView;
    .param p3, "ex"    # Ljava/lang/Exception;

    .line 48
    const/4 v0, 0x0

    const-string v1, "Enviar cadastro"

    invoke-virtual {p0, p1, v0, v1}, Lbr/com/guerravpn/crediflow/MainActivityV06;->busy(Landroid/widget/Button;ZLjava/lang/String;)V

    invoke-static {p3}, Lbr/com/guerravpn/crediflow/MainActivityV06;->friendly(Ljava/lang/Exception;)Ljava/lang/String;

    move-result-object v0

    invoke-virtual {p2, v0}, Landroid/widget/TextView;->setText(Ljava/lang/CharSequence;)V

    return-void
.end method

.method private synthetic lambda$showRegister$11(Lorg/json/JSONObject;Ljava/lang/String;Landroid/widget/EditText;Landroid/widget/Button;Landroid/widget/TextView;)V
    .locals 4
    .param p1, "b"    # Lorg/json/JSONObject;
    .param p2, "secret"    # Ljava/lang/String;
    .param p3, "em"    # Landroid/widget/EditText;
    .param p4, "send"    # Landroid/widget/Button;
    .param p5, "err"    # Landroid/widget/TextView;

    .line 48
    :try_start_0
    invoke-static {p1}, Lbr/com/guerravpn/crediflow/Api;->submitApplication(Lorg/json/JSONObject;)Lbr/com/guerravpn/crediflow/Api$Resp;

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

    if-eqz v2, :cond_0

    const/4 v2, 0x0

    invoke-virtual {v1, v2}, Lorg/json/JSONArray;->getJSONObject(I)Lorg/json/JSONObject;

    move-result-object v2

    const-string v3, "application_id"

    invoke-virtual {v2, v3}, Lorg/json/JSONObject;->optString(Ljava/lang/String;)Ljava/lang/String;

    move-result-object v2

    .local v2, "id":Ljava/lang/String;
    new-instance v3, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda24;

    invoke-direct {v3, p0, v2, p2, p3}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda24;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;Ljava/lang/String;Ljava/lang/String;Landroid/widget/EditText;)V

    invoke-virtual {p0, v3}, Lbr/com/guerravpn/crediflow/MainActivityV06;->runOnUiThread(Ljava/lang/Runnable;)V

    .end local v0    # "x":Lbr/com/guerravpn/crediflow/Api$Resp;
    .end local v1    # "a":Lorg/json/JSONArray;
    .end local v2    # "id":Ljava/lang/String;
    goto :goto_0

    .restart local v0    # "x":Lbr/com/guerravpn/crediflow/Api$Resp;
    .restart local v1    # "a":Lorg/json/JSONArray;
    :cond_0
    new-instance v2, Ljava/lang/Exception;

    const-string v3, "Cadastro sem identifica\u00e7\u00e3o."

    invoke-direct {v2, v3}, Ljava/lang/Exception;-><init>(Ljava/lang/String;)V

    .end local p1    # "b":Lorg/json/JSONObject;
    .end local p2    # "secret":Ljava/lang/String;
    .end local p3    # "em":Landroid/widget/EditText;
    .end local p4    # "send":Landroid/widget/Button;
    .end local p5    # "err":Landroid/widget/TextView;
    throw v2

    .end local v1    # "a":Lorg/json/JSONArray;
    .restart local p1    # "b":Lorg/json/JSONObject;
    .restart local p2    # "secret":Ljava/lang/String;
    .restart local p3    # "em":Landroid/widget/EditText;
    .restart local p4    # "send":Landroid/widget/Button;
    .restart local p5    # "err":Landroid/widget/TextView;
    :cond_1
    new-instance v1, Ljava/lang/Exception;

    invoke-virtual {v0}, Lbr/com/guerravpn/crediflow/Api$Resp;->errorMessage()Ljava/lang/String;

    move-result-object v2

    invoke-direct {v1, v2}, Ljava/lang/Exception;-><init>(Ljava/lang/String;)V

    .end local p1    # "b":Lorg/json/JSONObject;
    .end local p2    # "secret":Ljava/lang/String;
    .end local p3    # "em":Landroid/widget/EditText;
    .end local p4    # "send":Landroid/widget/Button;
    .end local p5    # "err":Landroid/widget/TextView;
    throw v1
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    .end local v0    # "x":Lbr/com/guerravpn/crediflow/Api$Resp;
    .restart local p1    # "b":Lorg/json/JSONObject;
    .restart local p2    # "secret":Ljava/lang/String;
    .restart local p3    # "em":Landroid/widget/EditText;
    .restart local p4    # "send":Landroid/widget/Button;
    .restart local p5    # "err":Landroid/widget/TextView;
    :catch_0
    move-exception v0

    .local v0, "ex":Ljava/lang/Exception;
    new-instance v1, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda25;

    invoke-direct {v1, p0, p4, p5, v0}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda25;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/widget/Button;Landroid/widget/TextView;Ljava/lang/Exception;)V

    invoke-virtual {p0, v1}, Lbr/com/guerravpn/crediflow/MainActivityV06;->runOnUiThread(Ljava/lang/Runnable;)V

    .end local v0    # "ex":Ljava/lang/Exception;
    :goto_0
    return-void
.end method

.method private synthetic lambda$showRegister$12(Landroid/widget/CheckBox;Landroid/widget/TextView;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/Button;Landroid/view/View;)V
    .locals 15
    .param p1, "ok"    # Landroid/widget/CheckBox;
    .param p2, "err"    # Landroid/widget/TextView;
    .param p3, "n"    # Landroid/widget/EditText;
    .param p4, "em"    # Landroid/widget/EditText;
    .param p5, "cpf"    # Landroid/widget/EditText;
    .param p6, "ph"    # Landroid/widget/EditText;
    .param p7, "bd"    # Landroid/widget/EditText;
    .param p8, "addr"    # Landroid/widget/EditText;
    .param p9, "num"    # Landroid/widget/EditText;
    .param p10, "comp"    # Landroid/widget/EditText;
    .param p11, "bairro"    # Landroid/widget/EditText;
    .param p12, "city"    # Landroid/widget/EditText;
    .param p13, "uf"    # Landroid/widget/EditText;
    .param p14, "cep"    # Landroid/widget/EditText;
    .param p15, "job"    # Landroid/widget/EditText;
    .param p16, "inc"    # Landroid/widget/EditText;
    .param p17, "send"    # Landroid/widget/Button;
    .param p18, "v"    # Landroid/view/View;

    .line 48
    move-object v8, p0

    move-object/from16 v9, p2

    invoke-virtual/range {p1 .. p1}, Landroid/widget/CheckBox;->isChecked()Z

    move-result v0

    if-nez v0, :cond_0

    const-string v0, "Confirme a declara\u00e7\u00e3o."

    invoke-virtual {v9, v0}, Landroid/widget/TextView;->setText(Ljava/lang/CharSequence;)V

    return-void

    :cond_0
    invoke-virtual {p0}, Lbr/com/guerravpn/crediflow/MainActivityV06;->randomSecret()Ljava/lang/String;

    move-result-object v10

    .local v10, "secret":Ljava/lang/String;
    :try_start_0
    new-instance v0, Lorg/json/JSONObject;

    invoke-direct {v0}, Lorg/json/JSONObject;-><init>()V

    .local v0, "b":Lorg/json/JSONObject;
    const-string v1, "p_full_name"

    invoke-virtual/range {p3 .. p3}, Landroid/widget/EditText;->getText()Landroid/text/Editable;

    move-result-object v2

    invoke-virtual {v2}, Ljava/lang/Object;->toString()Ljava/lang/String;

    move-result-object v2

    invoke-virtual {v2}, Ljava/lang/String;->trim()Ljava/lang/String;

    move-result-object v2

    invoke-virtual {v0, v1, v2}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    const-string v1, "p_email"

    invoke-virtual/range {p4 .. p4}, Landroid/widget/EditText;->getText()Landroid/text/Editable;

    move-result-object v2

    invoke-virtual {v2}, Ljava/lang/Object;->toString()Ljava/lang/String;

    move-result-object v2

    invoke-virtual {v2}, Ljava/lang/String;->trim()Ljava/lang/String;

    move-result-object v2

    sget-object v3, Ljava/util/Locale;->ROOT:Ljava/util/Locale;

    invoke-virtual {v2, v3}, Ljava/lang/String;->toLowerCase(Ljava/util/Locale;)Ljava/lang/String;

    move-result-object v2

    invoke-virtual {v0, v1, v2}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    const-string v1, "p_cpf"

    invoke-virtual/range {p5 .. p5}, Landroid/widget/EditText;->getText()Landroid/text/Editable;

    move-result-object v2

    invoke-virtual {v2}, Ljava/lang/Object;->toString()Ljava/lang/String;

    move-result-object v2

    invoke-virtual {v0, v1, v2}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    const-string v1, "p_phone"

    invoke-virtual/range {p6 .. p6}, Landroid/widget/EditText;->getText()Landroid/text/Editable;

    move-result-object v2

    invoke-virtual {v2}, Ljava/lang/Object;->toString()Ljava/lang/String;

    move-result-object v2

    invoke-virtual {v0, v1, v2}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    const-string v1, "p_birth_date"

    invoke-virtual/range {p7 .. p7}, Landroid/widget/EditText;->getText()Landroid/text/Editable;

    move-result-object v2

    invoke-virtual {v2}, Ljava/lang/Object;->toString()Ljava/lang/String;

    move-result-object v2

    invoke-virtual {v0, v1, v2}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    const-string v1, "p_address_line"

    invoke-virtual/range {p8 .. p8}, Landroid/widget/EditText;->getText()Landroid/text/Editable;

    move-result-object v2

    invoke-virtual {v2}, Ljava/lang/Object;->toString()Ljava/lang/String;

    move-result-object v2

    invoke-virtual {v0, v1, v2}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    const-string v1, "p_address_number"

    invoke-virtual/range {p9 .. p9}, Landroid/widget/EditText;->getText()Landroid/text/Editable;

    move-result-object v2

    invoke-virtual {v2}, Ljava/lang/Object;->toString()Ljava/lang/String;

    move-result-object v2

    invoke-virtual {v0, v1, v2}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    const-string v1, "p_address_complement"

    invoke-virtual/range {p10 .. p10}, Landroid/widget/EditText;->getText()Landroid/text/Editable;

    move-result-object v2

    invoke-virtual {v2}, Ljava/lang/Object;->toString()Ljava/lang/String;

    move-result-object v2

    invoke-virtual {v0, v1, v2}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    const-string v1, "p_neighborhood"

    invoke-virtual/range {p11 .. p11}, Landroid/widget/EditText;->getText()Landroid/text/Editable;

    move-result-object v2

    invoke-virtual {v2}, Ljava/lang/Object;->toString()Ljava/lang/String;

    move-result-object v2

    invoke-virtual {v0, v1, v2}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    const-string v1, "p_city"

    invoke-virtual/range {p12 .. p12}, Landroid/widget/EditText;->getText()Landroid/text/Editable;

    move-result-object v2

    invoke-virtual {v2}, Ljava/lang/Object;->toString()Ljava/lang/String;

    move-result-object v2

    invoke-virtual {v0, v1, v2}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    const-string v1, "p_state"

    invoke-virtual/range {p13 .. p13}, Landroid/widget/EditText;->getText()Landroid/text/Editable;

    move-result-object v2

    invoke-virtual {v2}, Ljava/lang/Object;->toString()Ljava/lang/String;

    move-result-object v2

    invoke-virtual {v0, v1, v2}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    const-string v1, "p_postal_code"

    invoke-virtual/range {p14 .. p14}, Landroid/widget/EditText;->getText()Landroid/text/Editable;

    move-result-object v2

    invoke-virtual {v2}, Ljava/lang/Object;->toString()Ljava/lang/String;

    move-result-object v2

    invoke-virtual {v0, v1, v2}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    const-string v1, "p_occupation"

    invoke-virtual/range {p15 .. p15}, Landroid/widget/EditText;->getText()Landroid/text/Editable;

    move-result-object v2

    invoke-virtual {v2}, Ljava/lang/Object;->toString()Ljava/lang/String;

    move-result-object v2

    invoke-virtual {v0, v1, v2}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    invoke-virtual/range {p16 .. p16}, Landroid/widget/EditText;->getText()Landroid/text/Editable;

    move-result-object v1

    invoke-virtual {v1}, Ljava/lang/Object;->toString()Ljava/lang/String;

    move-result-object v1

    invoke-virtual {v1}, Ljava/lang/String;->trim()Ljava/lang/String;

    move-result-object v1

    const/16 v2, 0x2c

    const/16 v3, 0x2e

    invoke-virtual {v1, v2, v3}, Ljava/lang/String;->replace(CC)Ljava/lang/String;

    move-result-object v1

    move-object v11, v1

    .local v11, "iv":Ljava/lang/String;
    const-string v1, "p_monthly_income"

    invoke-virtual {v11}, Ljava/lang/String;->isEmpty()Z

    move-result v2

    if-eqz v2, :cond_1

    const-wide/16 v2, 0x0

    goto :goto_0

    :cond_1
    invoke-static {v11}, Ljava/lang/Double;->parseDouble(Ljava/lang/String;)D

    move-result-wide v2

    :goto_0
    invoke-virtual {v0, v1, v2, v3}, Lorg/json/JSONObject;->put(Ljava/lang/String;D)Lorg/json/JSONObject;

    const-string v1, "p_status_secret"

    invoke-virtual {v0, v1, v10}, Lorg/json/JSONObject;->put(Ljava/lang/String;Ljava/lang/Object;)Lorg/json/JSONObject;

    const-string v1, "Enviando..."
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_1

    const/4 v2, 0x1

    move-object/from16 v12, p17

    :try_start_1
    invoke-virtual {p0, v12, v2, v1}, Lbr/com/guerravpn/crediflow/MainActivityV06;->busy(Landroid/widget/Button;ZLjava/lang/String;)V

    iget-object v13, v8, Lbr/com/guerravpn/crediflow/MainActivityV06;->io:Ljava/util/concurrent/ExecutorService;

    new-instance v14, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda6;

    move-object v1, v14

    move-object v2, p0

    move-object v3, v0

    move-object v4, v10

    move-object/from16 v5, p4

    move-object/from16 v6, p17

    move-object/from16 v7, p2

    invoke-direct/range {v1 .. v7}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda6;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;Lorg/json/JSONObject;Ljava/lang/String;Landroid/widget/EditText;Landroid/widget/Button;Landroid/widget/TextView;)V

    invoke-interface {v13, v14}, Ljava/util/concurrent/ExecutorService;->execute(Ljava/lang/Runnable;)V
    :try_end_1
    .catch Ljava/lang/Exception; {:try_start_1 .. :try_end_1} :catch_0

    .end local v0    # "b":Lorg/json/JSONObject;
    .end local v11    # "iv":Ljava/lang/String;
    goto :goto_2

    :catch_0
    move-exception v0

    goto :goto_1

    :catch_1
    move-exception v0

    move-object/from16 v12, p17

    .local v0, "ex":Ljava/lang/Exception;
    :goto_1
    const-string v1, "Confira os dados informados."

    invoke-virtual {v9, v1}, Landroid/widget/TextView;->setText(Ljava/lang/CharSequence;)V

    .end local v0    # "ex":Ljava/lang/Exception;
    :goto_2
    return-void
.end method

.method private synthetic lambda$showRegister$9(Ljava/lang/String;Ljava/lang/String;Landroid/widget/EditText;)V
    .locals 2
    .param p1, "id"    # Ljava/lang/String;
    .param p2, "secret"    # Ljava/lang/String;
    .param p3, "em"    # Landroid/widget/EditText;

    .line 48
    invoke-virtual {p3}, Landroid/widget/EditText;->getText()Landroid/text/Editable;

    move-result-object v0

    invoke-virtual {v0}, Ljava/lang/Object;->toString()Ljava/lang/String;

    move-result-object v0

    invoke-virtual {v0}, Ljava/lang/String;->trim()Ljava/lang/String;

    move-result-object v0

    sget-object v1, Ljava/util/Locale;->ROOT:Ljava/util/Locale;

    invoke-virtual {v0, v1}, Ljava/lang/String;->toLowerCase(Ljava/util/Locale;)Ljava/lang/String;

    move-result-object v0

    invoke-virtual {p0, p1, p2, v0}, Lbr/com/guerravpn/crediflow/MainActivityV06;->savePending(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V

    invoke-virtual {p0}, Lbr/com/guerravpn/crediflow/MainActivityV06;->showStatus()V

    return-void
.end method

.method private synthetic lambda$showStatus$13(Landroid/view/View;)V
    .locals 0
    .param p1, "v"    # Landroid/view/View;

    .line 50
    invoke-virtual {p0}, Lbr/com/guerravpn/crediflow/MainActivityV06;->showStatus()V

    return-void
.end method

.method private synthetic lambda$showStatus$14(Landroid/view/View;)V
    .locals 2
    .param p1, "v"    # Landroid/view/View;

    .line 50
    const/16 v0, 0xc9

    const-string v1, "image/*"

    invoke-virtual {p0, v0, v1}, Lbr/com/guerravpn/crediflow/MainActivityV06;->pick(ILjava/lang/String;)V

    return-void
.end method

.method private synthetic lambda$showStatus$15(Landroid/view/View;)V
    .locals 2
    .param p1, "v"    # Landroid/view/View;

    .line 50
    const/16 v0, 0xca

    const-string v1, "image/*"

    invoke-virtual {p0, v0, v1}, Lbr/com/guerravpn/crediflow/MainActivityV06;->pick(ILjava/lang/String;)V

    return-void
.end method

.method private synthetic lambda$showStatus$16(Landroid/view/View;)V
    .locals 2
    .param p1, "v"    # Landroid/view/View;

    .line 50
    const/16 v0, 0xcb

    const-string v1, "*/*"

    invoke-virtual {p0, v0, v1}, Lbr/com/guerravpn/crediflow/MainActivityV06;->pick(ILjava/lang/String;)V

    return-void
.end method

.method private synthetic lambda$showStatus$17(Landroid/widget/LinearLayout;Landroid/widget/ProgressBar;Lorg/json/JSONObject;)V
    .locals 0
    .param p1, "box"    # Landroid/widget/LinearLayout;
    .param p2, "p"    # Landroid/widget/ProgressBar;
    .param p3, "s"    # Lorg/json/JSONObject;

    .line 50
    invoke-virtual {p0, p1, p2, p3}, Lbr/com/guerravpn/crediflow/MainActivityV06;->renderStatus(Landroid/widget/LinearLayout;Landroid/widget/ProgressBar;Lorg/json/JSONObject;)V

    return-void
.end method

.method static synthetic lambda$showStatus$18(Landroid/widget/ProgressBar;Landroid/widget/TextView;Ljava/lang/Exception;)V
    .locals 1
    .param p0, "p"    # Landroid/widget/ProgressBar;
    .param p1, "err"    # Landroid/widget/TextView;
    .param p2, "ex"    # Ljava/lang/Exception;

    .line 50
    const/16 v0, 0x8

    invoke-virtual {p0, v0}, Landroid/widget/ProgressBar;->setVisibility(I)V

    invoke-static {p2}, Lbr/com/guerravpn/crediflow/MainActivityV06;->friendly(Ljava/lang/Exception;)Ljava/lang/String;

    move-result-object v0

    invoke-virtual {p1, v0}, Landroid/widget/TextView;->setText(Ljava/lang/CharSequence;)V

    return-void
.end method

.method private synthetic lambda$showStatus$19(Landroid/widget/LinearLayout;Landroid/widget/ProgressBar;Landroid/widget/TextView;)V
    .locals 4
    .param p1, "box"    # Landroid/widget/LinearLayout;
    .param p2, "p"    # Landroid/widget/ProgressBar;
    .param p3, "err"    # Landroid/widget/TextView;

    .line 50
    :try_start_0
    iget-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->pendingId:Ljava/lang/String;

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->pendingSecret:Ljava/lang/String;

    invoke-static {v0, v1}, Lbr/com/guerravpn/crediflow/Api;->checkApplication(Ljava/lang/String;Ljava/lang/String;)Lbr/com/guerravpn/crediflow/Api$Resp;

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

    if-eqz v2, :cond_0

    const/4 v2, 0x0

    invoke-virtual {v1, v2}, Lorg/json/JSONArray;->getJSONObject(I)Lorg/json/JSONObject;

    move-result-object v2

    .local v2, "s":Lorg/json/JSONObject;
    new-instance v3, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda15;

    invoke-direct {v3, p0, p1, p2, v2}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda15;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/widget/LinearLayout;Landroid/widget/ProgressBar;Lorg/json/JSONObject;)V

    invoke-virtual {p0, v3}, Lbr/com/guerravpn/crediflow/MainActivityV06;->runOnUiThread(Ljava/lang/Runnable;)V

    .end local v0    # "x":Lbr/com/guerravpn/crediflow/Api$Resp;
    .end local v1    # "a":Lorg/json/JSONArray;
    .end local v2    # "s":Lorg/json/JSONObject;
    goto :goto_0

    .restart local v0    # "x":Lbr/com/guerravpn/crediflow/Api$Resp;
    .restart local v1    # "a":Lorg/json/JSONArray;
    :cond_0
    new-instance v2, Ljava/lang/Exception;

    const-string v3, "Cadastro n\u00e3o encontrado."

    invoke-direct {v2, v3}, Ljava/lang/Exception;-><init>(Ljava/lang/String;)V

    .end local p1    # "box":Landroid/widget/LinearLayout;
    .end local p2    # "p":Landroid/widget/ProgressBar;
    .end local p3    # "err":Landroid/widget/TextView;
    throw v2

    .end local v1    # "a":Lorg/json/JSONArray;
    .restart local p1    # "box":Landroid/widget/LinearLayout;
    .restart local p2    # "p":Landroid/widget/ProgressBar;
    .restart local p3    # "err":Landroid/widget/TextView;
    :cond_1
    new-instance v1, Ljava/lang/Exception;

    invoke-virtual {v0}, Lbr/com/guerravpn/crediflow/Api$Resp;->errorMessage()Ljava/lang/String;

    move-result-object v2

    invoke-direct {v1, v2}, Ljava/lang/Exception;-><init>(Ljava/lang/String;)V

    .end local p1    # "box":Landroid/widget/LinearLayout;
    .end local p2    # "p":Landroid/widget/ProgressBar;
    .end local p3    # "err":Landroid/widget/TextView;
    throw v1
    :try_end_0
    .catch Ljava/lang/Exception; {:try_start_0 .. :try_end_0} :catch_0

    .end local v0    # "x":Lbr/com/guerravpn/crediflow/Api$Resp;
    .restart local p1    # "box":Landroid/widget/LinearLayout;
    .restart local p2    # "p":Landroid/widget/ProgressBar;
    .restart local p3    # "err":Landroid/widget/TextView;
    :catch_0
    move-exception v0

    .local v0, "ex":Ljava/lang/Exception;
    new-instance v1, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda16;

    invoke-direct {v1, p2, p3, v0}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda16;-><init>(Landroid/widget/ProgressBar;Landroid/widget/TextView;Ljava/lang/Exception;)V

    invoke-virtual {p0, v1}, Lbr/com/guerravpn/crediflow/MainActivityV06;->runOnUiThread(Ljava/lang/Runnable;)V

    .end local v0    # "ex":Ljava/lang/Exception;
    :goto_0
    return-void
.end method

.method private synthetic lambda$showTracking$3(Landroid/view/View;)V
    .locals 0
    .param p1, "v"    # Landroid/view/View;

    .line 44
    invoke-virtual {p0}, Lbr/com/guerravpn/crediflow/MainActivityV06;->showRegister()V

    return-void
.end method

.method private synthetic lambda$showTracking$4(Landroid/view/View;)V
    .locals 0
    .param p1, "v"    # Landroid/view/View;

    .line 44
    invoke-virtual {p0}, Lbr/com/guerravpn/crediflow/MainActivityV06;->showLogin()V

    return-void
.end method

.method private synthetic lambda$showWelcome$0(Landroid/view/View;)V
    .locals 0
    .param p1, "v"    # Landroid/view/View;

    .line 43
    invoke-virtual {p0}, Lbr/com/guerravpn/crediflow/MainActivityV06;->showRegister()V

    return-void
.end method

.method private synthetic lambda$showWelcome$1(Landroid/view/View;)V
    .locals 0
    .param p1, "v"    # Landroid/view/View;

    .line 43
    invoke-virtual {p0}, Lbr/com/guerravpn/crediflow/MainActivityV06;->showLogin()V

    return-void
.end method

.method private synthetic lambda$showWelcome$2(Landroid/view/View;)V
    .locals 0
    .param p1, "v"    # Landroid/view/View;

    .line 43
    invoke-virtual {p0}, Lbr/com/guerravpn/crediflow/MainActivityV06;->showTracking()V

    return-void
.end method

.method static money(D)Ljava/lang/String;
    .locals 3
    .param p0, "v"    # D

    .line 67
    new-instance v0, Ljava/util/Locale;

    const-string v1, "pt"

    const-string v2, "BR"

    invoke-direct {v0, v1, v2}, Ljava/util/Locale;-><init>(Ljava/lang/String;Ljava/lang/String;)V

    invoke-static {p0, p1}, Ljava/lang/Double;->valueOf(D)Ljava/lang/Double;

    move-result-object v1

    filled-new-array {v1}, [Ljava/lang/Object;

    move-result-object v1

    const-string v2, "R$ %,.2f"

    invoke-static {v0, v2, v1}, Ljava/lang/String;->format(Ljava/util/Locale;Ljava/lang/String;[Ljava/lang/Object;)Ljava/lang/String;

    move-result-object v0

    return-object v0
.end method

.method static percent(D)Ljava/lang/String;
    .locals 3
    .param p0, "v"    # D

    .line 67
    new-instance v0, Ljava/util/Locale;

    const-string v1, "pt"

    const-string v2, "BR"

    invoke-direct {v0, v1, v2}, Ljava/util/Locale;-><init>(Ljava/lang/String;Ljava/lang/String;)V

    const-wide/high16 v1, 0x4059000000000000L    # 100.0

    mul-double/2addr v1, p0

    invoke-static {v1, v2}, Ljava/lang/Double;->valueOf(D)Ljava/lang/Double;

    move-result-object v1

    filled-new-array {v1}, [Ljava/lang/Object;

    move-result-object v1

    const-string v2, "%.2f%%"

    invoke-static {v0, v2, v1}, Ljava/lang/String;->format(Ljava/util/Locale;Ljava/lang/String;[Ljava/lang/Object;)Ljava/lang/String;

    move-result-object v0

    return-object v0
.end method

.method static statusColor(Ljava/lang/String;)I
    .locals 1
    .param p0, "s"    # Ljava/lang/String;

    .line 68
    const-string v0, "approved"

    invoke-virtual {v0, p0}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v0

    if-nez v0, :cond_3

    const-string v0, "active"

    invoke-virtual {v0, p0}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v0

    if-nez v0, :cond_3

    const-string v0, "paid"

    invoke-virtual {v0, p0}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v0

    if-eqz v0, :cond_0

    goto :goto_1

    :cond_0
    const-string v0, "rejected"

    invoke-virtual {v0, p0}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v0

    if-nez v0, :cond_2

    const-string v0, "cancelled"

    invoke-virtual {v0, p0}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v0

    if-nez v0, :cond_2

    const-string v0, "late"

    invoke-virtual {v0, p0}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v0

    if-eqz v0, :cond_1

    goto :goto_0

    :cond_1
    sget v0, Lbr/com/guerravpn/crediflow/Ui;->AMBER:I

    return v0

    :cond_2
    :goto_0
    sget v0, Lbr/com/guerravpn/crediflow/Ui;->RED:I

    return v0

    :cond_3
    :goto_1
    sget v0, Lbr/com/guerravpn/crediflow/Ui;->GREEN:I

    return v0
.end method

.method static statusPt(Ljava/lang/String;)Ljava/lang/String;
    .locals 2
    .param p0, "s"    # Ljava/lang/String;

    .line 68
    if-nez p0, :cond_0

    const-string v0, "-"

    return-object v0

    :cond_0
    invoke-virtual {p0}, Ljava/lang/String;->hashCode()I

    move-result v0

    sparse-switch v0, :sswitch_data_0

    :cond_1
    goto/16 :goto_0

    :sswitch_0
    const-string v0, "activation_sent"

    invoke-virtual {p0, v0}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v0

    if-eqz v0, :cond_1

    const/4 v0, 0x2

    goto/16 :goto_1

    :sswitch_1
    const-string v0, "approved"

    invoke-virtual {p0, v0}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v0

    if-eqz v0, :cond_1

    const/4 v0, 0x1

    goto :goto_1

    :sswitch_2
    const-string v0, "requested"

    invoke-virtual {p0, v0}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v0

    if-eqz v0, :cond_1

    const/4 v0, 0x4

    goto :goto_1

    :sswitch_3
    const-string v0, "under_review"

    invoke-virtual {p0, v0}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v0

    if-eqz v0, :cond_1

    const/4 v0, 0x0

    goto :goto_1

    :sswitch_4
    const-string v0, "paid"

    invoke-virtual {p0, v0}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v0

    if-eqz v0, :cond_1

    const/16 v0, 0x9

    goto :goto_1

    :sswitch_5
    const-string v0, "late"

    invoke-virtual {p0, v0}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v0

    if-eqz v0, :cond_1

    const/4 v0, 0x6

    goto :goto_1

    :sswitch_6
    const-string v0, "disbursing"

    invoke-virtual {p0, v0}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v0

    if-eqz v0, :cond_1

    const/4 v0, 0x5

    goto :goto_1

    :sswitch_7
    const-string v0, "rejected"

    invoke-virtual {p0, v0}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v0

    if-eqz v0, :cond_1

    const/4 v0, 0x7

    goto :goto_1

    :sswitch_8
    const-string v0, "pending"

    invoke-virtual {p0, v0}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v0

    if-eqz v0, :cond_1

    const/16 v0, 0xa

    goto :goto_1

    :sswitch_9
    const-string v0, "active"

    invoke-virtual {p0, v0}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v0

    if-eqz v0, :cond_1

    const/4 v0, 0x3

    goto :goto_1

    :sswitch_a
    const-string v0, "correction_required"

    invoke-virtual {p0, v0}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v0

    if-eqz v0, :cond_1

    const/16 v0, 0x8

    goto :goto_1

    :goto_0
    const/4 v0, -0x1

    :goto_1
    packed-switch v0, :pswitch_data_0

    const/16 v0, 0x5f

    const/16 v1, 0x20

    invoke-virtual {p0, v0, v1}, Ljava/lang/String;->replace(CC)Ljava/lang/String;

    move-result-object v0

    return-object v0

    :pswitch_0
    const-string v0, "Pendente"

    return-object v0

    :pswitch_1
    const-string v0, "Pago"

    return-object v0

    :pswitch_2
    const-string v0, "Corre\u00e7\u00e3o necess\u00e1ria"

    return-object v0

    :pswitch_3
    const-string v0, "Rejeitado"

    return-object v0

    :pswitch_4
    const-string v0, "Atrasado"

    return-object v0

    :pswitch_5
    const-string v0, "Liberando"

    return-object v0

    :pswitch_6
    const-string v0, "Solicitado"

    return-object v0

    :pswitch_7
    const-string v0, "Ativo"

    return-object v0

    :pswitch_8
    const-string v0, "Ativa\u00e7\u00e3o enviada"

    return-object v0

    :pswitch_9
    const-string v0, "Aprovado"

    return-object v0

    :pswitch_a
    const-string v0, "Em an\u00e1lise"

    return-object v0

    :sswitch_data_0
    .sparse-switch
        -0x610158a0 -> :sswitch_a
        -0x54d080fa -> :sswitch_9
        -0x28af7669 -> :sswitch_8
        -0x2444eb82 -> :sswitch_7
        -0xad11ac0 -> :sswitch_6
        0x3292a6 -> :sswitch_5
        0x3462cc -> :sswitch_4
        0x162a4e9f -> :sswitch_3
        0x295c976e -> :sswitch_2
        0x46a566b7 -> :sswitch_1
        0x4cb94521 -> :sswitch_0
    .end sparse-switch

    :pswitch_data_0
    .packed-switch 0x0
        :pswitch_a
        :pswitch_9
        :pswitch_8
        :pswitch_7
        :pswitch_6
        :pswitch_5
        :pswitch_4
        :pswitch_3
        :pswitch_2
        :pswitch_1
        :pswitch_0
    .end packed-switch
.end method


# virtual methods
.method busy(Landroid/widget/Button;ZLjava/lang/String;)V
    .locals 1
    .param p1, "b"    # Landroid/widget/Button;
    .param p2, "x"    # Z
    .param p3, "t"    # Ljava/lang/String;

    .line 66
    xor-int/lit8 v0, p2, 0x1

    invoke-virtual {p1, v0}, Landroid/widget/Button;->setEnabled(Z)V

    if-eqz p2, :cond_0

    const v0, 0x3f266666    # 0.65f

    goto :goto_0

    :cond_0
    const/high16 v0, 0x3f800000    # 1.0f

    :goto_0
    invoke-virtual {p1, v0}, Landroid/widget/Button;->setAlpha(F)V

    invoke-virtual {p1, p3}, Landroid/widget/Button;->setText(Ljava/lang/CharSequence;)V

    return-void
.end method

.method clearPending()V
    .locals 2

    .line 41
    const/4 v0, 0x0

    iput-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->pendingEmail:Ljava/lang/String;

    iput-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->pendingSecret:Ljava/lang/String;

    iput-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->pendingId:Ljava/lang/String;

    iget-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->prefs:Landroid/content/SharedPreferences;

    invoke-interface {v0}, Landroid/content/SharedPreferences;->edit()Landroid/content/SharedPreferences$Editor;

    move-result-object v0

    const-string v1, "pending_id"

    invoke-interface {v0, v1}, Landroid/content/SharedPreferences$Editor;->remove(Ljava/lang/String;)Landroid/content/SharedPreferences$Editor;

    move-result-object v0

    const-string v1, "pending_secret"

    invoke-interface {v0, v1}, Landroid/content/SharedPreferences$Editor;->remove(Ljava/lang/String;)Landroid/content/SharedPreferences$Editor;

    move-result-object v0

    const-string v1, "pending_email"

    invoke-interface {v0, v1}, Landroid/content/SharedPreferences$Editor;->remove(Ljava/lang/String;)Landroid/content/SharedPreferences$Editor;

    move-result-object v0

    invoke-interface {v0}, Landroid/content/SharedPreferences$Editor;->apply()V

    return-void
.end method

.method load()V
    .locals 3

    .line 37
    iget-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->prefs:Landroid/content/SharedPreferences;

    const-string v1, "access_token"

    const/4 v2, 0x0

    invoke-interface {v0, v1, v2}, Landroid/content/SharedPreferences;->getString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v0

    iput-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->accessToken:Ljava/lang/String;

    iget-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->prefs:Landroid/content/SharedPreferences;

    const-string v1, "refresh_token"

    invoke-interface {v0, v1, v2}, Landroid/content/SharedPreferences;->getString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v0

    iput-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->refreshToken:Ljava/lang/String;

    iget-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->prefs:Landroid/content/SharedPreferences;

    const-string v1, "user_id"

    invoke-interface {v0, v1, v2}, Landroid/content/SharedPreferences;->getString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v0

    iput-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->userId:Ljava/lang/String;

    iget-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->prefs:Landroid/content/SharedPreferences;

    const-string v1, "role"

    invoke-interface {v0, v1, v2}, Landroid/content/SharedPreferences;->getString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v0

    iput-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->role:Ljava/lang/String;

    iget-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->prefs:Landroid/content/SharedPreferences;

    const-string v1, "email"

    invoke-interface {v0, v1, v2}, Landroid/content/SharedPreferences;->getString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v0

    iput-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->email:Ljava/lang/String;

    iget-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->prefs:Landroid/content/SharedPreferences;

    const-string v1, "pending_id"

    invoke-interface {v0, v1, v2}, Landroid/content/SharedPreferences;->getString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v0

    iput-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->pendingId:Ljava/lang/String;

    iget-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->prefs:Landroid/content/SharedPreferences;

    const-string v1, "pending_secret"

    invoke-interface {v0, v1, v2}, Landroid/content/SharedPreferences;->getString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v0

    iput-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->pendingSecret:Ljava/lang/String;

    iget-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->prefs:Landroid/content/SharedPreferences;

    const-string v1, "pending_email"

    invoke-interface {v0, v1, v2}, Landroid/content/SharedPreferences;->getString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v0

    iput-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->pendingEmail:Ljava/lang/String;

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

.method protected onActivityResult(IILandroid/content/Intent;)V
    .locals 3
    .param p1, "rc"    # I
    .param p2, "result"    # I
    .param p3, "data"    # Landroid/content/Intent;

    .line 63
    invoke-super {p0, p1, p2, p3}, Landroid/app/Activity;->onActivityResult(IILandroid/content/Intent;)V

    const/4 v0, -0x1

    if-ne p2, v0, :cond_6

    if-eqz p3, :cond_6

    invoke-virtual {p3}, Landroid/content/Intent;->getData()Landroid/net/Uri;

    move-result-object v0

    if-nez v0, :cond_0

    goto :goto_1

    :cond_0
    const/16 v0, 0xcc

    if-ne p1, v0, :cond_2

    iget-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->earlyPaymentUi:Lbr/com/guerravpn/crediflow/EarlyPaymentUi;

    if-eqz v0, :cond_1

    iget-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->earlyPaymentUi:Lbr/com/guerravpn/crediflow/EarlyPaymentUi;

    invoke-virtual {p3}, Landroid/content/Intent;->getData()Landroid/net/Uri;

    move-result-object v1

    invoke-virtual {v0, v1}, Lbr/com/guerravpn/crediflow/EarlyPaymentUi;->onProofSelected(Landroid/net/Uri;)V

    :cond_1
    return-void

    :cond_2
    const/16 v0, 0xca

    const/16 v1, 0xc9

    if-eq p1, v1, :cond_3

    if-eq p1, v0, :cond_3

    const/16 v2, 0xcb

    if-eq p1, v2, :cond_3

    return-void

    :cond_3
    if-ne p1, v1, :cond_4

    const-string v0, "identity_front"

    goto :goto_0

    :cond_4
    if-ne p1, v0, :cond_5

    const-string v0, "identity_back"

    goto :goto_0

    :cond_5
    const-string v0, "payslip"

    .local v0, "kind":Ljava/lang/String;
    :goto_0
    const-string v1, "Enviando documento..."

    const/4 v2, 0x0

    invoke-static {p0, v1, v2}, Landroid/widget/Toast;->makeText(Landroid/content/Context;Ljava/lang/CharSequence;I)Landroid/widget/Toast;

    move-result-object v1

    invoke-virtual {v1}, Landroid/widget/Toast;->show()V

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->io:Ljava/util/concurrent/ExecutorService;

    new-instance v2, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda5;

    invoke-direct {v2, p0, p3, v0}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda5;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/content/Intent;Ljava/lang/String;)V

    invoke-interface {v1, v2}, Ljava/util/concurrent/ExecutorService;->execute(Ljava/lang/Runnable;)V

    .end local v0    # "kind":Ljava/lang/String;
    :cond_6
    :goto_1
    return-void
.end method

.method public onBackPressed()V
    .locals 0

    .line 70
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

.method protected onDestroy()V
    .locals 1

    .line 70
    iget-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->io:Ljava/util/concurrent/ExecutorService;

    invoke-interface {v0}, Ljava/util/concurrent/ExecutorService;->shutdownNow()Ljava/util/List;

    invoke-super {p0}, Landroid/app/Activity;->onDestroy()V

    return-void
.end method

.method pick(ILjava/lang/String;)V
    .locals 4
    .param p1, "code"    # I
    .param p2, "type"    # Ljava/lang/String;

    .line 60
    new-instance v0, Landroid/content/Intent;

    const-string v1, "android.intent.action.OPEN_DOCUMENT"

    invoke-direct {v0, v1}, Landroid/content/Intent;-><init>(Ljava/lang/String;)V

    .local v0, "i":Landroid/content/Intent;
    const-string v1, "android.intent.category.OPENABLE"

    invoke-virtual {v0, v1}, Landroid/content/Intent;->addCategory(Ljava/lang/String;)Landroid/content/Intent;

    invoke-virtual {v0, p2}, Landroid/content/Intent;->setType(Ljava/lang/String;)Landroid/content/Intent;

    const/16 v1, 0xcb

    if-ne p1, v1, :cond_0

    const/4 v1, 0x4

    new-array v1, v1, [Ljava/lang/String;

    const/4 v2, 0x0

    const-string v3, "application/pdf"

    aput-object v3, v1, v2

    const/4 v2, 0x1

    const-string v3, "image/jpeg"

    aput-object v3, v1, v2

    const/4 v2, 0x2

    const-string v3, "image/png"

    aput-object v3, v1, v2

    const/4 v2, 0x3

    const-string v3, "image/webp"

    aput-object v3, v1, v2

    const-string v2, "android.intent.extra.MIME_TYPES"

    invoke-virtual {v0, v2, v1}, Landroid/content/Intent;->putExtra(Ljava/lang/String;[Ljava/lang/String;)Landroid/content/Intent;

    :cond_0
    invoke-virtual {p0, v0, p1}, Lbr/com/guerravpn/crediflow/MainActivityV06;->startActivityForResult(Landroid/content/Intent;I)V

    return-void
.end method

.method pickEarlyPaymentProof(Lbr/com/guerravpn/crediflow/EarlyPaymentUi;)V
    .locals 4
    .param p1, "source"    # Lbr/com/guerravpn/crediflow/EarlyPaymentUi;

    .line 61
    iput-object p1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->earlyPaymentUi:Lbr/com/guerravpn/crediflow/EarlyPaymentUi;

    new-instance v0, Landroid/content/Intent;

    const-string v1, "android.intent.action.OPEN_DOCUMENT"

    invoke-direct {v0, v1}, Landroid/content/Intent;-><init>(Ljava/lang/String;)V

    .local v0, "i":Landroid/content/Intent;
    const-string v1, "android.intent.category.OPENABLE"

    invoke-virtual {v0, v1}, Landroid/content/Intent;->addCategory(Ljava/lang/String;)Landroid/content/Intent;

    const-string v1, "*/*"

    invoke-virtual {v0, v1}, Landroid/content/Intent;->setType(Ljava/lang/String;)Landroid/content/Intent;

    const/4 v1, 0x4

    new-array v1, v1, [Ljava/lang/String;

    const/4 v2, 0x0

    const-string v3, "application/pdf"

    aput-object v3, v1, v2

    const/4 v2, 0x1

    const-string v3, "image/jpeg"

    aput-object v3, v1, v2

    const/4 v2, 0x2

    const-string v3, "image/png"

    aput-object v3, v1, v2

    const/4 v2, 0x3

    const-string v3, "image/webp"

    aput-object v3, v1, v2

    const-string v2, "android.intent.extra.MIME_TYPES"

    invoke-virtual {v0, v2, v1}, Landroid/content/Intent;->putExtra(Ljava/lang/String;[Ljava/lang/String;)Landroid/content/Intent;

    const/16 v1, 0xcc

    invoke-virtual {p0, v0, v1}, Lbr/com/guerravpn/crediflow/MainActivityV06;->startActivityForResult(Landroid/content/Intent;I)V

    return-void
.end method

.method randomSecret()Ljava/lang/String;
    .locals 8

    .line 66
    const/16 v0, 0x20

    new-array v0, v0, [B

    .local v0, "b":[B
    new-instance v1, Ljava/security/SecureRandom;

    invoke-direct {v1}, Ljava/security/SecureRandom;-><init>()V

    invoke-virtual {v1, v0}, Ljava/security/SecureRandom;->nextBytes([B)V

    new-instance v1, Ljava/lang/StringBuilder;

    invoke-direct {v1}, Ljava/lang/StringBuilder;-><init>()V

    .local v1, "s":Ljava/lang/StringBuilder;
    array-length v2, v0

    const/4 v3, 0x0

    :goto_0
    if-ge v3, v2, :cond_0

    aget-byte v4, v0, v3

    .local v4, "x":B
    sget-object v5, Ljava/util/Locale;->US:Ljava/util/Locale;

    invoke-static {v4}, Ljava/lang/Byte;->valueOf(B)Ljava/lang/Byte;

    move-result-object v6

    filled-new-array {v6}, [Ljava/lang/Object;

    move-result-object v6

    const-string v7, "%02x"

    invoke-static {v5, v7, v6}, Ljava/lang/String;->format(Ljava/util/Locale;Ljava/lang/String;[Ljava/lang/Object;)Ljava/lang/String;

    move-result-object v5

    invoke-virtual {v1, v5}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    .end local v4    # "x":B
    add-int/lit8 v3, v3, 0x1

    goto :goto_0

    :cond_0
    invoke-virtual {v1}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v2

    return-object v2
.end method

.method read(Landroid/net/Uri;)[B
    .locals 7
    .param p1, "uri"    # Landroid/net/Uri;
    .annotation system Ldalvik/annotation/Throws;
        value = {
            Ljava/lang/Exception;
        }
    .end annotation

    .line 64
    invoke-virtual {p0}, Lbr/com/guerravpn/crediflow/MainActivityV06;->getContentResolver()Landroid/content/ContentResolver;

    move-result-object v0

    invoke-virtual {v0, p1}, Landroid/content/ContentResolver;->openInputStream(Landroid/net/Uri;)Ljava/io/InputStream;

    move-result-object v0

    .local v0, "in":Ljava/io/InputStream;
    :try_start_0
    new-instance v1, Ljava/io/ByteArrayOutputStream;

    invoke-direct {v1}, Ljava/io/ByteArrayOutputStream;-><init>()V
    :try_end_0
    .catchall {:try_start_0 .. :try_end_0} :catchall_2

    .local v1, "out":Ljava/io/ByteArrayOutputStream;
    if-eqz v0, :cond_3

    const/16 v2, 0x2000

    :try_start_1
    new-array v2, v2, [B

    .local v2, "b":[B
    const/4 v3, 0x0

    .local v3, "total":I
    :goto_0
    invoke-virtual {v0, v2}, Ljava/io/InputStream;->read([B)I

    move-result v4

    move v5, v4

    .local v5, "n":I
    const/4 v6, -0x1

    if-eq v4, v6, :cond_1

    add-int/2addr v3, v5

    const/high16 v4, 0xa00000

    if-gt v3, v4, :cond_0

    const/4 v4, 0x0

    invoke-virtual {v1, v2, v4, v5}, Ljava/io/ByteArrayOutputStream;->write([BII)V

    goto :goto_0

    :cond_0
    new-instance v4, Ljava/lang/Exception;

    const-string v6, "Arquivo maior que 10 MB."

    invoke-direct {v4, v6}, Ljava/lang/Exception;-><init>(Ljava/lang/String;)V

    .end local v0    # "in":Ljava/io/InputStream;
    .end local v1    # "out":Ljava/io/ByteArrayOutputStream;
    .end local p1    # "uri":Landroid/net/Uri;
    throw v4

    .restart local v0    # "in":Ljava/io/InputStream;
    .restart local v1    # "out":Ljava/io/ByteArrayOutputStream;
    .restart local p1    # "uri":Landroid/net/Uri;
    :cond_1
    invoke-virtual {v1}, Ljava/io/ByteArrayOutputStream;->toByteArray()[B

    move-result-object v4
    :try_end_1
    .catchall {:try_start_1 .. :try_end_1} :catchall_0

    :try_start_2
    invoke-virtual {v1}, Ljava/io/ByteArrayOutputStream;->close()V
    :try_end_2
    .catchall {:try_start_2 .. :try_end_2} :catchall_2

    if-eqz v0, :cond_2

    invoke-virtual {v0}, Ljava/io/InputStream;->close()V

    :cond_2
    return-object v4

    .end local v2    # "b":[B
    .end local v3    # "total":I
    .end local v5    # "n":I
    :catchall_0
    move-exception v2

    goto :goto_1

    :cond_3
    :try_start_3
    new-instance v2, Ljava/lang/Exception;

    const-string v3, "Arquivo inv\u00e1lido."

    invoke-direct {v2, v3}, Ljava/lang/Exception;-><init>(Ljava/lang/String;)V

    .end local v0    # "in":Ljava/io/InputStream;
    .end local v1    # "out":Ljava/io/ByteArrayOutputStream;
    .end local p1    # "uri":Landroid/net/Uri;
    throw v2
    :try_end_3
    .catchall {:try_start_3 .. :try_end_3} :catchall_0

    .restart local v0    # "in":Ljava/io/InputStream;
    .restart local v1    # "out":Ljava/io/ByteArrayOutputStream;
    .restart local p1    # "uri":Landroid/net/Uri;
    :goto_1
    :try_start_4
    invoke-virtual {v1}, Ljava/io/ByteArrayOutputStream;->close()V
    :try_end_4
    .catchall {:try_start_4 .. :try_end_4} :catchall_1

    goto :goto_2

    :catchall_1
    move-exception v3

    :try_start_5
    invoke-virtual {v2, v3}, Ljava/lang/Throwable;->addSuppressed(Ljava/lang/Throwable;)V

    .end local v0    # "in":Ljava/io/InputStream;
    .end local p1    # "uri":Landroid/net/Uri;
    :goto_2
    throw v2
    :try_end_5
    .catchall {:try_start_5 .. :try_end_5} :catchall_2

    .end local v1    # "out":Ljava/io/ByteArrayOutputStream;
    .restart local v0    # "in":Ljava/io/InputStream;
    .restart local p1    # "uri":Landroid/net/Uri;
    :catchall_2
    move-exception v1

    if-eqz v0, :cond_4

    :try_start_6
    invoke-virtual {v0}, Ljava/io/InputStream;->close()V
    :try_end_6
    .catchall {:try_start_6 .. :try_end_6} :catchall_3

    goto :goto_3

    :catchall_3
    move-exception v2

    invoke-virtual {v1, v2}, Ljava/lang/Throwable;->addSuppressed(Ljava/lang/Throwable;)V

    :cond_4
    :goto_3
    throw v1
.end method

.method renderStatus(Landroid/widget/LinearLayout;Landroid/widget/ProgressBar;Lorg/json/JSONObject;)V
    .locals 8
    .param p1, "b"    # Landroid/widget/LinearLayout;
    .param p2, "p"    # Landroid/widget/ProgressBar;
    .param p3, "s"    # Lorg/json/JSONObject;

    .line 51
    const/16 v0, 0x8

    invoke-virtual {p2, v0}, Landroid/widget/ProgressBar;->setVisibility(I)V

    const-string v0, "application_status"

    const-string v1, "under_review"

    invoke-virtual {p3, v0, v1}, Lorg/json/JSONObject;->optString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v0

    .local v0, "st":Ljava/lang/String;
    iget-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    invoke-static {v0}, Lbr/com/guerravpn/crediflow/MainActivityV06;->statusPt(Ljava/lang/String;)Ljava/lang/String;

    move-result-object v2

    invoke-static {v0}, Lbr/com/guerravpn/crediflow/MainActivityV06;->statusColor(Ljava/lang/String;)I

    move-result v3

    invoke-virtual {v1, v2, v3}, Lbr/com/guerravpn/crediflow/Ui;->badge(Ljava/lang/String;I)Landroid/widget/TextView;

    move-result-object v1

    invoke-virtual {p1, v1}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    const-string v1, "approved_limit"

    invoke-virtual {p3, v1}, Lorg/json/JSONObject;->isNull(Ljava/lang/String;)Z

    move-result v2

    if-nez v2, :cond_0

    iget-object v2, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-wide/16 v3, 0x0

    invoke-virtual {p3, v1, v3, v4}, Lorg/json/JSONObject;->optDouble(Ljava/lang/String;D)D

    move-result-wide v3

    invoke-static {v3, v4}, Lbr/com/guerravpn/crediflow/MainActivityV06;->money(D)Ljava/lang/String;

    move-result-object v1

    const-string v3, "Limite aprovado"

    invoke-virtual {v2, p1, v3, v1}, Lbr/com/guerravpn/crediflow/Ui;->stat(Landroid/widget/LinearLayout;Ljava/lang/String;Ljava/lang/String;)V

    :cond_0
    const-string v1, "verification_score"

    const/4 v2, -0x1

    invoke-virtual {p3, v1, v2}, Lorg/json/JSONObject;->optInt(Ljava/lang/String;I)I

    move-result v1

    .local v1, "score":I
    const-string v2, ""

    if-ltz v1, :cond_1

    iget-object v3, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    new-instance v4, Ljava/lang/StringBuilder;

    invoke-direct {v4}, Ljava/lang/StringBuilder;-><init>()V

    invoke-virtual {v4, v1}, Ljava/lang/StringBuilder;->append(I)Ljava/lang/StringBuilder;

    move-result-object v4

    const-string v5, "/100 \u00b7 "

    invoke-virtual {v4, v5}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v4

    const-string v5, "verification_level"

    invoke-virtual {p3, v5, v2}, Lorg/json/JSONObject;->optString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v5

    invoke-virtual {v4, v5}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v4

    invoke-virtual {v4}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v4

    const-string v5, "Verifica\u00e7\u00e3o"

    invoke-virtual {v3, p1, v5, v4}, Lbr/com/guerravpn/crediflow/Ui;->stat(Landroid/widget/LinearLayout;Ljava/lang/String;Ljava/lang/String;)V

    :cond_1
    const-string v3, "correction_note"

    invoke-virtual {p3, v3, v2}, Lorg/json/JSONObject;->optString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v2

    .local v2, "note":Ljava/lang/String;
    invoke-virtual {v2}, Ljava/lang/String;->isEmpty()Z

    move-result v3

    if-nez v3, :cond_2

    iget-object v3, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    new-instance v4, Ljava/lang/StringBuilder;

    invoke-direct {v4}, Ljava/lang/StringBuilder;-><init>()V

    const-string v5, "Orienta\u00e7\u00e3o do Admin: "

    invoke-virtual {v4, v5}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v4

    invoke-virtual {v4, v2}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v4

    invoke-virtual {v4}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v4

    invoke-virtual {v3, p1, v4}, Lbr/com/guerravpn/crediflow/Ui;->body(Landroid/widget/LinearLayout;Ljava/lang/String;)Landroid/widget/TextView;

    :cond_2
    const-string v3, "document_status"

    invoke-virtual {p3, v3}, Lorg/json/JSONObject;->optJSONObject(Ljava/lang/String;)Lorg/json/JSONObject;

    move-result-object v3

    .local v3, "d":Lorg/json/JSONObject;
    if-eqz v3, :cond_3

    iget-object v4, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    new-instance v5, Ljava/lang/StringBuilder;

    invoke-direct {v5}, Ljava/lang/StringBuilder;-><init>()V

    const-string v6, "Frente: "

    invoke-virtual {v5, v6}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v5

    const-string v6, "identity_front"

    const-string v7, "pendente"

    invoke-virtual {v3, v6, v7}, Lorg/json/JSONObject;->optString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v6

    invoke-virtual {v5, v6}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v5

    const-string v6, " \u00b7 Verso: "

    invoke-virtual {v5, v6}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v5

    const-string v6, "identity_back"

    invoke-virtual {v3, v6, v7}, Lorg/json/JSONObject;->optString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v6

    invoke-virtual {v5, v6}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v5

    const-string v6, " \u00b7 Renda: "

    invoke-virtual {v5, v6}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v5

    const-string v6, "payslip"

    invoke-virtual {v3, v6, v7}, Lorg/json/JSONObject;->optString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v6

    invoke-virtual {v5, v6}, Ljava/lang/StringBuilder;->append(Ljava/lang/String;)Ljava/lang/StringBuilder;

    move-result-object v5

    invoke-virtual {v5}, Ljava/lang/StringBuilder;->toString()Ljava/lang/String;

    move-result-object v5

    invoke-virtual {v4, p1, v5}, Lbr/com/guerravpn/crediflow/Ui;->caption(Landroid/widget/LinearLayout;Ljava/lang/String;)V

    :cond_3
    const-string v4, "activation_ready"

    const/4 v5, 0x0

    invoke-virtual {p3, v4, v5}, Lorg/json/JSONObject;->optBoolean(Ljava/lang/String;Z)Z

    move-result v4

    if-nez v4, :cond_5

    const-string v4, "activation_sent"

    invoke-virtual {v4, v0}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v4

    if-eqz v4, :cond_4

    goto :goto_0

    :cond_4
    const-string v4, "approved"

    invoke-virtual {v4, v0}, Ljava/lang/String;->equals(Ljava/lang/Object;)Z

    move-result v4

    if-eqz v4, :cond_6

    iget-object v4, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v5, "Aguarde o Admin enviar o c\u00f3digo de ativa\u00e7\u00e3o por e-mail."

    invoke-virtual {v4, p1, v5}, Lbr/com/guerravpn/crediflow/Ui;->body(Landroid/widget/LinearLayout;Ljava/lang/String;)Landroid/widget/TextView;

    goto :goto_1

    :cond_5
    :goto_0
    iget-object v4, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    new-instance v5, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda31;

    invoke-direct {v5, p0}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda31;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;)V

    const-string v6, "Inserir c\u00f3digo recebido por e-mail"

    invoke-virtual {v4, v6, v5}, Lbr/com/guerravpn/crediflow/Ui;->primary(Ljava/lang/String;Landroid/view/View$OnClickListener;)Landroid/widget/Button;

    move-result-object v4

    invoke-virtual {p1, v4}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    :cond_6
    :goto_1
    return-void
.end method

.method savePending(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V
    .locals 2
    .param p1, "id"    # Ljava/lang/String;
    .param p2, "secret"    # Ljava/lang/String;
    .param p3, "mail"    # Ljava/lang/String;

    .line 40
    iput-object p1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->pendingId:Ljava/lang/String;

    iput-object p2, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->pendingSecret:Ljava/lang/String;

    iput-object p3, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->pendingEmail:Ljava/lang/String;

    iget-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->prefs:Landroid/content/SharedPreferences;

    invoke-interface {v0}, Landroid/content/SharedPreferences;->edit()Landroid/content/SharedPreferences$Editor;

    move-result-object v0

    const-string v1, "pending_id"

    invoke-interface {v0, v1, p1}, Landroid/content/SharedPreferences$Editor;->putString(Ljava/lang/String;Ljava/lang/String;)Landroid/content/SharedPreferences$Editor;

    move-result-object v0

    const-string v1, "pending_secret"

    invoke-interface {v0, v1, p2}, Landroid/content/SharedPreferences$Editor;->putString(Ljava/lang/String;Ljava/lang/String;)Landroid/content/SharedPreferences$Editor;

    move-result-object v0

    const-string v1, "pending_email"

    invoke-interface {v0, v1, p3}, Landroid/content/SharedPreferences$Editor;->putString(Ljava/lang/String;Ljava/lang/String;)Landroid/content/SharedPreferences$Editor;

    move-result-object v0

    invoke-interface {v0}, Landroid/content/SharedPreferences$Editor;->apply()V

    return-void
.end method

.method saveSession(Lorg/json/JSONObject;)V
    .locals 7
    .param p1, "o"    # Lorg/json/JSONObject;

    .line 38
    const-string v0, "access_token"

    const/4 v1, 0x0

    invoke-virtual {p1, v0, v1}, Lorg/json/JSONObject;->optString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v2

    iput-object v2, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->accessToken:Ljava/lang/String;

    const-string v2, "refresh_token"

    invoke-virtual {p1, v2, v1}, Lorg/json/JSONObject;->optString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v1

    iput-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->refreshToken:Ljava/lang/String;

    const-string v1, "user"

    invoke-virtual {p1, v1}, Lorg/json/JSONObject;->optJSONObject(Ljava/lang/String;)Lorg/json/JSONObject;

    move-result-object v1

    .local v1, "usr":Lorg/json/JSONObject;
    const-string v3, "email"

    const-string v4, "role"

    if-eqz v1, :cond_1

    const-string v5, "id"

    iget-object v6, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->userId:Ljava/lang/String;

    invoke-virtual {v1, v5, v6}, Lorg/json/JSONObject;->optString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v5

    iput-object v5, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->userId:Ljava/lang/String;

    iget-object v5, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->email:Ljava/lang/String;

    invoke-virtual {v1, v3, v5}, Lorg/json/JSONObject;->optString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v5

    iput-object v5, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->email:Ljava/lang/String;

    const-string v5, "app_metadata"

    invoke-virtual {v1, v5}, Lorg/json/JSONObject;->optJSONObject(Ljava/lang/String;)Lorg/json/JSONObject;

    move-result-object v5

    .local v5, "m":Lorg/json/JSONObject;
    const-string v6, "client"

    if-nez v5, :cond_0

    goto :goto_0

    :cond_0
    invoke-virtual {v5, v4, v6}, Lorg/json/JSONObject;->optString(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;

    move-result-object v6

    :goto_0
    iput-object v6, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->role:Ljava/lang/String;

    .end local v5    # "m":Lorg/json/JSONObject;
    :cond_1
    iget-object v5, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->prefs:Landroid/content/SharedPreferences;

    invoke-interface {v5}, Landroid/content/SharedPreferences;->edit()Landroid/content/SharedPreferences$Editor;

    move-result-object v5

    iget-object v6, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->accessToken:Ljava/lang/String;

    invoke-interface {v5, v0, v6}, Landroid/content/SharedPreferences$Editor;->putString(Ljava/lang/String;Ljava/lang/String;)Landroid/content/SharedPreferences$Editor;

    move-result-object v0

    iget-object v5, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->refreshToken:Ljava/lang/String;

    invoke-interface {v0, v2, v5}, Landroid/content/SharedPreferences$Editor;->putString(Ljava/lang/String;Ljava/lang/String;)Landroid/content/SharedPreferences$Editor;

    move-result-object v0

    const-string v2, "user_id"

    iget-object v5, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->userId:Ljava/lang/String;

    invoke-interface {v0, v2, v5}, Landroid/content/SharedPreferences$Editor;->putString(Ljava/lang/String;Ljava/lang/String;)Landroid/content/SharedPreferences$Editor;

    move-result-object v0

    iget-object v2, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->role:Ljava/lang/String;

    invoke-interface {v0, v4, v2}, Landroid/content/SharedPreferences$Editor;->putString(Ljava/lang/String;Ljava/lang/String;)Landroid/content/SharedPreferences$Editor;

    move-result-object v0

    iget-object v2, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->email:Ljava/lang/String;

    invoke-interface {v0, v3, v2}, Landroid/content/SharedPreferences$Editor;->putString(Ljava/lang/String;Ljava/lang/String;)Landroid/content/SharedPreferences$Editor;

    move-result-object v0

    invoke-interface {v0}, Landroid/content/SharedPreferences$Editor;->apply()V

    return-void
.end method

.method showActivation()V
    .locals 6

    .line 53
    iget-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    invoke-virtual {v0}, Lbr/com/guerravpn/crediflow/Ui;->page()Landroid/widget/LinearLayout;

    move-result-object v0

    .local v0, "r":Landroid/widget/LinearLayout;
    iget-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    new-instance v2, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda34;

    invoke-direct {v2, p0}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda34;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;)V

    invoke-virtual {v1, v0, v2}, Lbr/com/guerravpn/crediflow/Ui;->back(Landroid/widget/LinearLayout;Ljava/lang/Runnable;)V

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v2, "Ativar conta"

    const/16 v3, 0x1e

    invoke-virtual {v1, v0, v2, v3}, Lbr/com/guerravpn/crediflow/Ui;->title(Landroid/widget/LinearLayout;Ljava/lang/String;I)Landroid/widget/TextView;

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v2, "Digite o c\u00f3digo recebido por e-mail."

    invoke-virtual {v1, v0, v2}, Lbr/com/guerravpn/crediflow/Ui;->body(Landroid/widget/LinearLayout;Ljava/lang/String;)Landroid/widget/TextView;

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v2, "C\u00f3digo de ativa\u00e7\u00e3o"

    const/4 v3, 0x2

    invoke-virtual {v1, v2, v3}, Lbr/com/guerravpn/crediflow/Ui;->input(Ljava/lang/String;I)Landroid/widget/EditText;

    move-result-object v1

    .local v1, "code":Landroid/widget/EditText;
    invoke-virtual {v0, v1}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    iget-object v2, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    invoke-virtual {v2}, Lbr/com/guerravpn/crediflow/Ui;->error()Landroid/widget/TextView;

    move-result-object v2

    .local v2, "err":Landroid/widget/TextView;
    invoke-virtual {v0, v2}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    iget-object v3, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v4, "Verificar c\u00f3digo"

    const/4 v5, 0x0

    invoke-virtual {v3, v4, v5}, Lbr/com/guerravpn/crediflow/Ui;->primary(Ljava/lang/String;Landroid/view/View$OnClickListener;)Landroid/widget/Button;

    move-result-object v3

    .local v3, "go":Landroid/widget/Button;
    invoke-virtual {v0, v3}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    new-instance v4, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda35;

    invoke-direct {v4, p0, v1, v2, v3}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda35;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/widget/EditText;Landroid/widget/TextView;Landroid/widget/Button;)V

    invoke-virtual {v3, v4}, Landroid/widget/Button;->setOnClickListener(Landroid/view/View$OnClickListener;)V

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

.method showLogin()V
    .locals 12

    .line 46
    iget-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    invoke-virtual {v0}, Lbr/com/guerravpn/crediflow/Ui;->page()Landroid/widget/LinearLayout;

    move-result-object v0

    .local v0, "r":Landroid/widget/LinearLayout;
    iget-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    new-instance v2, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda33;

    invoke-direct {v2, p0}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda33;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;)V

    invoke-virtual {v1, v0, v2}, Lbr/com/guerravpn/crediflow/Ui;->back(Landroid/widget/LinearLayout;Ljava/lang/Runnable;)V

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    invoke-virtual {v1, v0}, Lbr/com/guerravpn/crediflow/Ui;->logo(Landroid/widget/LinearLayout;)V

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const/16 v2, 0x12

    invoke-virtual {v1, v0, v2}, Lbr/com/guerravpn/crediflow/Ui;->spacer(Landroid/widget/LinearLayout;I)V

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const/16 v2, 0x20

    const-string v3, "Entrar"

    invoke-virtual {v1, v0, v3, v2}, Lbr/com/guerravpn/crediflow/Ui;->title(Landroid/widget/LinearLayout;Ljava/lang/String;I)Landroid/widget/TextView;

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v2, "Use o e-mail e a senha da sua conta aprovada."

    invoke-virtual {v1, v0, v2}, Lbr/com/guerravpn/crediflow/Ui;->body(Landroid/widget/LinearLayout;Ljava/lang/String;)Landroid/widget/TextView;

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v2, "E-mail"

    const/16 v4, 0x21

    invoke-virtual {v1, v2, v4}, Lbr/com/guerravpn/crediflow/Ui;->input(Ljava/lang/String;I)Landroid/widget/EditText;

    move-result-object v1

    .local v1, "em":Landroid/widget/EditText;
    iget-object v2, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v4, "Senha"

    const/16 v5, 0x81

    invoke-virtual {v2, v4, v5}, Lbr/com/guerravpn/crediflow/Ui;->input(Ljava/lang/String;I)Landroid/widget/EditText;

    move-result-object v2

    .local v2, "pw":Landroid/widget/EditText;
    iget-object v4, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->email:Ljava/lang/String;

    if-eqz v4, :cond_0

    iget-object v4, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->email:Ljava/lang/String;

    invoke-virtual {v1, v4}, Landroid/widget/EditText;->setText(Ljava/lang/CharSequence;)V

    :cond_0
    invoke-virtual {v0, v1}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    invoke-virtual {v0, v2}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    iget-object v4, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    invoke-virtual {v4}, Lbr/com/guerravpn/crediflow/Ui;->error()Landroid/widget/TextView;

    move-result-object v4

    .local v4, "err":Landroid/widget/TextView;
    invoke-virtual {v0, v4}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    iget-object v5, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const/4 v6, 0x0

    invoke-virtual {v5, v3, v6}, Lbr/com/guerravpn/crediflow/Ui;->primary(Ljava/lang/String;Landroid/view/View$OnClickListener;)Landroid/widget/Button;

    move-result-object v3

    .local v3, "go":Landroid/widget/Button;
    invoke-virtual {v0, v3}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    new-instance v11, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda18;

    move-object v5, v11

    move-object v6, p0

    move-object v7, v1

    move-object v8, v2

    move-object v9, v4

    move-object v10, v3

    invoke-direct/range {v5 .. v10}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda18;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/TextView;Landroid/widget/Button;)V

    invoke-virtual {v3, v11}, Landroid/widget/Button;->setOnClickListener(Landroid/view/View$OnClickListener;)V

    return-void
.end method

.method showPassword()V
    .locals 12

    .line 54
    iget-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    invoke-virtual {v0}, Lbr/com/guerravpn/crediflow/Ui;->page()Landroid/widget/LinearLayout;

    move-result-object v0

    .local v0, "r":Landroid/widget/LinearLayout;
    iget-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v2, "Criar senha"

    const/16 v3, 0x1e

    invoke-virtual {v1, v0, v2, v3}, Lbr/com/guerravpn/crediflow/Ui;->title(Landroid/widget/LinearLayout;Ljava/lang/String;I)Landroid/widget/TextView;

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v2, "Defina sua senha para os pr\u00f3ximos acessos."

    invoke-virtual {v1, v0, v2}, Lbr/com/guerravpn/crediflow/Ui;->body(Landroid/widget/LinearLayout;Ljava/lang/String;)Landroid/widget/TextView;

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v2, "Nova senha"

    const/16 v3, 0x81

    invoke-virtual {v1, v2, v3}, Lbr/com/guerravpn/crediflow/Ui;->input(Ljava/lang/String;I)Landroid/widget/EditText;

    move-result-object v1

    .local v1, "a":Landroid/widget/EditText;
    iget-object v2, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v4, "Confirmar senha"

    invoke-virtual {v2, v4, v3}, Lbr/com/guerravpn/crediflow/Ui;->input(Ljava/lang/String;I)Landroid/widget/EditText;

    move-result-object v2

    .local v2, "b":Landroid/widget/EditText;
    invoke-virtual {v0, v1}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    invoke-virtual {v0, v2}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    iget-object v3, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    invoke-virtual {v3}, Lbr/com/guerravpn/crediflow/Ui;->error()Landroid/widget/TextView;

    move-result-object v3

    .local v3, "err":Landroid/widget/TextView;
    invoke-virtual {v0, v3}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    iget-object v4, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v5, "Criar senha e entrar"

    const/4 v6, 0x0

    invoke-virtual {v4, v5, v6}, Lbr/com/guerravpn/crediflow/Ui;->primary(Ljava/lang/String;Landroid/view/View$OnClickListener;)Landroid/widget/Button;

    move-result-object v10

    .local v10, "go":Landroid/widget/Button;
    invoke-virtual {v0, v10}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    new-instance v11, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda7;

    move-object v4, v11

    move-object v5, p0

    move-object v6, v1

    move-object v7, v2

    move-object v8, v3

    move-object v9, v10

    invoke-direct/range {v4 .. v9}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda7;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/TextView;Landroid/widget/Button;)V

    invoke-virtual {v10, v11}, Landroid/widget/Button;->setOnClickListener(Landroid/view/View$OnClickListener;)V

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

.method showRegister()V
    .locals 38

    .line 48
    move-object/from16 v15, p0

    iget-object v0, v15, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    invoke-virtual {v0}, Lbr/com/guerravpn/crediflow/Ui;->page()Landroid/widget/LinearLayout;

    move-result-object v14

    .local v14, "r":Landroid/widget/LinearLayout;
    iget-object v0, v15, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    new-instance v1, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda33;

    invoke-direct {v1, v15}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda33;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;)V

    invoke-virtual {v0, v14, v1}, Lbr/com/guerravpn/crediflow/Ui;->back(Landroid/widget/LinearLayout;Ljava/lang/Runnable;)V

    iget-object v0, v15, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v1, "Criar cadastro"

    const/16 v2, 0x1e

    invoke-virtual {v0, v14, v1, v2}, Lbr/com/guerravpn/crediflow/Ui;->title(Landroid/widget/LinearLayout;Ljava/lang/String;I)Landroid/widget/TextView;

    iget-object v0, v15, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v1, "Preencha seus dados para an\u00e1lise manual. O app n\u00e3o aprova cr\u00e9dito sozinho."

    invoke-virtual {v0, v14, v1}, Lbr/com/guerravpn/crediflow/Ui;->body(Landroid/widget/LinearLayout;Ljava/lang/String;)Landroid/widget/TextView;

    iget-object v0, v15, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v1, "Nome completo"

    const/16 v2, 0x2001

    invoke-virtual {v0, v1, v2}, Lbr/com/guerravpn/crediflow/Ui;->input(Ljava/lang/String;I)Landroid/widget/EditText;

    move-result-object v19

    .local v19, "n":Landroid/widget/EditText;
    iget-object v0, v15, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v1, "E-mail"

    const/16 v2, 0x21

    invoke-virtual {v0, v1, v2}, Lbr/com/guerravpn/crediflow/Ui;->input(Ljava/lang/String;I)Landroid/widget/EditText;

    move-result-object v20

    .local v20, "em":Landroid/widget/EditText;
    iget-object v0, v15, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v1, "CPF \u00b7 somente n\u00fameros"

    const/4 v2, 0x2

    invoke-virtual {v0, v1, v2}, Lbr/com/guerravpn/crediflow/Ui;->input(Ljava/lang/String;I)Landroid/widget/EditText;

    move-result-object v21

    .local v21, "cpf":Landroid/widget/EditText;
    iget-object v0, v15, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v1, "Celular com DDD"

    const/4 v3, 0x3

    invoke-virtual {v0, v1, v3}, Lbr/com/guerravpn/crediflow/Ui;->input(Ljava/lang/String;I)Landroid/widget/EditText;

    move-result-object v22

    .local v22, "ph":Landroid/widget/EditText;
    iget-object v0, v15, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v1, "Nascimento \u00b7 AAAA-MM-DD"

    const/4 v4, 0x4

    invoke-virtual {v0, v1, v4}, Lbr/com/guerravpn/crediflow/Ui;->input(Ljava/lang/String;I)Landroid/widget/EditText;

    move-result-object v23

    .local v23, "bd":Landroid/widget/EditText;
    iget-object v0, v15, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v1, "Rua / endere\u00e7o"

    const/4 v5, 0x1

    invoke-virtual {v0, v1, v5}, Lbr/com/guerravpn/crediflow/Ui;->input(Ljava/lang/String;I)Landroid/widget/EditText;

    move-result-object v24

    .local v24, "addr":Landroid/widget/EditText;
    iget-object v0, v15, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v1, "N\u00famero"

    invoke-virtual {v0, v1, v5}, Lbr/com/guerravpn/crediflow/Ui;->input(Ljava/lang/String;I)Landroid/widget/EditText;

    move-result-object v25

    .local v25, "num":Landroid/widget/EditText;
    iget-object v0, v15, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v1, "Complemento \u00b7 opcional"

    invoke-virtual {v0, v1, v5}, Lbr/com/guerravpn/crediflow/Ui;->input(Ljava/lang/String;I)Landroid/widget/EditText;

    move-result-object v26

    .local v26, "comp":Landroid/widget/EditText;
    iget-object v0, v15, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v1, "Bairro"

    invoke-virtual {v0, v1, v5}, Lbr/com/guerravpn/crediflow/Ui;->input(Ljava/lang/String;I)Landroid/widget/EditText;

    move-result-object v27

    .local v27, "bairro":Landroid/widget/EditText;
    iget-object v0, v15, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v1, "Cidade"

    invoke-virtual {v0, v1, v5}, Lbr/com/guerravpn/crediflow/Ui;->input(Ljava/lang/String;I)Landroid/widget/EditText;

    move-result-object v28

    .local v28, "city":Landroid/widget/EditText;
    iget-object v0, v15, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v1, "UF \u00b7 ex.: RS"

    const/16 v6, 0x1001

    invoke-virtual {v0, v1, v6}, Lbr/com/guerravpn/crediflow/Ui;->input(Ljava/lang/String;I)Landroid/widget/EditText;

    move-result-object v29

    .local v29, "uf":Landroid/widget/EditText;
    iget-object v0, v15, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v1, "CEP"

    invoke-virtual {v0, v1, v2}, Lbr/com/guerravpn/crediflow/Ui;->input(Ljava/lang/String;I)Landroid/widget/EditText;

    move-result-object v30

    .local v30, "cep":Landroid/widget/EditText;
    iget-object v0, v15, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v1, "Profiss\u00e3o / ocupa\u00e7\u00e3o"

    invoke-virtual {v0, v1, v5}, Lbr/com/guerravpn/crediflow/Ui;->input(Ljava/lang/String;I)Landroid/widget/EditText;

    move-result-object v31

    .local v31, "job":Landroid/widget/EditText;
    iget-object v0, v15, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v1, "Renda mensal \u00b7 ex.: 2500,00"

    const/16 v6, 0x2002

    invoke-virtual {v0, v1, v6}, Lbr/com/guerravpn/crediflow/Ui;->input(Ljava/lang/String;I)Landroid/widget/EditText;

    move-result-object v32

    .local v32, "inc":Landroid/widget/EditText;
    const/16 v0, 0xe

    new-array v1, v0, [Landroid/widget/EditText;

    const/4 v6, 0x0

    aput-object v19, v1, v6

    aput-object v20, v1, v5

    aput-object v21, v1, v2

    aput-object v22, v1, v3

    aput-object v23, v1, v4

    const/4 v2, 0x5

    aput-object v24, v1, v2

    const/4 v2, 0x6

    aput-object v25, v1, v2

    const/4 v2, 0x7

    aput-object v26, v1, v2

    const/16 v2, 0x8

    aput-object v27, v1, v2

    const/16 v2, 0x9

    aput-object v28, v1, v2

    const/16 v2, 0xa

    aput-object v29, v1, v2

    const/16 v2, 0xb

    aput-object v30, v1, v2

    const/16 v2, 0xc

    aput-object v31, v1, v2

    const/16 v2, 0xd

    aput-object v32, v1, v2

    :goto_0
    if-ge v6, v0, :cond_0

    aget-object v2, v1, v6

    .local v2, "e":Landroid/widget/EditText;
    invoke-virtual {v14, v2}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    .end local v2    # "e":Landroid/widget/EditText;
    add-int/lit8 v6, v6, 0x1

    goto :goto_0

    :cond_0
    iget-object v0, v15, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v1, "Declaro que os dados s\u00e3o verdadeiros e autorizo o uso para cadastro e an\u00e1lise de cr\u00e9dito."

    invoke-virtual {v0, v1}, Lbr/com/guerravpn/crediflow/Ui;->check(Ljava/lang/String;)Landroid/widget/CheckBox;

    move-result-object v13

    .local v13, "ok":Landroid/widget/CheckBox;
    move-object v2, v13

    invoke-virtual {v14, v13}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    iget-object v0, v15, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    invoke-virtual {v0}, Lbr/com/guerravpn/crediflow/Ui;->error()Landroid/widget/TextView;

    move-result-object v12

    .local v12, "err":Landroid/widget/TextView;
    move-object v3, v12

    invoke-virtual {v14, v12}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    iget-object v0, v15, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v1, "Enviar cadastro"

    const/4 v4, 0x0

    invoke-virtual {v0, v1, v4}, Lbr/com/guerravpn/crediflow/Ui;->primary(Ljava/lang/String;Landroid/view/View$OnClickListener;)Landroid/widget/Button;

    move-result-object v11

    .local v11, "send":Landroid/widget/Button;
    move-object/from16 v18, v11

    invoke-virtual {v14, v11}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    new-instance v10, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda39;

    move-object v0, v10

    move-object/from16 v1, p0

    move-object/from16 v4, v19

    move-object/from16 v5, v20

    move-object/from16 v6, v21

    move-object/from16 v7, v22

    move-object/from16 v8, v23

    move-object/from16 v9, v24

    move-object/from16 v33, v10

    move-object/from16 v10, v25

    move-object/from16 v34, v11

    .end local v11    # "send":Landroid/widget/Button;
    .local v34, "send":Landroid/widget/Button;
    move-object/from16 v11, v26

    move-object/from16 v35, v12

    .end local v12    # "err":Landroid/widget/TextView;
    .local v35, "err":Landroid/widget/TextView;
    move-object/from16 v12, v27

    move-object/from16 v36, v13

    .end local v13    # "ok":Landroid/widget/CheckBox;
    .local v36, "ok":Landroid/widget/CheckBox;
    move-object/from16 v13, v28

    move-object/from16 v37, v14

    .end local v14    # "r":Landroid/widget/LinearLayout;
    .local v37, "r":Landroid/widget/LinearLayout;
    move-object/from16 v14, v29

    move-object/from16 v15, v30

    move-object/from16 v16, v31

    move-object/from16 v17, v32

    invoke-direct/range {v0 .. v18}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda39;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/widget/CheckBox;Landroid/widget/TextView;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/EditText;Landroid/widget/Button;)V

    move-object/from16 v1, v33

    move-object/from16 v0, v34

    .end local v34    # "send":Landroid/widget/Button;
    .local v0, "send":Landroid/widget/Button;
    invoke-virtual {v0, v1}, Landroid/widget/Button;->setOnClickListener(Landroid/view/View$OnClickListener;)V

    return-void
.end method

.method showStatus()V
    .locals 8

    .line 50
    iget-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->pendingId:Ljava/lang/String;

    if-nez v0, :cond_0

    invoke-virtual {p0}, Lbr/com/guerravpn/crediflow/MainActivityV06;->showTracking()V

    return-void

    :cond_0
    iget-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    invoke-virtual {v0}, Lbr/com/guerravpn/crediflow/Ui;->page()Landroid/widget/LinearLayout;

    move-result-object v0

    .local v0, "r":Landroid/widget/LinearLayout;
    iget-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    new-instance v2, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda33;

    invoke-direct {v2, p0}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda33;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;)V

    invoke-virtual {v1, v0, v2}, Lbr/com/guerravpn/crediflow/Ui;->back(Landroid/widget/LinearLayout;Ljava/lang/Runnable;)V

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v2, "Acompanhar solicita\u00e7\u00e3o"

    const/16 v3, 0x1e

    invoke-virtual {v1, v0, v2, v3}, Lbr/com/guerravpn/crediflow/Ui;->title(Landroid/widget/LinearLayout;Ljava/lang/String;I)Landroid/widget/TextView;

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    iget-object v2, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->pendingEmail:Ljava/lang/String;

    if-nez v2, :cond_1

    const-string v2, ""

    goto :goto_0

    :cond_1
    iget-object v2, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->pendingEmail:Ljava/lang/String;

    :goto_0
    invoke-virtual {v1, v0, v2}, Lbr/com/guerravpn/crediflow/Ui;->body(Landroid/widget/LinearLayout;Ljava/lang/String;)Landroid/widget/TextView;

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

    invoke-virtual {v3}, Lbr/com/guerravpn/crediflow/Ui;->error()Landroid/widget/TextView;

    move-result-object v3

    .local v3, "err":Landroid/widget/TextView;
    invoke-virtual {v0, v3}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    iget-object v4, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    new-instance v5, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda26;

    invoke-direct {v5, p0}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda26;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;)V

    const-string v6, "Atualizar an\u00e1lise"

    invoke-virtual {v4, v6, v5}, Lbr/com/guerravpn/crediflow/Ui;->outline(Ljava/lang/String;Landroid/view/View$OnClickListener;)Landroid/widget/Button;

    move-result-object v4

    invoke-virtual {v0, v4}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    iget-object v4, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    invoke-virtual {v4}, Lbr/com/guerravpn/crediflow/Ui;->card()Landroid/widget/LinearLayout;

    move-result-object v4

    .local v4, "docs":Landroid/widget/LinearLayout;
    iget-object v5, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v6, "Documentos"

    invoke-virtual {v5, v4, v6}, Lbr/com/guerravpn/crediflow/Ui;->cardTitle(Landroid/widget/LinearLayout;Ljava/lang/String;)V

    iget-object v5, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v6, "Envie frente e verso da identidade e um comprovante de renda."

    invoke-virtual {v5, v4, v6}, Lbr/com/guerravpn/crediflow/Ui;->body(Landroid/widget/LinearLayout;Ljava/lang/String;)Landroid/widget/TextView;

    iget-object v5, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    new-instance v6, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda27;

    invoke-direct {v6, p0}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda27;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;)V

    const-string v7, "Documento \u00b7 frente"

    invoke-virtual {v5, v7, v6}, Lbr/com/guerravpn/crediflow/Ui;->outline(Ljava/lang/String;Landroid/view/View$OnClickListener;)Landroid/widget/Button;

    move-result-object v5

    invoke-virtual {v4, v5}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    iget-object v5, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    new-instance v6, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda28;

    invoke-direct {v6, p0}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda28;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;)V

    const-string v7, "Documento \u00b7 verso"

    invoke-virtual {v5, v7, v6}, Lbr/com/guerravpn/crediflow/Ui;->outline(Ljava/lang/String;Landroid/view/View$OnClickListener;)Landroid/widget/Button;

    move-result-object v5

    invoke-virtual {v4, v5}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    iget-object v5, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    new-instance v6, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda29;

    invoke-direct {v6, p0}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda29;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;)V

    const-string v7, "Comprovante de renda"

    invoke-virtual {v5, v7, v6}, Lbr/com/guerravpn/crediflow/Ui;->outline(Ljava/lang/String;Landroid/view/View$OnClickListener;)Landroid/widget/Button;

    move-result-object v5

    invoke-virtual {v4, v5}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    invoke-virtual {v0, v4}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    iget-object v5, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->io:Ljava/util/concurrent/ExecutorService;

    new-instance v6, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda30;

    invoke-direct {v6, p0, v1, v2, v3}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda30;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;Landroid/widget/LinearLayout;Landroid/widget/ProgressBar;Landroid/widget/TextView;)V

    invoke-interface {v5, v6}, Ljava/util/concurrent/ExecutorService;->execute(Ljava/lang/Runnable;)V

    return-void
.end method

.method showTracking()V
    .locals 5

    .line 44
    iget-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->pendingId:Ljava/lang/String;

    if-eqz v0, :cond_0

    iget-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->pendingId:Ljava/lang/String;

    invoke-virtual {v0}, Ljava/lang/String;->isEmpty()Z

    move-result v0

    if-nez v0, :cond_0

    iget-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->pendingSecret:Ljava/lang/String;

    if-eqz v0, :cond_0

    iget-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->pendingSecret:Ljava/lang/String;

    invoke-virtual {v0}, Ljava/lang/String;->isEmpty()Z

    move-result v0

    if-nez v0, :cond_0

    invoke-virtual {p0}, Lbr/com/guerravpn/crediflow/MainActivityV06;->showStatus()V

    return-void

    :cond_0
    iget-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    invoke-virtual {v0}, Lbr/com/guerravpn/crediflow/Ui;->page()Landroid/widget/LinearLayout;

    move-result-object v0

    .local v0, "r":Landroid/widget/LinearLayout;
    iget-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    new-instance v2, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda33;

    invoke-direct {v2, p0}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda33;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;)V

    invoke-virtual {v1, v0, v2}, Lbr/com/guerravpn/crediflow/Ui;->back(Landroid/widget/LinearLayout;Ljava/lang/Runnable;)V

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v2, "Acompanhar solicita\u00e7\u00e3o"

    const/16 v3, 0x1e

    invoke-virtual {v1, v0, v2, v3}, Lbr/com/guerravpn/crediflow/Ui;->title(Landroid/widget/LinearLayout;Ljava/lang/String;I)Landroid/widget/TextView;

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v2, "N\u00e3o h\u00e1 uma solicita\u00e7\u00e3o salva neste aparelho no momento."

    invoke-virtual {v1, v0, v2}, Lbr/com/guerravpn/crediflow/Ui;->body(Landroid/widget/LinearLayout;Ljava/lang/String;)Landroid/widget/TextView;

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    invoke-virtual {v1}, Lbr/com/guerravpn/crediflow/Ui;->card()Landroid/widget/LinearLayout;

    move-result-object v1

    .local v1, "c":Landroid/widget/LinearLayout;
    iget-object v2, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v3, "Como acompanhar"

    invoke-virtual {v2, v1, v3}, Lbr/com/guerravpn/crediflow/Ui;->cardTitle(Landroid/widget/LinearLayout;Ljava/lang/String;)V

    iget-object v2, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v3, "Ao enviar um novo cadastro, o CrediFlow salva o acompanhamento neste aparelho e mant\u00e9m o bot\u00e3o dispon\u00edvel mesmo depois da ativa\u00e7\u00e3o da conta."

    invoke-virtual {v2, v1, v3}, Lbr/com/guerravpn/crediflow/Ui;->body(Landroid/widget/LinearLayout;Ljava/lang/String;)Landroid/widget/TextView;

    iget-object v2, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    new-instance v3, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda3;

    invoke-direct {v3, p0}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda3;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;)V

    const-string v4, "Criar cadastro"

    invoke-virtual {v2, v4, v3}, Lbr/com/guerravpn/crediflow/Ui;->primary(Ljava/lang/String;Landroid/view/View$OnClickListener;)Landroid/widget/Button;

    move-result-object v2

    invoke-virtual {v1, v2}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    iget-object v2, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    new-instance v3, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda4;

    invoke-direct {v3, p0}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda4;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;)V

    const-string v4, "Entrar na minha conta"

    invoke-virtual {v2, v4, v3}, Lbr/com/guerravpn/crediflow/Ui;->outline(Ljava/lang/String;Landroid/view/View$OnClickListener;)Landroid/widget/Button;

    move-result-object v2

    invoke-virtual {v1, v2}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    invoke-virtual {v0, v1}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    return-void
.end method

.method showWelcome()V
    .locals 4

    .line 43
    iget-object v0, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    invoke-virtual {v0}, Lbr/com/guerravpn/crediflow/Ui;->page()Landroid/widget/LinearLayout;

    move-result-object v0

    .local v0, "r":Landroid/widget/LinearLayout;
    iget-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const/16 v2, 0x2a

    invoke-virtual {v1, v0, v2}, Lbr/com/guerravpn/crediflow/Ui;->spacer(Landroid/widget/LinearLayout;I)V

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    invoke-virtual {v1, v0}, Lbr/com/guerravpn/crediflow/Ui;->logo(Landroid/widget/LinearLayout;)V

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const/16 v2, 0x22

    invoke-virtual {v1, v0, v2}, Lbr/com/guerravpn/crediflow/Ui;->spacer(Landroid/widget/LinearLayout;I)V

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v2, "CREDIFLOW"

    invoke-virtual {v1, v0, v2}, Lbr/com/guerravpn/crediflow/Ui;->eyebrow(Landroid/widget/LinearLayout;Ljava/lang/String;)V

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v2, "Cr\u00e9dito simples,\nan\u00e1lise clara."

    const/16 v3, 0x26

    invoke-virtual {v1, v0, v2, v3}, Lbr/com/guerravpn/crediflow/Ui;->title(Landroid/widget/LinearLayout;Ljava/lang/String;I)Landroid/widget/TextView;

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v2, "Vers\u00e3o 1.9 \u00b7 build 19"

    invoke-virtual {v1, v0, v2}, Lbr/com/guerravpn/crediflow/Ui;->body(Landroid/widget/LinearLayout;Ljava/lang/String;)Landroid/widget/TextView;

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const/16 v2, 0x14

    invoke-virtual {v1, v0, v2}, Lbr/com/guerravpn/crediflow/Ui;->spacer(Landroid/widget/LinearLayout;I)V

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    new-instance v2, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda0;

    invoke-direct {v2, p0}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda0;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;)V

    const-string v3, "Criar cadastro"

    invoke-virtual {v1, v3, v2}, Lbr/com/guerravpn/crediflow/Ui;->primary(Ljava/lang/String;Landroid/view/View$OnClickListener;)Landroid/widget/Button;

    move-result-object v1

    invoke-virtual {v0, v1}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    new-instance v2, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda11;

    invoke-direct {v2, p0}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda11;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;)V

    const-string v3, "Entrar na minha conta"

    invoke-virtual {v1, v3, v2}, Lbr/com/guerravpn/crediflow/Ui;->outline(Ljava/lang/String;Landroid/view/View$OnClickListener;)Landroid/widget/Button;

    move-result-object v1

    invoke-virtual {v0, v1}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    new-instance v2, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda22;

    invoke-direct {v2, p0}, Lbr/com/guerravpn/crediflow/MainActivityV06$$ExternalSyntheticLambda22;-><init>(Lbr/com/guerravpn/crediflow/MainActivityV06;)V

    const-string v3, "Acompanhar solicita\u00e7\u00e3o"

    invoke-virtual {v1, v3, v2}, Lbr/com/guerravpn/crediflow/Ui;->outline(Ljava/lang/String;Landroid/view/View$OnClickListener;)Landroid/widget/Button;

    move-result-object v1

    invoke-virtual {v0, v1}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    invoke-virtual {v1}, Lbr/com/guerravpn/crediflow/Ui;->card()Landroid/widget/LinearLayout;

    move-result-object v1

    .local v1, "c":Landroid/widget/LinearLayout;
    iget-object v2, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v3, "Fluxo da conta"

    invoke-virtual {v2, v1, v3}, Lbr/com/guerravpn/crediflow/Ui;->cardTitle(Landroid/widget/LinearLayout;Ljava/lang/String;)V

    iget-object v2, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v3, "Cadastro \u2192 documentos \u2192 an\u00e1lise manual \u2192 aprova\u00e7\u00e3o \u2192 c\u00f3digo por e-mail \u2192 cria\u00e7\u00e3o de senha."

    invoke-virtual {v2, v1, v3}, Lbr/com/guerravpn/crediflow/Ui;->body(Landroid/widget/LinearLayout;Ljava/lang/String;)Landroid/widget/TextView;

    invoke-virtual {v0, v1}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    iget-object v2, p0, Lbr/com/guerravpn/crediflow/MainActivityV06;->u:Lbr/com/guerravpn/crediflow/Ui;

    const-string v3, "CrediFlow \u00b7 1.9 \u00b7 build 19 Pro"

    invoke-virtual {v2, v0, v3}, Lbr/com/guerravpn/crediflow/Ui;->caption(Landroid/widget/LinearLayout;Ljava/lang/String;)V

    return-void
.end method
