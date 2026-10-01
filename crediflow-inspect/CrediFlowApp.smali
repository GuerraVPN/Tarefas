.class public final Lbr/com/guerravpn/crediflow/CrediFlowApp;
.super Landroid/app/Application;
.source "CrediFlowApp.java"


# direct methods
.method public constructor <init>()V
    .locals 0

    .line 5
    invoke-direct {p0}, Landroid/app/Application;-><init>()V

    return-void
.end method


# virtual methods
.method public onCreate()V
    .locals 0

    .line 7
    invoke-super {p0}, Landroid/app/Application;->onCreate()V

    .line 8
    invoke-static {p0}, Lbr/com/guerravpn/crediflow/Api;->init(Landroid/content/Context;)V

    .line 9
    return-void
.end method
