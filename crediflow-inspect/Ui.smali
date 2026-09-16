.class final Lbr/com/guerravpn/crediflow/Ui;
.super Ljava/lang/Object;
.source "Ui.java"


# static fields
.field static final AMBER:I

.field static final BLUE:I

.field static final CARD:I

.field static final CARD2:I

.field static final GREEN:I

.field static final MUTED:I

.field static final NAVY:I

.field static final RED:I

.field static final WHITE:I


# instance fields
.field private final a:Lbr/com/guerravpn/crediflow/MainActivityV06;


# direct methods
.method static constructor <clinit>()V
    .locals 4

    .line 21
    const/16 v0, 0x14

    const/16 v1, 0x26

    const/4 v2, 0x6

    invoke-static {v2, v0, v1}, Landroid/graphics/Color;->rgb(III)I

    move-result v0

    sput v0, Lbr/com/guerravpn/crediflow/Ui;->NAVY:I

    const/16 v0, 0x3c

    const/16 v1, 0xe

    const/16 v2, 0x24

    invoke-static {v1, v2, v0}, Landroid/graphics/Color;->rgb(III)I

    move-result v0

    sput v0, Lbr/com/guerravpn/crediflow/Ui;->CARD:I

    const/16 v0, 0x2d

    const/16 v1, 0x49

    const/16 v3, 0x12

    invoke-static {v3, v0, v1}, Landroid/graphics/Color;->rgb(III)I

    move-result v0

    sput v0, Lbr/com/guerravpn/crediflow/Ui;->CARD2:I

    const/16 v0, 0x84

    const/16 v1, 0xff

    invoke-static {v2, v0, v1}, Landroid/graphics/Color;->rgb(III)I

    move-result v0

    sput v0, Lbr/com/guerravpn/crediflow/Ui;->BLUE:I

    const/16 v0, 0xf9

    const/16 v2, 0xfc

    const/16 v3, 0xf7

    invoke-static {v3, v0, v2}, Landroid/graphics/Color;->rgb(III)I

    move-result v0

    sput v0, Lbr/com/guerravpn/crediflow/Ui;->WHITE:I

    const/16 v0, 0xb8

    const/16 v2, 0xcd

    const/16 v3, 0xa9

    invoke-static {v3, v0, v2}, Landroid/graphics/Color;->rgb(III)I

    move-result v0

    sput v0, Lbr/com/guerravpn/crediflow/Ui;->MUTED:I

    const/16 v0, 0xc9

    const/16 v2, 0x89

    const/16 v3, 0x2c

    invoke-static {v3, v0, v2}, Landroid/graphics/Color;->rgb(III)I

    move-result v0

    sput v0, Lbr/com/guerravpn/crediflow/Ui;->GREEN:I

    const/16 v0, 0xb7

    const/16 v2, 0x3b

    const/16 v3, 0xf4

    invoke-static {v3, v0, v2}, Landroid/graphics/Color;->rgb(III)I

    move-result v0

    sput v0, Lbr/com/guerravpn/crediflow/Ui;->AMBER:I

    const/16 v0, 0x6b

    invoke-static {v1, v0, v0}, Landroid/graphics/Color;->rgb(III)I

    move-result v0

    sput v0, Lbr/com/guerravpn/crediflow/Ui;->RED:I

    return-void
.end method

.method constructor <init>(Lbr/com/guerravpn/crediflow/MainActivityV06;)V
    .locals 0
    .param p1, "a"    # Lbr/com/guerravpn/crediflow/MainActivityV06;

    .line 23
    invoke-direct {p0}, Ljava/lang/Object;-><init>()V

    iput-object p1, p0, Lbr/com/guerravpn/crediflow/Ui;->a:Lbr/com/guerravpn/crediflow/MainActivityV06;

    return-void
.end method

.method private button(Ljava/lang/String;IILandroid/view/View$OnClickListener;Z)Landroid/widget/Button;
    .locals 6
    .param p1, "x"    # Ljava/lang/String;
    .param p2, "c"    # I
    .param p3, "tc"    # I
    .param p4, "l"    # Landroid/view/View$OnClickListener;
    .param p5, "border"    # Z

    .line 38
    new-instance v0, Landroid/widget/Button;

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/Ui;->a:Lbr/com/guerravpn/crediflow/MainActivityV06;

    invoke-direct {v0, v1}, Landroid/widget/Button;-><init>(Landroid/content/Context;)V

    .local v0, "b":Landroid/widget/Button;
    invoke-virtual {v0, p1}, Landroid/widget/Button;->setText(Ljava/lang/CharSequence;)V

    const/4 v1, 0x0

    invoke-virtual {v0, v1}, Landroid/widget/Button;->setAllCaps(Z)V

    const/high16 v1, 0x41800000    # 16.0f

    invoke-virtual {v0, v1}, Landroid/widget/Button;->setTextSize(F)V

    sget-object v1, Landroid/graphics/Typeface;->DEFAULT:Landroid/graphics/Typeface;

    const/4 v2, 0x1

    invoke-virtual {v0, v1, v2}, Landroid/widget/Button;->setTypeface(Landroid/graphics/Typeface;I)V

    invoke-virtual {v0, p3}, Landroid/widget/Button;->setTextColor(I)V

    const/16 v1, 0x16

    invoke-virtual {p0, p2, v1}, Lbr/com/guerravpn/crediflow/Ui;->bg(II)Landroid/graphics/drawable/GradientDrawable;

    move-result-object v1

    .local v1, "g":Landroid/graphics/drawable/GradientDrawable;
    if-eqz p5, :cond_0

    invoke-virtual {p0, v2}, Lbr/com/guerravpn/crediflow/Ui;->dp(I)I

    move-result v2

    const/16 v3, 0x62

    const/16 v4, 0x7c

    const/16 v5, 0x51

    invoke-static {v5, v3, v4}, Landroid/graphics/Color;->rgb(III)I

    move-result v3

    invoke-virtual {v1, v2, v3}, Landroid/graphics/drawable/GradientDrawable;->setStroke(II)V

    :cond_0
    invoke-virtual {v0, v1}, Landroid/widget/Button;->setBackground(Landroid/graphics/drawable/Drawable;)V

    if-eqz p4, :cond_1

    invoke-virtual {v0, p4}, Landroid/widget/Button;->setOnClickListener(Landroid/view/View$OnClickListener;)V

    :cond_1
    new-instance v2, Landroid/widget/LinearLayout$LayoutParams;

    const/16 v3, 0x3a

    invoke-virtual {p0, v3}, Lbr/com/guerravpn/crediflow/Ui;->dp(I)I

    move-result v3

    const/4 v4, -0x1

    invoke-direct {v2, v4, v3}, Landroid/widget/LinearLayout$LayoutParams;-><init>(II)V

    .local v2, "p":Landroid/widget/LinearLayout$LayoutParams;
    const/4 v3, 0x7

    invoke-virtual {p0, v3}, Lbr/com/guerravpn/crediflow/Ui;->dp(I)I

    move-result v3

    iput v3, v2, Landroid/widget/LinearLayout$LayoutParams;->topMargin:I

    const/4 v3, 0x4

    invoke-virtual {p0, v3}, Lbr/com/guerravpn/crediflow/Ui;->dp(I)I

    move-result v3

    iput v3, v2, Landroid/widget/LinearLayout$LayoutParams;->bottomMargin:I

    invoke-virtual {v0, v2}, Landroid/widget/Button;->setLayoutParams(Landroid/view/ViewGroup$LayoutParams;)V

    return-object v0
.end method

.method static synthetic lambda$back$0(Ljava/lang/Runnable;Landroid/view/View;)V
    .locals 0
    .param p0, "run"    # Ljava/lang/Runnable;
    .param p1, "v"    # Landroid/view/View;

    .line 46
    invoke-interface {p0}, Ljava/lang/Runnable;->run()V

    return-void
.end method


# virtual methods
.method back(Landroid/widget/LinearLayout;Ljava/lang/Runnable;)V
    .locals 4
    .param p1, "r"    # Landroid/widget/LinearLayout;
    .param p2, "run"    # Ljava/lang/Runnable;

    .line 46
    new-instance v0, Lbr/com/guerravpn/crediflow/Ui$$ExternalSyntheticLambda0;

    invoke-direct {v0, p2}, Lbr/com/guerravpn/crediflow/Ui$$ExternalSyntheticLambda0;-><init>(Ljava/lang/Runnable;)V

    const-string v1, "\u2190  Voltar"

    invoke-virtual {p0, v1, v0}, Lbr/com/guerravpn/crediflow/Ui;->outline(Ljava/lang/String;Landroid/view/View$OnClickListener;)Landroid/widget/Button;

    move-result-object v0

    .local v0, "b":Landroid/widget/Button;
    new-instance v1, Landroid/widget/LinearLayout$LayoutParams;

    const/16 v2, 0x2e

    invoke-virtual {p0, v2}, Lbr/com/guerravpn/crediflow/Ui;->dp(I)I

    move-result v2

    const/4 v3, -0x2

    invoke-direct {v1, v3, v2}, Landroid/widget/LinearLayout$LayoutParams;-><init>(II)V

    .local v1, "p":Landroid/widget/LinearLayout$LayoutParams;
    const/16 v2, 0xe

    invoke-virtual {p0, v2}, Lbr/com/guerravpn/crediflow/Ui;->dp(I)I

    move-result v2

    iput v2, v1, Landroid/widget/LinearLayout$LayoutParams;->bottomMargin:I

    invoke-virtual {v0, v1}, Landroid/widget/Button;->setLayoutParams(Landroid/view/ViewGroup$LayoutParams;)V

    invoke-virtual {p1, v0}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    return-void
.end method

.method badge(Ljava/lang/String;I)Landroid/widget/TextView;
    .locals 7
    .param p1, "x"    # Ljava/lang/String;
    .param p2, "c"    # I

    .line 44
    const/16 v0, 0xd

    const/4 v1, 0x1

    invoke-virtual {p0, p1, v0, p2, v1}, Lbr/com/guerravpn/crediflow/Ui;->text(Ljava/lang/String;IIZ)Landroid/widget/TextView;

    move-result-object v0

    .local v0, "t":Landroid/widget/TextView;
    const/16 v2, 0x11

    invoke-virtual {v0, v2}, Landroid/widget/TextView;->setGravity(I)V

    invoke-static {p2}, Landroid/graphics/Color;->red(I)I

    move-result v2

    invoke-static {p2}, Landroid/graphics/Color;->green(I)I

    move-result v3

    invoke-static {p2}, Landroid/graphics/Color;->blue(I)I

    move-result v4

    const/16 v5, 0x23

    invoke-static {v5, v2, v3, v4}, Landroid/graphics/Color;->argb(IIII)I

    move-result v2

    const/16 v3, 0x12

    invoke-virtual {p0, v2, v3}, Lbr/com/guerravpn/crediflow/Ui;->bg(II)Landroid/graphics/drawable/GradientDrawable;

    move-result-object v2

    .local v2, "g":Landroid/graphics/drawable/GradientDrawable;
    invoke-virtual {p0, v1}, Lbr/com/guerravpn/crediflow/Ui;->dp(I)I

    move-result v1

    invoke-static {p2}, Landroid/graphics/Color;->red(I)I

    move-result v3

    invoke-static {p2}, Landroid/graphics/Color;->green(I)I

    move-result v4

    invoke-static {p2}, Landroid/graphics/Color;->blue(I)I

    move-result v5

    const/16 v6, 0x78

    invoke-static {v6, v3, v4, v5}, Landroid/graphics/Color;->argb(IIII)I

    move-result v3

    invoke-virtual {v2, v1, v3}, Landroid/graphics/drawable/GradientDrawable;->setStroke(II)V

    invoke-virtual {v0, v2}, Landroid/widget/TextView;->setBackground(Landroid/graphics/drawable/Drawable;)V

    const/16 v1, 0xc

    invoke-virtual {p0, v1}, Lbr/com/guerravpn/crediflow/Ui;->dp(I)I

    move-result v3

    const/4 v4, 0x6

    invoke-virtual {p0, v4}, Lbr/com/guerravpn/crediflow/Ui;->dp(I)I

    move-result v5

    invoke-virtual {p0, v1}, Lbr/com/guerravpn/crediflow/Ui;->dp(I)I

    move-result v1

    invoke-virtual {p0, v4}, Lbr/com/guerravpn/crediflow/Ui;->dp(I)I

    move-result v4

    invoke-virtual {v0, v3, v5, v1, v4}, Landroid/widget/TextView;->setPadding(IIII)V

    new-instance v1, Landroid/widget/LinearLayout$LayoutParams;

    const/4 v3, -0x2

    invoke-direct {v1, v3, v3}, Landroid/widget/LinearLayout$LayoutParams;-><init>(II)V

    .local v1, "p":Landroid/widget/LinearLayout$LayoutParams;
    const/4 v3, 0x5

    invoke-virtual {p0, v3}, Lbr/com/guerravpn/crediflow/Ui;->dp(I)I

    move-result v3

    iput v3, v1, Landroid/widget/LinearLayout$LayoutParams;->topMargin:I

    const/4 v3, 0x7

    invoke-virtual {p0, v3}, Lbr/com/guerravpn/crediflow/Ui;->dp(I)I

    move-result v3

    iput v3, v1, Landroid/widget/LinearLayout$LayoutParams;->bottomMargin:I

    invoke-virtual {v0, v1}, Landroid/widget/TextView;->setLayoutParams(Landroid/view/ViewGroup$LayoutParams;)V

    return-object v0
.end method

.method bg(II)Landroid/graphics/drawable/GradientDrawable;
    .locals 2
    .param p1, "c"    # I
    .param p2, "r"    # I

    .line 25
    new-instance v0, Landroid/graphics/drawable/GradientDrawable;

    invoke-direct {v0}, Landroid/graphics/drawable/GradientDrawable;-><init>()V

    .local v0, "g":Landroid/graphics/drawable/GradientDrawable;
    invoke-virtual {v0, p1}, Landroid/graphics/drawable/GradientDrawable;->setColor(I)V

    invoke-virtual {p0, p2}, Lbr/com/guerravpn/crediflow/Ui;->dp(I)I

    move-result v1

    int-to-float v1, v1

    invoke-virtual {v0, v1}, Landroid/graphics/drawable/GradientDrawable;->setCornerRadius(F)V

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

.method caption(Landroid/widget/LinearLayout;Ljava/lang/String;)V
    .locals 4
    .param p1, "r"    # Landroid/widget/LinearLayout;
    .param p2, "x"    # Ljava/lang/String;

    .line 30
    sget v0, Lbr/com/guerravpn/crediflow/Ui;->MUTED:I

    const/16 v1, 0xd

    const/4 v2, 0x0

    invoke-virtual {p0, p2, v1, v0, v2}, Lbr/com/guerravpn/crediflow/Ui;->text(Ljava/lang/String;IIZ)Landroid/widget/TextView;

    move-result-object v0

    .local v0, "t":Landroid/widget/TextView;
    const/4 v1, 0x5

    invoke-virtual {p0, v1}, Lbr/com/guerravpn/crediflow/Ui;->dp(I)I

    move-result v1

    const/4 v3, 0x7

    invoke-virtual {p0, v3}, Lbr/com/guerravpn/crediflow/Ui;->dp(I)I

    move-result v3

    invoke-virtual {v0, v2, v1, v2, v3}, Landroid/widget/TextView;->setPadding(IIII)V

    invoke-virtual {p1, v0}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    return-void
.end method

.method card()Landroid/widget/LinearLayout;
    .locals 6

    .line 33
    new-instance v0, Landroid/widget/LinearLayout;

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/Ui;->a:Lbr/com/guerravpn/crediflow/MainActivityV06;

    invoke-direct {v0, v1}, Landroid/widget/LinearLayout;-><init>(Landroid/content/Context;)V

    .local v0, "l":Landroid/widget/LinearLayout;
    const/4 v1, 0x1

    invoke-virtual {v0, v1}, Landroid/widget/LinearLayout;->setOrientation(I)V

    const/16 v1, 0x12

    invoke-virtual {p0, v1}, Lbr/com/guerravpn/crediflow/Ui;->dp(I)I

    move-result v2

    invoke-virtual {p0, v1}, Lbr/com/guerravpn/crediflow/Ui;->dp(I)I

    move-result v3

    invoke-virtual {p0, v1}, Lbr/com/guerravpn/crediflow/Ui;->dp(I)I

    move-result v4

    invoke-virtual {p0, v1}, Lbr/com/guerravpn/crediflow/Ui;->dp(I)I

    move-result v5

    invoke-virtual {v0, v2, v3, v4, v5}, Landroid/widget/LinearLayout;->setPadding(IIII)V

    sget v2, Lbr/com/guerravpn/crediflow/Ui;->CARD:I

    invoke-virtual {p0, v2, v1}, Lbr/com/guerravpn/crediflow/Ui;->bg(II)Landroid/graphics/drawable/GradientDrawable;

    move-result-object v1

    invoke-virtual {v0, v1}, Landroid/widget/LinearLayout;->setBackground(Landroid/graphics/drawable/Drawable;)V

    new-instance v1, Landroid/widget/LinearLayout$LayoutParams;

    const/4 v2, -0x1

    const/4 v3, -0x2

    invoke-direct {v1, v2, v3}, Landroid/widget/LinearLayout$LayoutParams;-><init>(II)V

    .local v1, "p":Landroid/widget/LinearLayout$LayoutParams;
    const/16 v2, 0xa

    invoke-virtual {p0, v2}, Lbr/com/guerravpn/crediflow/Ui;->dp(I)I

    move-result v3

    iput v3, v1, Landroid/widget/LinearLayout$LayoutParams;->topMargin:I

    invoke-virtual {p0, v2}, Lbr/com/guerravpn/crediflow/Ui;->dp(I)I

    move-result v2

    iput v2, v1, Landroid/widget/LinearLayout$LayoutParams;->bottomMargin:I

    invoke-virtual {v0, v1}, Landroid/widget/LinearLayout;->setLayoutParams(Landroid/view/ViewGroup$LayoutParams;)V

    return-object v0
.end method

.method cardTitle(Landroid/widget/LinearLayout;Ljava/lang/String;)V
    .locals 3
    .param p1, "r"    # Landroid/widget/LinearLayout;
    .param p2, "x"    # Ljava/lang/String;

    .line 35
    sget v0, Lbr/com/guerravpn/crediflow/Ui;->WHITE:I

    const/4 v1, 0x1

    const/16 v2, 0x14

    invoke-virtual {p0, p2, v2, v0, v1}, Lbr/com/guerravpn/crediflow/Ui;->text(Ljava/lang/String;IIZ)Landroid/widget/TextView;

    move-result-object v0

    .local v0, "t":Landroid/widget/TextView;
    const/4 v1, 0x7

    invoke-virtual {p0, v1}, Lbr/com/guerravpn/crediflow/Ui;->dp(I)I

    move-result v1

    const/4 v2, 0x0

    invoke-virtual {v0, v2, v2, v2, v1}, Landroid/widget/TextView;->setPadding(IIII)V

    invoke-virtual {p1, v0}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    return-void
.end method

.method check(Ljava/lang/String;)Landroid/widget/CheckBox;
    .locals 4
    .param p1, "x"    # Ljava/lang/String;

    .line 40
    new-instance v0, Landroid/widget/CheckBox;

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/Ui;->a:Lbr/com/guerravpn/crediflow/MainActivityV06;

    invoke-direct {v0, v1}, Landroid/widget/CheckBox;-><init>(Landroid/content/Context;)V

    .local v0, "c":Landroid/widget/CheckBox;
    invoke-virtual {v0, p1}, Landroid/widget/CheckBox;->setText(Ljava/lang/CharSequence;)V

    sget v1, Lbr/com/guerravpn/crediflow/Ui;->MUTED:I

    invoke-virtual {v0, v1}, Landroid/widget/CheckBox;->setTextColor(I)V

    const/high16 v1, 0x41600000    # 14.0f

    invoke-virtual {v0, v1}, Landroid/widget/CheckBox;->setTextSize(F)V

    const/4 v1, 0x7

    invoke-virtual {p0, v1}, Lbr/com/guerravpn/crediflow/Ui;->dp(I)I

    move-result v2

    invoke-virtual {p0, v1}, Lbr/com/guerravpn/crediflow/Ui;->dp(I)I

    move-result v1

    const/4 v3, 0x0

    invoke-virtual {v0, v3, v2, v3, v1}, Landroid/widget/CheckBox;->setPadding(IIII)V

    return-object v0
.end method

.method dp(I)I
    .locals 2
    .param p1, "v"    # I

    .line 24
    int-to-float v0, p1

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/Ui;->a:Lbr/com/guerravpn/crediflow/MainActivityV06;

    invoke-virtual {v1}, Lbr/com/guerravpn/crediflow/MainActivityV06;->getResources()Landroid/content/res/Resources;

    move-result-object v1

    invoke-virtual {v1}, Landroid/content/res/Resources;->getDisplayMetrics()Landroid/util/DisplayMetrics;

    move-result-object v1

    iget v1, v1, Landroid/util/DisplayMetrics;->density:F

    mul-float/2addr v0, v1

    invoke-static {v0}, Ljava/lang/Math;->round(F)I

    move-result v0

    return v0
.end method

.method error()Landroid/widget/TextView;
    .locals 4

    .line 41
    sget v0, Lbr/com/guerravpn/crediflow/Ui;->RED:I

    const-string v1, ""

    const/16 v2, 0xe

    const/4 v3, 0x0

    invoke-virtual {p0, v1, v2, v0, v3}, Lbr/com/guerravpn/crediflow/Ui;->text(Ljava/lang/String;IIZ)Landroid/widget/TextView;

    move-result-object v0

    .local v0, "t":Landroid/widget/TextView;
    const/4 v1, 0x4

    invoke-virtual {p0, v1}, Lbr/com/guerravpn/crediflow/Ui;->dp(I)I

    move-result v2

    invoke-virtual {p0, v1}, Lbr/com/guerravpn/crediflow/Ui;->dp(I)I

    move-result v1

    invoke-virtual {v0, v3, v2, v3, v1}, Landroid/widget/TextView;->setPadding(IIII)V

    return-object v0
.end method

.method eyebrow(Landroid/widget/LinearLayout;Ljava/lang/String;)V
    .locals 3
    .param p1, "r"    # Landroid/widget/LinearLayout;
    .param p2, "x"    # Ljava/lang/String;

    .line 31
    sget v0, Lbr/com/guerravpn/crediflow/Ui;->BLUE:I

    const/4 v1, 0x1

    const/16 v2, 0xe

    invoke-virtual {p0, p2, v2, v0, v1}, Lbr/com/guerravpn/crediflow/Ui;->text(Ljava/lang/String;IIZ)Landroid/widget/TextView;

    move-result-object v0

    .local v0, "t":Landroid/widget/TextView;
    invoke-virtual {p1, v0}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    return-void
.end method

.method input(Ljava/lang/String;I)Landroid/widget/EditText;
    .locals 4
    .param p1, "h"    # Ljava/lang/String;
    .param p2, "type"    # I

    .line 39
    new-instance v0, Landroid/widget/EditText;

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/Ui;->a:Lbr/com/guerravpn/crediflow/MainActivityV06;

    invoke-direct {v0, v1}, Landroid/widget/EditText;-><init>(Landroid/content/Context;)V

    .local v0, "e":Landroid/widget/EditText;
    invoke-virtual {v0, p1}, Landroid/widget/EditText;->setHint(Ljava/lang/CharSequence;)V

    const/16 v1, 0x91

    const/16 v2, 0xaa

    const/16 v3, 0x7d

    invoke-static {v3, v1, v2}, Landroid/graphics/Color;->rgb(III)I

    move-result v1

    invoke-virtual {v0, v1}, Landroid/widget/EditText;->setHintTextColor(I)V

    sget v1, Lbr/com/guerravpn/crediflow/Ui;->WHITE:I

    invoke-virtual {v0, v1}, Landroid/widget/EditText;->setTextColor(I)V

    const/high16 v1, 0x41800000    # 16.0f

    invoke-virtual {v0, v1}, Landroid/widget/EditText;->setTextSize(F)V

    invoke-virtual {v0, p2}, Landroid/widget/EditText;->setInputType(I)V

    const/high16 v1, 0x20000

    and-int/2addr v1, p2

    const/4 v2, 0x0

    if-nez v1, :cond_0

    const/4 v1, 0x1

    goto :goto_0

    :cond_0
    move v1, v2

    :goto_0
    invoke-virtual {v0, v1}, Landroid/widget/EditText;->setSingleLine(Z)V

    const/16 v1, 0x10

    invoke-virtual {p0, v1}, Lbr/com/guerravpn/crediflow/Ui;->dp(I)I

    move-result v3

    invoke-virtual {p0, v1}, Lbr/com/guerravpn/crediflow/Ui;->dp(I)I

    move-result v1

    invoke-virtual {v0, v3, v2, v1, v2}, Landroid/widget/EditText;->setPadding(IIII)V

    sget v1, Lbr/com/guerravpn/crediflow/Ui;->CARD2:I

    const/16 v2, 0xe

    invoke-virtual {p0, v1, v2}, Lbr/com/guerravpn/crediflow/Ui;->bg(II)Landroid/graphics/drawable/GradientDrawable;

    move-result-object v1

    invoke-virtual {v0, v1}, Landroid/widget/EditText;->setBackground(Landroid/graphics/drawable/Drawable;)V

    new-instance v1, Landroid/widget/LinearLayout$LayoutParams;

    const/16 v2, 0x3a

    invoke-virtual {p0, v2}, Lbr/com/guerravpn/crediflow/Ui;->dp(I)I

    move-result v2

    const/4 v3, -0x1

    invoke-direct {v1, v3, v2}, Landroid/widget/LinearLayout$LayoutParams;-><init>(II)V

    .local v1, "p":Landroid/widget/LinearLayout$LayoutParams;
    const/4 v2, 0x6

    invoke-virtual {p0, v2}, Lbr/com/guerravpn/crediflow/Ui;->dp(I)I

    move-result v2

    iput v2, v1, Landroid/widget/LinearLayout$LayoutParams;->topMargin:I

    const/4 v2, 0x5

    invoke-virtual {p0, v2}, Lbr/com/guerravpn/crediflow/Ui;->dp(I)I

    move-result v2

    iput v2, v1, Landroid/widget/LinearLayout$LayoutParams;->bottomMargin:I

    invoke-virtual {v0, v1}, Landroid/widget/EditText;->setLayoutParams(Landroid/view/ViewGroup$LayoutParams;)V

    return-object v0
.end method

.method logo(Landroid/widget/LinearLayout;)V
    .locals 9
    .param p1, "r"    # Landroid/widget/LinearLayout;

    .line 45
    new-instance v0, Landroid/widget/LinearLayout;

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/Ui;->a:Lbr/com/guerravpn/crediflow/MainActivityV06;

    invoke-direct {v0, v1}, Landroid/widget/LinearLayout;-><init>(Landroid/content/Context;)V

    .local v0, "row":Landroid/widget/LinearLayout;
    const/16 v1, 0x10

    invoke-virtual {v0, v1}, Landroid/widget/LinearLayout;->setGravity(I)V

    sget v2, Lbr/com/guerravpn/crediflow/Ui;->WHITE:I

    const-string v3, "CF"

    const/16 v4, 0x1a

    const/4 v5, 0x1

    invoke-virtual {p0, v3, v4, v2, v5}, Lbr/com/guerravpn/crediflow/Ui;->text(Ljava/lang/String;IIZ)Landroid/widget/TextView;

    move-result-object v2

    .local v2, "c":Landroid/widget/TextView;
    const/16 v3, 0x11

    invoke-virtual {v2, v3}, Landroid/widget/TextView;->setGravity(I)V

    const/16 v3, 0x46

    const/16 v4, 0xe5

    const/16 v6, 0x4f

    invoke-static {v6, v3, v4}, Landroid/graphics/Color;->rgb(III)I

    move-result v3

    const/16 v4, 0x12

    invoke-virtual {p0, v3, v4}, Lbr/com/guerravpn/crediflow/Ui;->bg(II)Landroid/graphics/drawable/GradientDrawable;

    move-result-object v3

    .local v3, "mark":Landroid/graphics/drawable/GradientDrawable;
    const/4 v4, 0x2

    invoke-virtual {p0, v4}, Lbr/com/guerravpn/crediflow/Ui;->dp(I)I

    move-result v4

    const/16 v6, 0x5c

    const/16 v7, 0xf6

    const/16 v8, 0x8b

    invoke-static {v8, v6, v7}, Landroid/graphics/Color;->rgb(III)I

    move-result v6

    invoke-virtual {v3, v4, v6}, Landroid/graphics/drawable/GradientDrawable;->setStroke(II)V

    invoke-virtual {v2, v3}, Landroid/widget/TextView;->setBackground(Landroid/graphics/drawable/Drawable;)V

    new-instance v4, Landroid/widget/LinearLayout$LayoutParams;

    const/16 v6, 0x4c

    invoke-virtual {p0, v6}, Lbr/com/guerravpn/crediflow/Ui;->dp(I)I

    move-result v7

    invoke-virtual {p0, v6}, Lbr/com/guerravpn/crediflow/Ui;->dp(I)I

    move-result v6

    invoke-direct {v4, v7, v6}, Landroid/widget/LinearLayout$LayoutParams;-><init>(II)V

    invoke-virtual {v0, v2, v4}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;Landroid/view/ViewGroup$LayoutParams;)V

    new-instance v4, Landroid/widget/LinearLayout;

    iget-object v6, p0, Lbr/com/guerravpn/crediflow/Ui;->a:Lbr/com/guerravpn/crediflow/MainActivityV06;

    invoke-direct {v4, v6}, Landroid/widget/LinearLayout;-><init>(Landroid/content/Context;)V

    .local v4, "words":Landroid/widget/LinearLayout;
    invoke-virtual {v4, v5}, Landroid/widget/LinearLayout;->setOrientation(I)V

    invoke-virtual {p0, v1}, Lbr/com/guerravpn/crediflow/Ui;->dp(I)I

    move-result v1

    const/4 v6, 0x0

    invoke-virtual {v4, v1, v6, v6, v6}, Landroid/widget/LinearLayout;->setPadding(IIII)V

    const/16 v1, 0x1f

    sget v7, Lbr/com/guerravpn/crediflow/Ui;->WHITE:I

    const-string v8, "CrediFlow"

    invoke-virtual {p0, v8, v1, v7, v5}, Lbr/com/guerravpn/crediflow/Ui;->text(Ljava/lang/String;IIZ)Landroid/widget/TextView;

    move-result-object v1

    invoke-virtual {v4, v1}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    const/16 v1, 0xe

    sget v5, Lbr/com/guerravpn/crediflow/Ui;->MUTED:I

    const-string v7, "Cr\u00e9dito que impulsiona voc\u00ea"

    invoke-virtual {p0, v7, v1, v5, v6}, Lbr/com/guerravpn/crediflow/Ui;->text(Ljava/lang/String;IIZ)Landroid/widget/TextView;

    move-result-object v1

    invoke-virtual {v4, v1}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    new-instance v1, Landroid/widget/LinearLayout$LayoutParams;

    const/4 v5, -0x2

    const/high16 v7, 0x3f800000    # 1.0f

    invoke-direct {v1, v6, v5, v7}, Landroid/widget/LinearLayout$LayoutParams;-><init>(IIF)V

    invoke-virtual {v0, v4, v1}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;Landroid/view/ViewGroup$LayoutParams;)V

    invoke-virtual {p1, v0}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    return-void
.end method

.method mini()Landroid/widget/LinearLayout;
    .locals 3

    .line 34
    invoke-virtual {p0}, Lbr/com/guerravpn/crediflow/Ui;->card()Landroid/widget/LinearLayout;

    move-result-object v0

    .local v0, "l":Landroid/widget/LinearLayout;
    sget v1, Lbr/com/guerravpn/crediflow/Ui;->CARD2:I

    const/16 v2, 0xe

    invoke-virtual {p0, v1, v2}, Lbr/com/guerravpn/crediflow/Ui;->bg(II)Landroid/graphics/drawable/GradientDrawable;

    move-result-object v1

    invoke-virtual {v0, v1}, Landroid/widget/LinearLayout;->setBackground(Landroid/graphics/drawable/Drawable;)V

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

.method page()Landroid/widget/LinearLayout;
    .locals 7

    .line 26
    new-instance v0, Landroid/widget/FrameLayout;

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/Ui;->a:Lbr/com/guerravpn/crediflow/MainActivityV06;

    invoke-direct {v0, v1}, Landroid/widget/FrameLayout;-><init>(Landroid/content/Context;)V

    .local v0, "f":Landroid/widget/FrameLayout;
    sget v1, Lbr/com/guerravpn/crediflow/Ui;->NAVY:I

    invoke-virtual {v0, v1}, Landroid/widget/FrameLayout;->setBackgroundColor(I)V

    new-instance v1, Landroid/widget/ScrollView;

    iget-object v2, p0, Lbr/com/guerravpn/crediflow/Ui;->a:Lbr/com/guerravpn/crediflow/MainActivityV06;

    invoke-direct {v1, v2}, Landroid/widget/ScrollView;-><init>(Landroid/content/Context;)V

    .local v1, "s":Landroid/widget/ScrollView;
    const/4 v2, 0x1

    invoke-virtual {v1, v2}, Landroid/widget/ScrollView;->setFillViewport(Z)V

    new-instance v3, Landroid/widget/LinearLayout;

    iget-object v4, p0, Lbr/com/guerravpn/crediflow/Ui;->a:Lbr/com/guerravpn/crediflow/MainActivityV06;

    invoke-direct {v3, v4}, Landroid/widget/LinearLayout;-><init>(Landroid/content/Context;)V

    .local v3, "l":Landroid/widget/LinearLayout;
    invoke-virtual {v3, v2}, Landroid/widget/LinearLayout;->setOrientation(I)V

    const/16 v2, 0x18

    invoke-virtual {p0, v2}, Lbr/com/guerravpn/crediflow/Ui;->dp(I)I

    move-result v4

    invoke-virtual {p0, v2}, Lbr/com/guerravpn/crediflow/Ui;->dp(I)I

    move-result v5

    invoke-virtual {p0, v2}, Lbr/com/guerravpn/crediflow/Ui;->dp(I)I

    move-result v2

    const/16 v6, 0x30

    invoke-virtual {p0, v6}, Lbr/com/guerravpn/crediflow/Ui;->dp(I)I

    move-result v6

    invoke-virtual {v3, v4, v5, v2, v6}, Landroid/widget/LinearLayout;->setPadding(IIII)V

    new-instance v2, Landroid/widget/FrameLayout$LayoutParams;

    const/4 v4, -0x2

    const/4 v5, -0x1

    invoke-direct {v2, v5, v4}, Landroid/widget/FrameLayout$LayoutParams;-><init>(II)V

    invoke-virtual {v1, v3, v2}, Landroid/widget/ScrollView;->addView(Landroid/view/View;Landroid/view/ViewGroup$LayoutParams;)V

    new-instance v2, Landroid/widget/FrameLayout$LayoutParams;

    invoke-direct {v2, v5, v5}, Landroid/widget/FrameLayout$LayoutParams;-><init>(II)V

    invoke-virtual {v0, v1, v2}, Landroid/widget/FrameLayout;->addView(Landroid/view/View;Landroid/view/ViewGroup$LayoutParams;)V

    iget-object v2, p0, Lbr/com/guerravpn/crediflow/Ui;->a:Lbr/com/guerravpn/crediflow/MainActivityV06;

    invoke-virtual {v2, v0}, Lbr/com/guerravpn/crediflow/MainActivityV06;->setContentView(Landroid/view/View;)V

    return-object v3
.end method

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

.method spacer(Landroid/widget/LinearLayout;I)V
    .locals 4
    .param p1, "r"    # Landroid/widget/LinearLayout;
    .param p2, "h"    # I

    .line 32
    new-instance v0, Landroid/view/View;

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/Ui;->a:Lbr/com/guerravpn/crediflow/MainActivityV06;

    invoke-direct {v0, v1}, Landroid/view/View;-><init>(Landroid/content/Context;)V

    new-instance v1, Landroid/widget/LinearLayout$LayoutParams;

    const/4 v2, 0x1

    invoke-virtual {p0, p2}, Lbr/com/guerravpn/crediflow/Ui;->dp(I)I

    move-result v3

    invoke-direct {v1, v2, v3}, Landroid/widget/LinearLayout$LayoutParams;-><init>(II)V

    invoke-virtual {p1, v0, v1}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;Landroid/view/ViewGroup$LayoutParams;)V

    return-void
.end method

.method spinner([Ljava/lang/String;)Landroid/widget/Spinner;
    .locals 5
    .param p1, "v"    # [Ljava/lang/String;

    .line 42
    new-instance v0, Landroid/widget/Spinner;

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/Ui;->a:Lbr/com/guerravpn/crediflow/MainActivityV06;

    invoke-direct {v0, v1}, Landroid/widget/Spinner;-><init>(Landroid/content/Context;)V

    .local v0, "s":Landroid/widget/Spinner;
    new-instance v1, Lbr/com/guerravpn/crediflow/Ui$1;

    iget-object v2, p0, Lbr/com/guerravpn/crediflow/Ui;->a:Lbr/com/guerravpn/crediflow/MainActivityV06;

    const v3, 0x1090008

    invoke-direct {v1, p0, v2, v3, p1}, Lbr/com/guerravpn/crediflow/Ui$1;-><init>(Lbr/com/guerravpn/crediflow/Ui;Landroid/content/Context;I[Ljava/lang/String;)V

    .local v1, "ad":Landroid/widget/ArrayAdapter;, "Landroid/widget/ArrayAdapter<Ljava/lang/String;>;"
    const v2, 0x1090009

    invoke-virtual {v1, v2}, Landroid/widget/ArrayAdapter;->setDropDownViewResource(I)V

    invoke-virtual {v0, v1}, Landroid/widget/Spinner;->setAdapter(Landroid/widget/SpinnerAdapter;)V

    sget v2, Lbr/com/guerravpn/crediflow/Ui;->CARD2:I

    const/16 v3, 0xe

    invoke-virtual {p0, v2, v3}, Lbr/com/guerravpn/crediflow/Ui;->bg(II)Landroid/graphics/drawable/GradientDrawable;

    move-result-object v2

    invoke-virtual {v0, v2}, Landroid/widget/Spinner;->setBackground(Landroid/graphics/drawable/Drawable;)V

    new-instance v2, Landroid/widget/LinearLayout$LayoutParams;

    const/16 v3, 0x3a

    invoke-virtual {p0, v3}, Lbr/com/guerravpn/crediflow/Ui;->dp(I)I

    move-result v3

    const/4 v4, -0x1

    invoke-direct {v2, v4, v3}, Landroid/widget/LinearLayout$LayoutParams;-><init>(II)V

    invoke-virtual {v0, v2}, Landroid/widget/Spinner;->setLayoutParams(Landroid/view/ViewGroup$LayoutParams;)V

    return-object v0
.end method

.method stat(Landroid/widget/LinearLayout;Ljava/lang/String;Ljava/lang/String;)V
    .locals 7
    .param p1, "r"    # Landroid/widget/LinearLayout;
    .param p2, "k"    # Ljava/lang/String;
    .param p3, "v"    # Ljava/lang/String;

    .line 43
    new-instance v0, Landroid/widget/LinearLayout;

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/Ui;->a:Lbr/com/guerravpn/crediflow/MainActivityV06;

    invoke-direct {v0, v1}, Landroid/widget/LinearLayout;-><init>(Landroid/content/Context;)V

    .local v0, "row":Landroid/widget/LinearLayout;
    const/4 v1, 0x0

    invoke-virtual {v0, v1}, Landroid/widget/LinearLayout;->setOrientation(I)V

    sget v2, Lbr/com/guerravpn/crediflow/Ui;->MUTED:I

    const/16 v3, 0xe

    invoke-virtual {p0, p2, v3, v2, v1}, Lbr/com/guerravpn/crediflow/Ui;->text(Ljava/lang/String;IIZ)Landroid/widget/TextView;

    move-result-object v2

    .local v2, "a1":Landroid/widget/TextView;
    sget v4, Lbr/com/guerravpn/crediflow/Ui;->WHITE:I

    const/4 v5, 0x1

    invoke-virtual {p0, p3, v3, v4, v5}, Lbr/com/guerravpn/crediflow/Ui;->text(Ljava/lang/String;IIZ)Landroid/widget/TextView;

    move-result-object v3

    .local v3, "a2":Landroid/widget/TextView;
    const v4, 0x800005

    invoke-virtual {v3, v4}, Landroid/widget/TextView;->setGravity(I)V

    new-instance v4, Landroid/widget/LinearLayout$LayoutParams;

    const/4 v5, -0x2

    const/high16 v6, 0x3f800000    # 1.0f

    invoke-direct {v4, v1, v5, v6}, Landroid/widget/LinearLayout$LayoutParams;-><init>(IIF)V

    invoke-virtual {v0, v2, v4}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;Landroid/view/ViewGroup$LayoutParams;)V

    new-instance v4, Landroid/widget/LinearLayout$LayoutParams;

    invoke-direct {v4, v1, v5, v6}, Landroid/widget/LinearLayout$LayoutParams;-><init>(IIF)V

    invoke-virtual {v0, v3, v4}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;Landroid/view/ViewGroup$LayoutParams;)V

    const/4 v4, 0x4

    invoke-virtual {p0, v4}, Lbr/com/guerravpn/crediflow/Ui;->dp(I)I

    move-result v5

    invoke-virtual {p0, v4}, Lbr/com/guerravpn/crediflow/Ui;->dp(I)I

    move-result v4

    invoke-virtual {v0, v1, v5, v1, v4}, Landroid/widget/LinearLayout;->setPadding(IIII)V

    invoke-virtual {p1, v0}, Landroid/widget/LinearLayout;->addView(Landroid/view/View;)V

    return-void
.end method

.method text(Ljava/lang/String;IIZ)Landroid/widget/TextView;
    .locals 3
    .param p1, "x"    # Ljava/lang/String;
    .param p2, "size"    # I
    .param p3, "c"    # I
    .param p4, "bold"    # Z

    .line 27
    new-instance v0, Landroid/widget/TextView;

    iget-object v1, p0, Lbr/com/guerravpn/crediflow/Ui;->a:Lbr/com/guerravpn/crediflow/MainActivityV06;

    invoke-direct {v0, v1}, Landroid/widget/TextView;-><init>(Landroid/content/Context;)V

    .local v0, "t":Landroid/widget/TextView;
    invoke-virtual {v0, p1}, Landroid/widget/TextView;->setText(Ljava/lang/CharSequence;)V

    int-to-float v1, p2

    invoke-virtual {v0, v1}, Landroid/widget/TextView;->setTextSize(F)V

    invoke-virtual {v0, p3}, Landroid/widget/TextView;->setTextColor(I)V

    if-eqz p4, :cond_0

    sget-object v1, Landroid/graphics/Typeface;->DEFAULT:Landroid/graphics/Typeface;

    const/4 v2, 0x1

    invoke-virtual {v0, v1, v2}, Landroid/widget/TextView;->setTypeface(Landroid/graphics/Typeface;I)V

    :cond_0
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
